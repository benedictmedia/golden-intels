export function loadCircularLogoDataUrl(imageUrl, size = 512) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const sourceCanvas = document.createElement('canvas')
      sourceCanvas.width = img.width
      sourceCanvas.height = img.height

      const sourceCtx = sourceCanvas.getContext('2d')
      sourceCtx.drawImage(img, 0, 0)

      const crop = getNonWhiteBounds(sourceCtx, img.width, img.height)
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size

      const ctx = canvas.getContext('2d')
      const radius = size / 2

      ctx.save()
      ctx.beginPath()
      ctx.arc(radius, radius, radius, 0, Math.PI * 2)
      ctx.clip()

      const scale = Math.min(size / crop.width, size / crop.height)
      const width = crop.width * scale
      const height = crop.height * scale
      const x = (size - width) / 2
      const y = (size - height) / 2

      ctx.drawImage(
        sourceCanvas,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        x,
        y,
        width,
        height
      )
      ctx.restore()

      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => resolve(null)
    img.src = imageUrl
  })
}

function getNonWhiteBounds(ctx, width, height) {
  const { data } = ctx.getImageData(0, 0, width, height)
  let minX = width
  let minY = height
  let maxX = 0
  let maxY = 0

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4
      const alpha = data[index + 3]
      const red = data[index]
      const green = data[index + 1]
      const blue = data[index + 2]
      const isWhite = red > 245 && green > 245 && blue > 245

      if (alpha > 10 && !isWhite) {
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }
  }

  if (minX > maxX || minY > maxY) {
    return { x: 0, y: 0, width, height }
  }

  const padding = Math.ceil(Math.max(width, height) * 0.01)
  const x = Math.max(0, minX - padding)
  const y = Math.max(0, minY - padding)
  const right = Math.min(width, maxX + padding)
  const bottom = Math.min(height, maxY + padding)

  return {
    x,
    y,
    width: right - x,
    height: bottom - y,
  }
}
