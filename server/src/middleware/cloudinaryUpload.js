const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const multer = require('multer')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const createStorage = (folder) => new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: `goldenintels/${folder}`,
      resource_type: 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'docx'],
      transformation: [
        { quality: 'auto:low', fetch_format: 'auto' },
        { width: 1920, height: 1080, crop: 'limit' }
      ],
    }
  },
})

const uploadStudentPhoto = multer({
  storage: createStorage('students'),
  limits: { fileSize: 10 * 1024 * 1024 }
})

const uploadGallery = multer({
  storage: createStorage('gallery'),
  limits: { fileSize: 10 * 1024 * 1024 }
})

const uploadNews = multer({
  storage: createStorage('news'),
  limits: { fileSize: 10 * 1024 * 1024 }
})

const uploadStaff = multer({
  storage: createStorage('staff'),
  limits: { fileSize: 10 * 1024 * 1024 }
})

const uploadAdmissions = multer({
  storage: createStorage('admissions'),
  limits: { fileSize: 10 * 1024 * 1024 }
})

module.exports = {
  cloudinary,
  uploadStudentPhoto,
  uploadGallery,
  uploadNews,
  uploadStaff,
  uploadAdmissions,
}