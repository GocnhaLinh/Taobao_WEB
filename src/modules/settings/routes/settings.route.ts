import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller';

const router = Router();

router.get('/exchange-rate', settingsController.getExchangeRate);
router.post('/exchange-rate', settingsController.updateExchangeRate);

router.get('/fees', settingsController.getFeeConfig);
router.post('/fees', settingsController.saveFeeConfig);
router.put('/fees', settingsController.saveFeeConfig);

export default router;
