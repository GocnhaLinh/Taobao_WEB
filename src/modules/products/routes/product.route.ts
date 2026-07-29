import { Router } from 'express';
import * as productController from '../controllers/product.controller';

const router = Router();

// Variants (MUST come before generic /:id routes)
router.post('/variants', productController.addProductVariant);
router.put('/variants/:id', productController.updateProductVariant);
router.delete('/variants/:id', productController.deleteProductVariant);

// Products
router.post('/', productController.createProduct);
router.get('/', productController.getProducts);
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;
