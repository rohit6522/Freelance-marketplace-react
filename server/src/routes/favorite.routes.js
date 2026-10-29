import { Router } from "express";
import { body, param } from "express-validator";
import { addFavorite, removeFavorite, favoriteIds, listFavorites } from "../controllers/favorite.controller.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();
router.use(protect);

router.get("/ids", favoriteIds); // before any "/:id" style route
router.get("/", listFavorites);
router.post("/", body("gigId").isMongoId().withMessage("A valid gig is required"), validate, addFavorite);
router.delete("/:gigId", param("gigId").isMongoId().withMessage("Invalid gig id"), validate, removeFavorite);

export default router;