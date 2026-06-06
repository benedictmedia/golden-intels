/**
 * Compresses a single image file using the Canvas API.
 */
export const compressImage = (file, { maxWidthPx = 1280, maxSizeMB = 1, quality = 0.82 } = {}) => {
  return new Promise((resolve) => {
    if (file.size <= maxSizeMB * 1024 * 1024) { resolve(file); return }
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target.result
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        if (width > maxWidthPx) { height = Math.round((height * maxWidthPx) / width); width = maxWidthPx }
        canvas.width = width; canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg', lastModified: Date.now() })),
          'image/jpeg', quality
        )
      }
      img.onerror = () => resolve(file)
    }
    reader.onerror = () => resolve(file)
  })
}

export const compressImages = (files, options = {}) =>
  Promise.all(Array.from(files).map(f => compressImage(f, options)))

export default compressImage