import { Router } from 'express';
import * as addressController from '../controllers/address.controller';

const router = Router();

router.post('/', addressController.createAddress);
router.get('/user/:userId', addressController.getAddressesByUserId);
router.put('/:id', addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);

export default router;
