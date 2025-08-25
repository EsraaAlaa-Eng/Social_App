import { Router } from "express";
import authService from './auth.service'
import { validation } from "../middleware/middleware.validation";
import * as validators from './auth.validation'
const router = Router();


router.post("/signup", validation(validators.signup), authService.signup)
router.post("/login", validation(validators.login), authService.login)
router.patch('/confirm-email', authService.confirmEmail);









export default router