
import { Request, Response } from "express"
import { ILogoutDTO } from "./user.dto";
import { LogoutEnum } from "../../utils/security/token.security";
import { UpdateQuery } from "mongoose";
import { IUser, UserModel } from "../../DB/models/user.model";
import { UserRepository } from "../../DB/repository/user.repository";
import { TokenModel } from "../../DB/models/token.model";
import { TokenRepository } from "../../DB/repository/token.repository";



class UserService {
    private userModel = new UserRepository(UserModel)
    private tokenModel = new TokenRepository(TokenModel)

    constructor() { }

    profile = async (req: Request, res: Response): Promise<Response> => {
        return res.json({
            message: "Done",

            date: {
                user: req.user?._id,
                decoded: req.decoded?.iat

            },
        });
    };




    logout = async (req: Request, res: Response,): Promise<Response> => {
        const { flag }: ILogoutDTO = req.body;
        let statusCode: number = 200
        const update: UpdateQuery<IUser> = {}
        switch (flag) {
            case LogoutEnum.all:
                update.changeCredentialsTime = new Date()
                break;

            default:
                await this.tokenModel.create({
                    data: [{
                        jti: req.decoded?.jti as string,
                        expireIn: req.decoded?.iat as number + Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
                        userId: req.decoded?._id

                    }]
                })
                statusCode=201;
                break;
        }

        await this.userModel.updateOne({
            filter: { _id: req.decoded?._id },
            update,
        })
        return res.status(statusCode).json({
            message: "Done",
        });

    }













}

export default new UserService()