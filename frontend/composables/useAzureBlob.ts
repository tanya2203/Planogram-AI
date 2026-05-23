import { reactive } from 'vue'

export interface UploadState {
  uploading: boolean
  progress: number
  url: string | null
  preview: string | null
  error: string | null
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 10 * 1024 * 1024

function blankState(): UploadState {
  return { uploading: false, progress: 0, url: null, preview: null, error: null }
}

function clearState(s: UploadState) {
  if (s.preview && s.preview.startsWith('blob:')) URL.revokeObjectURL(s.preview)
  Object.assign(s, blankState())
}

export function useAzureBlob() {
  const frontState = reactive<UploadState>(blankState())
  const backState  = reactive<UploadState>(blankState())
  const leftState  = reactive<UploadState>(blankState())

  function getState(side: 'front' | 'back' | 'left'): UploadState {
    return side === 'front' ? frontState : side === 'back' ? backState : leftState
  }

  function uploadFile(file: File, side: 'front' | 'back' | 'left', skuName: string) {
    const state = getState(side)

    if (!ALLOWED_TYPES.includes(file.type)) {
      state.error = 'Only JPG, PNG or WebP images are allowed'
      return
    }
    if (file.size > MAX_BYTES) {
      state.error = 'File must be under 10 MB'
      return
    }

    const folder   = skuName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'new-sku'
    const ext      = file.name.split('.').pop() ?? 'jpg'
    const blobPath = `packshots/${folder}/${side}_${Date.now()}.${ext}`

    // immediate blob preview so the UI is responsive while uploading
    state.preview  = URL.createObjectURL(file)
    state.uploading = true
    state.progress  = 0
    state.error     = null
    state.url       = null

    const formData = new FormData()
    formData.append('file', file)
    formData.append('blobPath', blobPath)

    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) state.progress = Math.round((e.loaded / e.total) * 100)
    })

    xhr.addEventListener('load', () => {
      state.uploading = false
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText)
          state.url      = data.url
          state.progress = 100
        } catch {
          state.error   = 'Unexpected server response'
          state.preview = null
        }
      } else {
        let msg = `Upload failed (${xhr.status})`
        try { msg = JSON.parse(xhr.responseText).message || msg } catch {}
        state.error   = msg
        state.preview = null
      }
    })

    xhr.addEventListener('error', () => {
      state.uploading = false
      state.error     = 'Network error — check connection and try again'
      state.preview   = null
    })

    xhr.open('POST', '/api/upload-blob')
    xhr.send(formData)
  }

  function removeFile(side: 'front' | 'back' | 'left') {
    clearState(getState(side))
  }

  function reset() {
    clearState(frontState)
    clearState(backState)
    clearState(leftState)
  }

  return { frontState, backState, leftState, uploadFile, removeFile, reset }
}
