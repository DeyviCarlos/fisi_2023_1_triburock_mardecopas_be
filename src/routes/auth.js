import { Router } from 'express';

const router = Router();

import * as authCtrl from '../controllers/auth.controllers';
import { checkExistingUser } from '../middlewares/verifySignUp';
// import {checkExistingRole,checkExistingUser } from "../middlewares/verifySignUp";
// Definimos las rutas::
router.post('/signUp',[checkExistingUser], authCtrl.signUp);
router.post('/signIn', authCtrl.signIn);

export default router;
