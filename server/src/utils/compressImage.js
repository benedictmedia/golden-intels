/**
 * Compresses a single image file using the Canvas API.
 * - Resizes to max 1280px wide while keeping aspect ratio
 * - Converts to JPEG at 0.82 quality
 * - Skips compression if file is already under maxSizeMB
 */
export const compressImage = (file, { maxWidthPx = 1280, maxSizeMB = 1, quality = 0.82 } = {}) => {
  return new Promise((resolve) => {
    // Already small enough — skip compression
    if (file.size <= maxSizeMB * 1024 * 1024) {
      resolve(file)
      return
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target.result
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        // Scale down if wider than maxWidthPx
        if (width > maxWidthPx) {
          height = Math.round((height * maxWidthPx) / width)
          width = maxWidthPx
        }

        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
              type: 'image/jpeg',
              lastModified: Date.now()
            }))
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = () => resolve(file) // fallback: use original
    }
    reader.onerror = () => resolve(file) // fallback: use original
  })
}

// Compress multiple files at once
export const compressImages = (files, options = {}) =>
  Promise.all(Array.from(files).map(f => compressImage(f, options)))