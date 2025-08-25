import { NextFunction, Request, Response } from "express"
import { ISignupBodyInputsDTO } from "./auth.DTO";
import * as DBservice from '../DB/db.service'
import UserModel from '../DB/models/user.model'
import { BadRequestException, globalErrorHandling, NotFoundException } from "../utils/response/error.response";
import { signup } from './auth.validation';
import bcrypt from "bcryptjs";
import { generateOtp } from '../utils/response/generateOtp';

class AuthenticationService {

    signup = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {

        try {

            const validatedData = signup.body.parse(req.body);


            const { fullName, email, password }: ISignupBodyInputsDTO = validatedData;
            if (await DBservice.findOne({ model: UserModel, filter: { email } })) {
                throw new BadRequestException("User already exists");


            }

            const hashedPassword = await bcrypt.hash(password, 8);

            const otp = generateOtp();
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)


            const newUser = await DBservice.create({
                model: UserModel,
                data: { 
                    fullName,
                     email, 
                     password: hashedPassword, 
                     confirmEmail: false, 
                     confirmEmailOtp:otp,
                     confirmEmailExpiry:otpExpiry
                    
                    }

            });

            return res.status(201).json({ message: "Signup successful", data: newUser })
        }
        catch (err) {
            return globalErrorHandling(err as any, req, res, next);

        }
    };


    confirmEmail = async function (req: Request, res: Response, next: NextFunction): Promise<Response> {

        try {
            const { email, otp } = req.body;

            const user = await DBservice.findOne({
                model: UserModel,
                filter: {
                    email,
                    confirmEmail: { $exists: false },
                    confirmEmailOtp: { $exists: true },
                }
            });
            if (!user) {
                throw new NotFoundException("Invalid account or already verified");
            }

            if (user.confirmEmailOtp !== otp) {
                throw new BadRequestException("Invalid OTP code");

            }

            if (user.confirmEmailExpiry && user.confirmEmailExpiry < new Date()) {
                throw new BadRequestException("OTP has expired");
            }

            user.confirmEmail = true;
            user.confirmEmailAt = new Date();
            user.confirmEmailOtp = undefined;
            user.confirmEmailExpiry = undefined;

            await user.save();


            return res.status(200).json({ message: "Email confirmed successfully" });

        }

        catch (err) {
            return globalErrorHandling(err as any, req, res, next);

        }







    }









    login = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { email, password }: ISignupBodyInputsDTO = req.body;

            const user = await DBservice.findOne({
                model: UserModel,
                filter: { email }
            })
            if (!user) {
                throw new BadRequestException("Invalid email or password");
            }

            if (!user.confirmEmail) {
                throw new NotFoundException("pleas verify your account first");
            }

            const comparePassword = await bcrypt.compare(password, user.password)
            if (!comparePassword) {
                throw new BadRequestException("Invalid email or password");

            }


            return res.status(200).json({ message: "Done", data: user })

        } catch (err) {
            return globalErrorHandling(err as any, req, res, next);
        }
    };
}

export default new AuthenticationService()


