// Lightweight client-side image compression helper
// Uses canvas to resize and convert images to WebP/JPEG with quality control.
export async function compressFile(file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) {
  if (!file || !file.type || !file.type.startsWith('image/')) return file

  // Load image (createImageBitmap is faster when available)
  let imgBitmap = null
  try {
    imgBitmap = await createImageBitmap(file)
  } catch (err) {
    imgBitmap = null
  }

  let width, height, drawSource
  if (imgBitmap) {
    width = imgBitmap.width
    height = imgBitmap.height
    drawSource = imgBitmap
  } else {
    // Fallback: load via Image
    const dataUrl = await new Promise((res, rej) => {
      const reader = new FileReader()
      reader.onload = () => res(reader.result)
      reader.onerror = rej
      reader.readAsDataURL(file)
    })
    const img = await new Promise((res, rej) => {
      const i = new Image()
      i.onload = () => res(i)
      i.onerror = rej
      i.src = dataUrl
    })
    width = img.width
    height = img.height
    drawSource = img
  }

  // Compute resize ratio
  const ratio = Math.min(1, maxWidth / width, maxHeight / height)
  const outW = Math.max(1, Math.round(width * ratio))
  const outH = Math.max(1, Math.round(height * ratio))

  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d')
  ctx.drawImage(drawSource, 0, 0, outW, outH)

  // Prefer webp where available, fallback to jpeg
  let blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality))
  if (!blob) blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
  if (!blob) return file

  // Keep original filename but update extension to match output type
  const ext = blob.type.split('/')[1] || 'jpg'
  const baseName = file.name.replace(/\.[^.]+$/, '')
  const newName = `${baseName}.${ext}`

  try {
    return new File([blob], newName, { type: blob.type })
  } catch (err) {
    // Older browsers may not support File constructor
    blob.lastModifiedDate = new Date()
    blob.name = newName
    return blob
  }
}

export default compressFile
