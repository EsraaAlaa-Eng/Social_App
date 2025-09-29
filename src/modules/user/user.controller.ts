import { Router } from "express";
import userService from "./user.service";
import { authentication, authorization } from "../../middleware/authentication.middleware";
import { validation } from "../../middleware/middleware.validation"
import * as validators from "./user.validation"
import { TokenEnum } from "../../utils/security/token.security";
import { cloudFileUpload, fileValidation, StorageEnum } from "../../utils/multer/cloud.multer";
import { endpoint } from "./user.authorization";
const router = Router();

router.get("/", authentication(), userService.profile)
router.post("/logout", authentication(), validation(validators.logout), userService.logout)

router.patch("/profile-image",
    authentication(),
    cloudFileUpload({
        validation: fileValidation.image,
        storageApproach: StorageEnum.memory
    }).single("image"),
    userService.profileImage)


router.delete("{/:userId}/freeze-account", authentication(), validation(validators.freezeAccount), userService.freezeAccount)

router.delete("/:userId", authorization(endpoint.hardDeleteAccount), validation(validators.hardDeleteAccount), userService.hardDeleteAccount)

router.patch("/:userId/restore-account", authorization(endpoint.restoreAccount), validation(validators.restoreAccount), userService.restoreAccount)

router.patch("/profile-cover-image",
    authentication(),
    cloudFileUpload({
        validation: fileValidation.image,
        storageApproach: StorageEnum.disk
    }).array("images", 2), userService.profileCoverImage)

router.get("/refresh-token", authentication(TokenEnum.refresh), userService.refreshToken)

export default router
