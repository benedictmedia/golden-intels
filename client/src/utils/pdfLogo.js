export function loadCircularLogoDataUrl(imageUrl, size = 512) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size

      const ctx = canvas.getContext('2d')
      const radius = size / 2

      ctx.save()
      ctx.beginPath()
      ctx.arc(radius, radius, radius, 0, Math.PI * 2)
      ctx.clip()
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, size, size)

      const scale = Math.min(size / img.width, size / img.height)
      const width = img.width * scale
      const height = img.height * scale
      const x = (size - width) / 2
      const y = (size - height) / 2

      ctx.drawImage(img, x, y, width, height)
      ctx.restore()

      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => resolve(null)
    img.src = imageUrl
  })
}
