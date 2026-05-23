export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const parts = await readMultipartFormData(event)
  if (!parts?.length) {
    throw createError({ statusCode: 400, message: 'No form data received' })
  }

  const filePart = parts.find(p => p.name === 'file')
  const pathPart = parts.find(p => p.name === 'blobPath')

  if (!filePart?.data || !pathPart?.data) {
    throw createError({ statusCode: 400, message: 'Missing file or blobPath field' })
  }

  const blobPath = pathPart.data.toString('utf-8')
  console.log('[upload-blob] Uploading to path:', blobPath)
  const putUrl   = `${config.public.blobBaseUrl}/${blobPath}${config.public.blobSasToken}`
  const mimeType = filePart.type ?? 'application/octet-stream'

  const res = await fetch(putUrl, {
    method: 'PUT',
    headers: {
      'x-ms-blob-type': 'BlockBlob',
      'Content-Type': mimeType,
    },
    // @ts-ignore — Node 18 fetch accepts Buffer
    body: filePart.data,
    duplex: 'half',
  } as RequestInit)

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw createError({ statusCode: 502, message: `Azure returned ${res.status}: ${detail}` })
  }

  return {
    url: `${config.public.blobBaseUrl}/${blobPath}${config.public.blobSasToken}`,
  }
})
