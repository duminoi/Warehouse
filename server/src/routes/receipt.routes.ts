import { Router } from "express";
import { receiptController } from "../controllers/receipt.controller";

const router = Router();

router.get("/", (req, res) => receiptController.getAll(req, res));
router.get("/stats", (req, res) => receiptController.getStats(req, res));
router.get("/:id", (req, res) => receiptController.getById(req, res));
router.post("/", (req, res) => receiptController.create(req, res));
router.delete("/:id", (req, res) => receiptController.delete(req, res));

export default router;
