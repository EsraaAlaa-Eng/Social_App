import { Router } from "express";
import authService from './auth.service'
import { validation } from "../../middleware/middleware.validation";
import * as validators from './auth.validation'
const router = Router();


router.post("/signup", validation(validators.signup), authService.signup)
router.patch('/confirm-email', authService.confirmEmail);


router.post("/signup-with-gmail", validation(validators.signupWithGmail), authService.signupWithGmail)
router.post("/login-gmail", validation(validators.signupWithGmail), authService.loginWithGmail)

router.post("/login", validation(validators.login), authService.login)

router.patch("/send-reset-password", validation(validators.sendForgotPasswordCode), authService.sendForgotCode)
router.patch("/verify-reset-password", validation(validators.verifyForgotPassword), authService.verifyForgotCode)
router.patch("/reset-forgot-password", validation(validators.resetForgotPassword), authService.resetForgotPassword)










export default router