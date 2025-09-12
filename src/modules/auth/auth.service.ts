import { Request, Response } from "express"
import { IConfirmEmailBodyInputsDTO, ISignupBodyInputsDTO } from "./auth.DTO";
import { UserModel } from '../../DB/models/user.model'
import { BadRequestException, ConflictException, NotFoundException } from "../../utils/response/error.response";
import { generateOtp } from '../../utils/generateOtp';
import { UserRepository } from "../../DB/repository/user.repository";
import { compareHash, generateHash } from "../../utils/security/hash.security";
import { emailEvent } from "../../utils/event/email.event";
import { createLoginCredentials, generateToken } from "../../utils/security/token.security";


class AuthenticationService {

    private userModel = new UserRepository(UserModel);
    constructor() { }

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
                confirmEmail: { $exists: false }
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
                confirmEmailAt: new Date(),
                $unset: { confirmEmailOtp: true },
                confirmEmail: new Date(),
            }
        })

        if (user.confirmEmailExpiry && user.confirmEmailExpiry < new Date()) {
            throw new BadRequestException("OTP has expired");
        }



        return res.status(200).json({ message: "Email confirmed successfully" });

    }



    login = async (req: Request, res: Response,): Promise<Response> => {

        let { email, password }: ISignupBodyInputsDTO = req.body;

        const user = await this.userModel.findOne({

            filter: { email }
        })
        if (!user) {
            throw new NotFoundException("Invalid email or password");
        }

        if (!user.confirmEmail) {
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
}

export default new AuthenticationService()


