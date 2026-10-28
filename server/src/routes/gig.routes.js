import { Router } from "express";
import {
  listGigs, getGig, myGigs, createGig, updateGig, setGigStatus, deleteGig,
} from "../controllers/gig.controller.js";
import { protect, authorize, optionalAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idRule, gigBodyRules, statusRule, listGigsRules } from "../validators/gig.validators.js";

const router = Router();
const seller = [protect, authorize("freelancer")];

router.get("/", listGigsRules, validate, listGigs);
router.get("/mine", ...seller, myGigs); // must be before "/:id"
router.get("/:id", optionalAuth, idRule, validate, getGig);

router.post("/", ...seller, gigBodyRules, validate, createGig);
router.put("/:id", ...seller, idRule, gigBodyRules, validate, updateGig);
router.patch("/:id/status", ...seller, idRule, statusRule, validate, setGigStatus);
router.delete("/:id", ...seller, idRule, validate, deleteGig);

export default router;
