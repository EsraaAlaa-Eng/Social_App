import { Router } from "express";
import userService from "./user.service";
import { authentication } from "../../middleware/authentication.middleware";
import { validation } from "../../middleware/middleware.validation"
import * as validators from "./user.validation"
const router = Router();

router.get("/", authentication(), userService.profile)
router.post("/logout", validation(validators.logout), userService.logout)

export default router
