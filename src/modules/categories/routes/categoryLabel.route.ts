import { Router } from "express";
import {
  getCategoryLabels,
  createCategoryLabel,
  updateCategoryLabel,
  deleteCategoryLabel,
} from "../controllers/categoryLabel.controller";

const router = Router();

router.get("/", getCategoryLabels);
router.post("/", createCategoryLabel);
router.put("/:id", updateCategoryLabel);
router.delete("/:id", deleteCategoryLabel);

export default router;
