import { Router } from "express";
import * as rolCtrl from "../controllers/roles.controllers";
import { isAdmin,  verifyToken } from "../middlewares/authJwt";

const router = Router();

router.get('/', [verifyToken, isAdmin],rolCtrl.getRoles);

export default router;