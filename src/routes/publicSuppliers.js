import express from "express"
import {
  getSuppliers,
  getSupplierShowroom,
} from "../controllers/publicSupplierController.js"

const router = express.Router()

router.get("/", getSuppliers)
router.get("/:slug", getSupplierShowroom)

export default router
