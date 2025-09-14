
// export interface ISignupBodyInputsDTO {
//     username: string;
//     email: string;
//     password: string;
// }

// export interface IConfirmEmailBodyInputsDTO {
//     email: string,
//     otp: string
// }

import * as validators from "./auth.validation"
import {z} from "zod";

export type ISignupBodyInputsDTO = z.infer<typeof validators.signup.body >;
export type IConfirmEmailBodyInputsDTO = z.infer<typeof validators.confirmEmail.body >;
export type ISendForgotCodeBodyInputsDTO = z.infer<typeof validators.sendForgotPasswordCode.body >;
export type IVerifyForgotCodeBodyInputsDTO = z.infer<typeof validators.verifyForgotPassword.body >;
export type IResetForgotCodeBodyInputsDTO = z.infer<typeof validators.resetForgotPassword.body >;
export type ILoginBodyInputsDTO = z.infer<typeof validators.login.body >;
export type IGmailBodyInputsDTO = z.infer<typeof validators.signupWithGmail.body >;
