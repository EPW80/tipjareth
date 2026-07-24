import { Router } from "express";
import { body, query } from "express-validator";
import { isAddress } from "ethers";
import { validate } from "../middleware/validate";
import { listTips, submitTip } from "../controllers/tipController";

const router = Router();

router.post(
  "/",
  body("txHash")
    .isString()
    .matches(/^0x[0-9a-fA-F]{64}$/)
    .withMessage("txHash must be a 32-byte hex hash"),
  validate,
  submitTip
);

router.get(
  "/",
  query("creator").optional().custom((v) => isAddress(v)).withMessage("Invalid creator address"),
  validate,
  listTips
);

export default router;
