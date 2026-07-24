import { Router } from "express";
import { body, param } from "express-validator";
import { isAddress } from "ethers";
import { validate } from "../middleware/validate";
import {
  createCreator,
  getCreator,
  getCreatorStats,
  listCreators,
} from "../controllers/creatorController";

const router = Router();

const walletAddressParam = param("walletAddress")
  .custom((v) => isAddress(v))
  .withMessage("Invalid wallet address");

router.post(
  "/",
  body("walletAddress").custom((v) => isAddress(v)).withMessage("Invalid wallet address"),
  body("username")
    .isString()
    .trim()
    .matches(/^[a-zA-Z0-9_]{3,30}$/)
    .withMessage("Username must be 3-30 characters (letters, numbers, underscore)"),
  body("bio").optional().isString().trim().isLength({ max: 500 }),
  body("avatarUrl").optional().isURL().withMessage("avatarUrl must be a valid URL"),
  validate,
  createCreator
);

router.get("/", listCreators);
router.get("/:walletAddress", walletAddressParam, validate, getCreator);
router.get("/:walletAddress/stats", walletAddressParam, validate, getCreatorStats);

export default router;
