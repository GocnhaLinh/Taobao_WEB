import multer from 'multer';
import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary';

// Setup multer in-memory storage (does not write to local disk)
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export interface CloudinaryUploadResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  type: string;
  url: string;
  secure_url: string;
}

/**
 * Streams an in-memory file buffer directly to Cloudinary
 */
export const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder = 'ecommerce'
): Promise<CloudinaryUploadResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result as CloudinaryUploadResponse);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

/**
 * Deletes an image from Cloudinary by its public ID
 */
export const deleteFromCloudinary = (publicId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
};

/**
 * Extracts the public ID from a Cloudinary URL
 */
export const extractPublicId = (url: string): string | null => {
  if (!url || !url.includes('cloudinary.com')) return null;
  try {
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    const publicIdWithExt = lastPart.split('.')[0];
    
    const uploadIndex = parts.findIndex(part => part === 'upload');
    if (uploadIndex !== -1 && parts[uploadIndex + 1]?.startsWith('v')) {
      const folderParts = parts.slice(uploadIndex + 2, parts.length - 1);
      if (folderParts.length > 0) {
        return [...folderParts, publicIdWithExt].join('/');
      }
    }
    return publicIdWithExt;
  } catch (error) {
    return null;
  }
};
