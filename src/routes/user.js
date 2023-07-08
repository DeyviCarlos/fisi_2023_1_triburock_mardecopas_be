import { Router } from "express";
import * as userCtrl from "../controllers/user.controller";
import { isAdmin, isJefeAlmacen, verifyToken } from "../middlewares/authJwt";
import { checkExistingUser } from "../middlewares/verifySignUp";

const router = Router();
// ROUTES
router.get('/obtener-usuarios-habilitados', [verifyToken, isAdmin],userCtrl.getUsers);
router.get('/obtener-usuarios-deshabilitados',[verifyToken, isAdmin], userCtrl.getUsersInhabiltados);
router.get('/obtener-usuarios-por-dni/:dni', [verifyToken, isAdmin],userCtrl.getUserDni);
router.post("/agregar-usuarios",[verifyToken, isAdmin,checkExistingUser], userCtrl.createUser);
router.put("/actualizar-usuarios/:_id", [verifyToken, isAdmin], userCtrl.updateUserById);
router.put("/dar-baja-usuarios/:_id", [verifyToken, isAdmin],userCtrl.updateUserInhabilitar);
router.put("/dar-alta-usuarios/:_id",[verifyToken, isAdmin],  userCtrl.updateUserHabilitar);
export default router;