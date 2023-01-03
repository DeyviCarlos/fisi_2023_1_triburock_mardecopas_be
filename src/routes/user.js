import { Router } from "express";
import * as userCtrl from "../controllers/user.controller";
import { isAdmin, isJefeAlmacen, verifyToken } from "../middlewares/authJwt";
import { checkExistingUser } from "../middlewares/verifySignUp";

const router = Router();
// ROUTES
router.get('/', [verifyToken, isAdmin],userCtrl.getUsers);
router.get('/inhabilitados',[verifyToken, isAdmin], userCtrl.getUsersInhabiltados);
router.get('/read/:dni', [verifyToken, isAdmin],userCtrl.getUserDni);
router.post("/create",[verifyToken, isAdmin,checkExistingUser], userCtrl.createUser);
router.put("/update/:_id", [verifyToken, isAdmin], userCtrl.updateUserById);
router.put("/inhabilitar/:_id", [verifyToken, isAdmin],userCtrl.updateUserInhabilitar);
router.put("/habilitar/:_id",[verifyToken, isAdmin],  userCtrl.updateUserHabilitar);
export default router;