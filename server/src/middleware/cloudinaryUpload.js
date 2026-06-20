const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const multer = require('multer')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const createStorage = (folder, options = {}) => new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const params = {
      folder: `goldenintels/${folder}`,
      resource_type: 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'docx'],
    }

    if (options.transform !== false) {
      params.transformation = [
          { quality: 'auto:low', fetch_format: 'auto' },
          { width: 1920, height: 1080, crop: 'limit' }
        ]
    }

    return params
  },
})

const createAdmissionsStorage = () => new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isDocument = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ].includes(file.mimetype)

    const ext = file.originalname.split('.').pop().toLowerCase()
    const publicId = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`

    return {
      folder: 'goldenintels/admissions',
      public_id: publicId,
      resource_type: isDocument ? 'raw' : 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx'],
      ...(isDocument ? {} : {
      transformation: [
        { quality: 'auto:good', fetch_format: 'auto' },
        { width: 1920, height: 1080, crop: 'limit' }
      ],
      }),
    }
  },
})

const uploadStudentPhoto = multer({ storage: createStorage('students'), limits: { fileSize: 10 * 1024 * 1024 } })
const uploadGallery = multer({ storage: createStorage('gallery'), limits: { fileSize: 10 * 1024 * 1024 } })
const uploadNews = multer({ storage: createStorage('news'), limits: { fileSize: 10 * 1024 * 1024 } })
const uploadStaff = multer({ storage: createStorage('staff'), limits: { fileSize: 10 * 1024 * 1024 } })
const uploadAdmissions = multer({ storage: createAdmissionsStorage(), limits: { fileSize: 25 * 1024 * 1024 } })

module.exports = { cloudinary, uploadStudentPhoto, uploadGallery, uploadNews, uploadStaff, uploadAdmissions }
