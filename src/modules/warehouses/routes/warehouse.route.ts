import { Router } from "express";
import * as warehouseController from "../controllers/warehouse.controller";

const router = Router();

router.post("/", warehouseController.createWarehouse);
router.get("/", warehouseController.getWarehouses);
router.post("/select-by-address", warehouseController.selectWarehouseByAddress);
router.get("/:id", warehouseController.getWarehouseById);
router.put("/:id", warehouseController.updateWarehouse);
router.delete("/:id", warehouseController.deleteWarehouse);

export default router;
