import { Router } from 'express';
import * as brandController from '../controllers/brand.controller';

const router = Router();

router.post('/', brandController.createBrand);
router.get('/', brandController.getBrands);
router.get('/all', brandController.getAllBrands);
router.get('/:id', brandController.getBrandById);
router.put('/:id', brandController.updateBrand);
router.delete('/:id', brandController.deleteBrand);

export default router;
