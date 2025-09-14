import { Router } from "express";
import userService from "./user.service";
import { authentication } from "../../middleware/authentication.middleware";
import { validation } from "../../middleware/middleware.validation"
import * as validators from "./user.validation"
import { TokenEnum } from "../../utils/security/token.security";
const router = Router();

router.get("/", authentication(), userService.profile)
router.post("/logout", authentication(),validation(validators.logout), userService.logout)
router.get("/refresh-token", authentication(TokenEnum.refresh), userService.refreshToken)

export default router
