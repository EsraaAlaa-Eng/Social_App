import { Request, Response } from "express"
import { IConfirmEmailBodyInputsDTO, IGmailBodyInputsDTO, ILoginBodyInputsDTO, IResetForgotCodeBodyInputsDTO, ISendForgotCodeBodyInputsDTO, ISignupBodyInputsDTO, IVerifyForgotCodeBodyInputsDTO } from "./auth.DTO";
import { ProviderEnum, UserModel } from '../../DB/models/user.model'
import { BadRequestException, ConflictException, NotFoundException } from "../../utils/response/error.response";
import { generateOtp } from '../../utils/generateOtp';
import { UserRepository } from "../../DB/repository/user.repository";
import { compareHash, generateHash } from "../../utils/security/hash.security";
import { emailEvent } from "../../utils/event/email.event";
import { createLoginCredentials } from "../../utils/security/token.security";
import { OAuth2Client, TokenPayload } from 'google-auth-library';



class AuthenticationService {

    private userModel = new UserRepository(UserModel);
    constructor() { }


    private async verifyGmailAccount(idToken: string): Promise<TokenPayload> {

        const client = new OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.WEB_CLIENT_ID?.split(",") || [],
        });
        const payload = ticket.getPayload();
        if (!payload?.email_verified) {
            throw new BadRequestException("Fail to verify this google account")
        }
        return payload;

    }


    signupWithGmail = async (req: Request, res: Response): Promise<Response> => {

        const { idToken }: IGmailBodyInputsDTO = req.body;
        const { email, family_name, given_name, picture }: TokenPayload = await this.verifyGmailAccount(idToken)


        const user = await this.userModel.findOne({
            filter: {
                email
            }
        });

        if (user) {
            if (user.provider === ProviderEnum.GOOGLE) {
                return await this.loginWithGmail(req, res)

            }

            throw new ConflictException(`Email exist with another provider ${user.provider}`)
        }


        const [newUser] = await this.userModel.create({
            data: [
                {
                    email: email as string,
                    firstName: given_name as string,
                    lastName: family_name as string,
                    ProfileImage: picture as string,
                    confirmedAt: new Date(),
                    provider: ProviderEnum.GOOGLE,
                },
            ]
        }) || []

        if (!newUser) {
            throw new BadRequestException("fail to signup with gmail please try again later")
        }

        const credentials = await createLoginCredentials(newUser)
        return res.status(201).json({ message: "Done", data: { credentials } })
    };



    loginWithGmail = async (req: Request, res: Response): Promise<Response> => {

        const { idToken }: IGmailBodyInputsDTO = req.body;
        const { email }: TokenPayload = await this.verifyGmailAccount(idToken)


        const user = await this.userModel.findOne({
            filter: {
                email,
                provider: ProviderEnum.GOOGLE
            }
        });

        if (!user) {
            throw new NotFoundException("Not register account or registered with another provider")
        }

        const credentials = await createLoginCredentials(user)
        return res.status(201).json({ message: "Done", data: { credentials } })
    }


    signup = async (req: Request, res: Response): Promise<Response> => {


        let { username, email, password }: ISignupBodyInputsDTO = req.body;
        // console.log({ username, email, password });

        const checkUserExist = await this.userModel.findOne({
            filter: { email },
            select: "email",
            options: {
                lean: false,
            },
        });

        console.log(checkUserExist);

        if (checkUserExist) {
            throw new ConflictException(" Email Exist");
        }

        const otp = generateOtp();
        console.log("DEBUG otp:", otp, typeof otp);

        const user = (await this.userModel.createUser({
            data: [{ username, email, password: await generateHash(password), confirmEmailOtp: await generateHash(String(otp)) }],
            options: { validateBeforeSave: true },
        }));


        // if (!user) {
        //     throw new BadRequestException("fail to signup this user account")
        // }

        // const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

        emailEvent.emit("confirmEmail", {
            to: email,
            otp
        });

        return res.status(201).json({ message: "Signup successful", data: { user } })
    }


    confirmEmail = async (req: Request, res: Response): Promise<Response> => {


        const { email, otp }: IConfirmEmailBodyInputsDTO = req.body;

        const user = await this.userModel.findOne({
            filter: {
                email,
                confirmEmailOtp: { $exists: true },
                confirmedAt: { $exists: false }
            }
        })

        if (!user) {
            throw new NotFoundException("Invalid account or already verified");
        }

        if (! await compareHash(otp, user.confirmEmailOtp as string)) {
            throw new ConflictException("Invalid  confirmation OTP ");

        }



        await this.userModel.updateOne({
            filter: { email },
            update: {
                confirmedAt: new Date(),
                $unset: { confirmEmailOtp: true },
            }
        })

        if (user.confirmEmailExpiry && user.confirmEmailExpiry < new Date()) {
            throw new BadRequestException("OTP has expired");
        }



        return res.status(200).json({ message: "Email confirmed successfully" });

    }



    login = async (req: Request, res: Response,): Promise<Response> => {

        let { email, password }: ILoginBodyInputsDTO = req.body;

        const user = await this.userModel.findOne({

            filter: { email }
        })
        if (!user) {
            throw new NotFoundException("Invalid email or password");
        }

        if (!user.confirmedAt) {
            throw new BadRequestException("pleas verify your account first");
        }

        if (!await compareHash(password, user.password)) {
            throw new NotFoundException("Invalid email or password");

        }

        const credentials = await createLoginCredentials(user)



        return res.status(200).json({
            message: "Done", data: { credentials },
        });
    };


    sendForgotCode = async (req: Request, res: Response): Promise<Response> => {


        const { email }: ISendForgotCodeBodyInputsDTO = req.body

        const user = await this.userModel.findOne({

            filter: {
                email,
                provider: ProviderEnum.SYSTEM,
                confirmedAt: { $exists: true },
            },
        });

        if (!user) {
            throw new BadRequestException("invalid account due to one of the following resoun ")
        }



        const otp = generateOtp();
        const result = await this.userModel.updateOne({
            filter: {
                email,
                confirmedAt: { $exists: true },
            },
            update: {
                resetPasswordOtp: await generateHash(String(otp)),
            },

        })
        if (!result.matchedCount) {
            throw new BadRequestException("Fail to send  the reset code please try again later")
        }


        emailEvent.emit("resetPassword", { to: email, otp })

        return res.json({ message: "done" })
    }


    verifyForgotCode = async (req: Request, res: Response): Promise<Response> => {


        const { email, otp }: IVerifyForgotCodeBodyInputsDTO = req.body

        const user = await this.userModel.findOne({

            filter: {
                email,
                provider: ProviderEnum.SYSTEM,
                resetPasswordOtp: { $exists: true }
            },
        });

        if (!user) {
            throw new BadRequestException("invalid account due to one of the following reasons ")
        }

        if (!(await compareHash(otp, user.resetPasswordOtp as string))) {
            throw new ConflictException("invalid otp")
        }

        return res.json({ message: "done" })
    }



    resetForgotPassword = async (req: Request, res: Response): Promise<Response> => {


        const { email, otp, password }: IResetForgotCodeBodyInputsDTO = req.body

        const user = await this.userModel.findOne({

            filter: {
                email,
                provider: ProviderEnum.SYSTEM,
                resetPasswordOtp: { $exists: true }
            },
        });

        if (!user) {
            throw new BadRequestException("invalid account due to one of the following reasons ")
        }

        if (!(await compareHash(otp, user.resetPasswordOtp as string))) {
            throw new ConflictException("invalid otp")
        }

        const result = await this.userModel.updateOne({
            filter: { email },
            update: {
                password: await generateHash(password),
                changeCredentialsTime: new Date(),
                $unset: { resetPasswordOtp: 1 }
            }
        })

        if(!result.matchedCount){
            throw new BadRequestException("Fail to reset account  password ")
        }

        return res.json({ message: "done" })
    }


}
export default new AuthenticationService()


