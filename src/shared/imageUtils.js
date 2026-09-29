export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()

    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    image.src = src
  })
}

export function isColorDark(hex) {
  const normalizedHex = hex.replace(/^#/, '')

  if (!/^[0-9a-f]{6}$/i.test(normalizedHex)) {
    throw new TypeError(`Invalid hexadecimal color: ${hex}`)
  }

  const value = Number.parseInt(normalizedHex, 16)
  const red = (value >> 16) & 0xff
  const green = (value >> 8) & 0xff
  const blue = value & 0xff
  const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue

  return luminance < 128
}