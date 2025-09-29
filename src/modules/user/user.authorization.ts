import { RoleEnum } from "../../DB/models/user.model";



export const endpoint = {
    profile: [RoleEnum.user],
    restoreAccount: [RoleEnum.admin],
    hardDeleteAccount: [RoleEnum.admin],
}