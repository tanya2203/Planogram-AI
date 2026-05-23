// GET /api/ideal-image?assetId=1&view=front
// Returns { url } if the file exists in Azure, or { url: null } if not found.
export default defineEventHandler(async (event) => {
  const config  = useRuntimeConfig()
  const query   = getQuery(event)
  const assetId = String(query.assetId ?? '1')
  const view    = String(query.view ?? 'front')

  const blobPath = `ideal-planograms/asset-${assetId}/${view}.jpg`
  const checkUrl = `${config.public.blobBaseUrl}/${blobPath}${config.public.blobSasToken}`

  console.log('[ideal-image] Checking Azure path:', blobPath)

  try {
    const res = await fetch(checkUrl, { method: 'HEAD' })
    if (res.ok) {
      return { url: checkUrl }
    }
    return { url: null }
  } catch {
    return { url: null }
  }
})
