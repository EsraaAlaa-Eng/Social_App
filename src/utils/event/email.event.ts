import { EventEmitter } from "node:events";
import Mail from "nodemailer/lib/mailer";
import { sendEmail } from "../email/send.email";
import { verifyEmail } from "./verify.template.email"

export const emailEvent = new EventEmitter();


interface IEmail extends Mail.Options {
    otp: number;
}

emailEvent.on("confirmEmail", async (data: IEmail) => {
    try {

        console.log("DEBUG emailEvent data:", data);
        data.html = verifyEmail({ otp: data.otp, title: "Email confirmation" })

        await sendEmail(data)

    } catch (error) {
        console.log(`fail to send email`, error);
    }
})