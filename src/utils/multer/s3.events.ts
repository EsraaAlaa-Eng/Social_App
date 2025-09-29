import { EventEmitter } from "node:events";
import { deleteFile, getFile } from "./s3.config";
import { UserRepository } from "../../DB/repository/user.repository";
import { UserModel } from "../../DB/models/user.model";
export const s3Event = new EventEmitter({});

s3Event.on("trackProfileImageUpload", (data) => {
    console.log({ data });

    setTimeout(async () => {
        const userModel = new UserRepository(UserModel)
        try {
            await getFile({ Key: data.Key });

            await userModel.updateOne({
                filter: { _id: data.userId },
                update: {
                    $unset: { TempProfileImage: 1 }
                }
            });

            await deleteFile({ Key: data.oldKey })
            console.log(`DONE 😊`);

        } catch (error: any) {
            console.log(error);

            if (error.Code === "NoSuchKey") {
                await userModel.updateOne({
                    filter: { _id: data.userId },
                    update: {
                        ProfileImage: data.oldKey,
                        $unset: { TempProfileImage: 1 },
                    }
                })
            }

        }

    }, data.expireIn || Number(process.env.AWS_PRE_SIGNED_URL_EXPIRES_IN_SECONDS) * 1000) //to Mile sec
});