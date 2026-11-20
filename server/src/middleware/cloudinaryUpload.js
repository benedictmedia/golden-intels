const cloudinary = require('cloudinary').v2
const CloudinaryStorage = require('multer-storage-cloudinary')
const multer = require('multer')
const fs = require('fs')
const path = require('path')

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

// Field-level validation: signedBooklet must be PDF; all other admission-style
// uploads (photo, NHIS, Ghana card) must be images.
const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']

const admissionsFileFilter = (req, file, cb) => {
  if (file.fieldname === 'signedBooklet') {
    if (file.mimetype === 'application/pdf') return cb(null, true)
    return cb(new Error('PDF_ONLY'))
  }
  if (ALLOWED_IMAGE_MIMES.includes(file.mimetype)) return cb(null, true)
  return cb(new Error('IMAGE_ONLY'))
}

// Shared storage factory for the admission-style document set (photo, NHIS
// card, Ghana card, signed booklet). Used both for the public admissions
// form and for a learner's profile documents in the admin dashboard — only
// the destination folder differs.
const createDocumentsStorage = (folder) => new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isPdf = file.mimetype === 'application/pdf'
    const publicId = `${Date.now()}-${Math.round(Math.random() * 1e9)}`

    return {
      folder: `goldenintels/${folder}`,
      public_id: publicId,
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
      ...(isPdf ? {} : {
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
const uploadAdmissions = multer({
  storage: createDocumentsStorage('admissions'),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: admissionsFileFilter
})
// Learner profile documents (photo + NHIS/Ghana card + signed booklet),
// editable by the admin at any time from the Learner Profile screen.
const uploadStudentDocuments = multer({
  storage: createDocumentsStorage('students'),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: admissionsFileFilter
})

const portfolioImageFilter = (req, file, cb) => {
  const allowedExtensions = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp']
  }
  const extensions = allowedExtensions[file.mimetype]
  if (extensions?.includes(path.extname(file.originalname).toLowerCase())) return cb(null, true)
  return cb(new Error('IMAGE_ONLY'))
}

const cloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
)
let portfolioEvidenceStorage
if (cloudinaryConfigured) {
  portfolioEvidenceStorage = createStorage('portfolio-evidence', { transform: false })
} else if (process.env.NODE_ENV !== 'production') {
  const portfolioUploadDir = path.join(__dirname, '../../uploads/portfolio-evidence')
  fs.mkdirSync(portfolioUploadDir, { recursive: true })
  portfolioEvidenceStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, portfolioUploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`)
  })
}

const uploadPortfolioEvidence = portfolioEvidenceStorage
  ? multer({
    storage: portfolioEvidenceStorage,
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: portfolioImageFilter
  })
  : null

module.exports = {
  cloudinary,
  uploadStudentPhoto,
  uploadGallery,
  uploadNews,
  uploadStaff,
  uploadAdmissions,
  uploadStudentDocuments,
  uploadPortfolioEvidence
}