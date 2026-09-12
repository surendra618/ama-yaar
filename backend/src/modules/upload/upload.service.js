const fs = require('fs');
const path = require('path');
const cloudinary = require('../../config/cloudinary');
const env = require('../../config/env');
const ApiError = require('../../utils/ApiError');

async function uploadImage(file) {
  if (!file) {
    throw new ApiError(400, 'No image file provided');
  }

  // Try Cloudinary if configured
  if (env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret) {
    try {
      const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      const result = await cloudinary.uploader.upload(base64, {
        folder: 'ama-yaar',
        resource_type: 'image',
      });
      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      };
    } catch (err) {
      console.warn('Cloudinary upload failed, using local storage fallback:', err.message);
    }
  }

  // Fallback: Save locally to public/uploads
  const uploadDir = path.join(__dirname, '../../../public/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const ext = path.extname(file.originalname) || '.jpg';
  const filename = `img-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const filePath = path.join(uploadDir, filename);

  fs.writeFileSync(filePath, file.buffer);

  return {
    url: `/uploads/${filename}`,
    filename,
  };
}

module.exports = { uploadImage };
