function getDefaultBaseUrl() {
  if (typeof import.meta.env === 'undefined') return '/'

  return import.meta.env.BASE_URL
}

export function getPublicAssetUrl(path, baseUrl = getDefaultBaseUrl()) {
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  const normalizedPath = path.replace(/^\/+/, '')

  return `${normalizedBaseUrl}${normalizedPath}`
}
