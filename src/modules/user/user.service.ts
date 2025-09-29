
import { Request, Response } from "express"
import { IFreezeAccountDTO, IHardDeleteAccountDTO, ILogoutDTO, IRestoreAccountDTO } from "./user.dto";
import { createLoginCredentials, createRevokeToken, LogoutEnum } from "../../utils/security/token.security";
import { Types, UpdateQuery } from "mongoose";
import { HUserDocument, IUser, RoleEnum, UserModel } from "../../DB/models/user.model";
import { UserRepository } from "../../DB/repository/user.repository";
import { JwtPayload } from "jsonwebtoken";
import { createPreSingeUploadLink, deleteFiles, deleteFolderByPrefix, uploadFiles } from "../../utils/multer/s3.config";
import { StorageEnum } from "../../utils/multer/cloud.multer";
import { BadRequestException, forbiddenException, NotFoundException, UnauthorizedException } from "../../utils/response/error.response";
import { s3Event } from "../../utils/multer/s3.events";
import { successResponse } from "../../utils/response/success.response";
import { IProfileImageResponse, IUserResponse } from "./user.entities";
import { ILoginResponse } from "../auth/auth.entities";




class UserService {
    private userModel = new UserRepository(UserModel)

    constructor() { }

    profile = async (req: Request, res: Response): Promise<Response> => {
        if (!req.user) {
            throw new UnauthorizedException("missing user details")
        }


        return successResponse<IUserResponse>({ res, data: { user: req.user } })
    };


    profileImage = async (req: Request, res: Response): Promise<Response> => {


        const { ContentType, Originalname }: { ContentType: string, Originalname: string } = req.body
        const { url, Key } = await createPreSingeUploadLink({
            ContentType,
            Originalname,
            path: `users/${req.decoded?._id}`,

        });

        const user = await this.userModel.findByIdAndUpdate({
            id: req.user?._id as Types.ObjectId,
            update: {
                ProfileImage: Key,
                TempProfileImage: req.user?.ProfileImage,
            },
        });

        if (!user) {
            throw new BadRequestException("fail to update uer profile image ")
        }

        s3Event.emit("trackProfileImageUpload", {
            userId: req.user?._id,
            oldKey: req.user?.ProfileImage,
            Key,
            expiresIn: 30000
        })

        return successResponse<IProfileImageResponse>({ res, data: { url } })

    };



    profileCoverImage = async (req: Request, res: Response): Promise<Response> => {

        const urls = await uploadFiles({
            storageApproach: StorageEnum.disk,
            files: req.files as Express.Multer.File[],
            path: `users/${req.decoded?._id}/cover`,
            useLarge: true,
        })


        const user = await this.userModel.findByIdAndUpdate({
            id: req.user?._id as Types.ObjectId,
            update: {
                CoverImage: urls,


            }
        })

        if (!user) {
            throw new BadRequestException("Fail to update  profile cover images")
        }

        if (req.user?.CoverImage?.length) {
            await deleteFiles({ urls: req.user.CoverImage })
        }


        return successResponse<ICoverImageResponse>({ res, data: { user } })

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
                await createRevokeToken(req.decoded as JwtPayload)
                // await this.tokenModel.create({  //creat revokeToken
                //     data: [{
                //         jti: req.decoded?.jti as string,
                //         expireIn: req.decoded?.iat as number + Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
                //         userId: req.decoded?._id

                //     }]
                // })
                // statusCode = 201;
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


    freezeAccount = async (req: Request, res: Response): Promise<Response> => {
        const { userId } = req.params as IFreezeAccountDTO || {}

        if (userId && req.user?.role !== RoleEnum.admin) {
            throw new forbiddenException("Not authorize user")

        }
        const user = await this.userModel.updateOne({
            filter: {
                _id: userId || req.user?._id,
                freezedAt: { $exists: false }
            },
            update: {
                freezedAt: new Date(),
                freezedBy: req.user?._id,// the user is login
                changeCredentialsTime: new Date(),
                $unset: {
                    restoredAt: 1,
                    restoredBy: 1,
                    // freezedAt:true,
                }



            }
        });

        if (!user.matchedCount) {
            throw new NotFoundException("user not found or fail to delete this resource")
        }



        return successResponse({ res })

    }



    restoreAccount = async (req: Request, res: Response): Promise<Response> => {
        const { userId } = req.params as IRestoreAccountDTO

        const user = await this.userModel.updateOne({
            filter: {
                _id: userId,
                freezedBy: { $exists: true }
            },
            update: {
                restoredAt: new Date(),
                restoredBy: req.user?._id,// the user is login
                $unset: {
                    freezedAt: 1,
                    freezedBy: 1,
                    // freezedAt:true,
                }



            }
        });

        if (!user.matchedCount) {
            throw new NotFoundException("user not found or fail to restore this resource")
        }



        return successResponse({ res })

    }


    hardDeleteAccount = async (req: Request, res: Response): Promise<Response> => {

        const { userId } = req.params as IHardDeleteAccountDTO


        const user = await this.userModel.deleteOne({
            filter: {
                _id: userId,
                freezedBy: { $ne: userId }
            },
        })



        if (!user.deletedCount) {
            throw new NotFoundException("user not found or fail to hard delete this resource")
        }



        await deleteFolderByPrefix({ path: `/user${userId}` })
        return successResponse({ res })

    }



    refreshToken = async (req: Request, res: Response,): Promise<Response> => {
        const credentials = await createLoginCredentials(req.user as HUserDocument)    // why HUserDocument??
        await createRevokeToken(req.decoded as JwtPayload)

        return successResponse<ILoginResponse>({ res, statuscode: 201, data: { credentials } })
    }


    
}

export default new UserService()