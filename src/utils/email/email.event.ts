import { EventEmitter } from "node:events";
import Mail from "nodemailer/lib/mailer";
import { sendEmail } from "./send.email";
import { verifyEmail } from "./verify.template.email"

export const emailEvent = new EventEmitter();


interface IEmail extends Mail.Options {
    otp: number;
}

emailEvent.on("confirmEmail", async (data: IEmail) => {
    try {

        data.subject = "Confirm-Email"
        console.log("DEBUG emailEvent data:", data);
        data.html = verifyEmail({ otp: data.otp, title: "Email confirmation" })

        await sendEmail(data)

    } catch (error) {
        console.log(`fail to send email`, error);
    }

})
emailEvent.on("resetPassword", async (data: IEmail) => {
    try {

        data.subject = "Reset-Account-Password"
        console.log("DEBUG emailEvent data:", data);
        data.html = verifyEmail({ otp: data.otp, title: "Reset Code" })

        await sendEmail(data)

    } catch (error) {
        console.log(`fail to send email`, error);
    }
})