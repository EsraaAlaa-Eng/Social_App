import { z } from 'zod'
import { generalFields } from '../../middleware/middleware.validation'


export const login = {

    body: z.strictObject({
        email: generalFields.email,
        password: generalFields.password,

    })


};


export const signup = {

    body: login.body
        .extend({

            username: generalFields.username,
            confirmPassword: generalFields.confirmPassword,

        }).superRefine((data, ctx) => {
            if (data.confirmPassword !== data.password) {
                ctx.addIssue({
                    code: "custom",
                    path: ["confirmPassword"],
                    message: "password misMatch confirmPassword"
                });
            }


            if (data.username?.trim().split(/\s+/)?.length != 2) {
                ctx.addIssue({
                    code: "custom",
                    path: ["fullName"],
                    message: "username must consist of 2 parts like ex:DONE DOE"
                });
            }
        })

};




export const signupWithGmail = {
    body: z.strictObject({
        idToken: z.string(),
    })
};


export const confirmEmail = {
    body: z.object({
        email: generalFields.email,
        otp: generalFields.otp,
    }),
};


export const sendForgotPasswordCode = {
    body: z.object({
        email: generalFields.email,
    })
};


export const verifyForgotPassword = {
    body: sendForgotPasswordCode.body.extend({
        otp: generalFields.otp,

    })
};

export const resetForgotPassword = {
    body: sendForgotPasswordCode.body.extend({
        otp: generalFields.otp,
        password: generalFields.password,
        confirmPassword: generalFields.confirmPassword,
    })
    .refine((data)=>{
        return data.password === data.confirmPassword

    },{message:"password mismatch confirm-password", path:['confirmPassword']}),
};



//     .refine(
//         (data)=>{
//             return data.confirmPassword===data.password;
//         },
//         {
//             error:"password misMatch confirmPassword"
//         }
//     )

// }