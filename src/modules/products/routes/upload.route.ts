import { Router, Request, Response } from 'express';
import { upload, uploadToCloudinary, extractPublicId, deleteFromCloudinary } from '../../../middlewares/upload.middleware';

const router = Router();

// Endpoint for single image upload
router.post('/single', upload.single('image'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Vui lòng chọn một file ảnh để tải lên.' });
      return;
    }

    const folder = (req.query.folder as string) || 'ecommerce';
    const result = await uploadToCloudinary(req.file.buffer, folder);

    res.json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint for multiple images upload
router.post('/multiple', upload.array('images', 10), async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      res.status(400).json({ error: 'Vui lòng chọn ít nhất một file ảnh để tải lên.' });
      return;
    }

    const folder = (req.query.folder as string) || 'ecommerce';

    // Upload all files concurrently
    const uploadPromises = files.map((file) => uploadToCloudinary(file.buffer, folder));
    const results = await Promise.all(uploadPromises);

    const uploadedImages = results.map((result) => ({
      url: result.secure_url,
      public_id: result.public_id,
    }));

    res.json(uploadedImages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint for deleting image from Cloudinary
router.delete('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { url, publicId } = req.query;
    let targetPublicId = publicId as string | undefined;

    if (!targetPublicId && url) {
      targetPublicId = extractPublicId(url as string) || undefined;
    }

    if (!targetPublicId) {
      res.status(400).json({ error: 'Vui lòng cung cấp publicId hoặc url của ảnh cần xóa.' });
      return;
    }

    const result = await deleteFromCloudinary(targetPublicId);
    res.json({ message: 'Xóa ảnh thành công.', result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
