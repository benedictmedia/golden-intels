/**
 * Compresses a single image file using the Canvas API.
 */
export const compressImage = (file, { maxWidthPx = 1280, maxSizeMB = 1, quality = 0.82, force = false } = {}) => {
  return new Promise((resolve, reject) => {
    if (!force && file.size <= maxSizeMB * 1024 * 1024) { resolve(file); return }
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
        const context = canvas.getContext('2d')
        if (!context) {
          reject(new Error('Could not prepare image canvas'))
          return
        }
        context.drawImage(img, 0, 0, width, height)
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Could not encode image'))
            return
          }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg', lastModified: Date.now() }))
        }, 'image/jpeg', quality)
      }
      img.onerror = () => force ? reject(new Error('Could not read image')) : resolve(file)
    }
    reader.onerror = () => force ? reject(new Error('Could not read image file')) : resolve(file)
  })
}

export const compressImages = (files, options = {}) =>
  Promise.all(Array.from(files).map(f => compressImage(f, options)))

export default compressImage