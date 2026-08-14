import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3Client, S3_BUCKET } from '../config/s3.js';

// Note: additional magic-byte verification happens in s3Service.js
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
  }
};

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const folderId = req.params.id || 'temp';
      cb(null, `products/${folderId}/${Date.now()}-${file.originalname}`);
    },
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export { upload };
