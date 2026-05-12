import { Router } from "express";
import { warehouseController } from "../controllers/warehouse.controller";

const router = Router();

router.get("/", (req, res) => warehouseController.getAll(req, res));
router.get("/:id", (req, res) => warehouseController.getById(req, res));
router.post("/", (req, res) => warehouseController.create(req, res));
router.delete("/:id", (req, res) => warehouseController.delete(req, res));

export default router;
