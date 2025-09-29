import logout, { freezeAccount, hardDeleteAccount, restoreAccount } from "./user.validation";
import { z } from "zod"

export type ILogoutDTO = z.infer<typeof logout.body>
export type IFreezeAccountDTO = z.infer<typeof freezeAccount.params>
export type IRestoreAccountDTO = z.infer<typeof restoreAccount.params>
export type IHardDeleteAccountDTO = z.infer<typeof hardDeleteAccount.params>