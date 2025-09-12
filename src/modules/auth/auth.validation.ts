import { z } from 'zod'
import { generalFields } from '../../middleware/middleware.validation'


export const login = {

    body: z.strictObject({
        email: generalFields.email,
        password: generalFields.password,

    })


}


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

}


//     .refine(
//         (data)=>{
//             return data.confirmPassword===data.password;
//         },
//         {
//             error:"password misMatch confirmPassword"
//         }
//     )

// }