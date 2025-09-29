//Setup ENV
import { resolve } from 'node:path'
import { config } from 'dotenv'
config({ path: resolve('./config/.env.development') })

//load express and express types
import type { Request, Response, Express } from "express";
import express from "express";

//third party middleware
import cors from 'cors'
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

//import module routing
import authController from "./modules/auth/auth.controller"
import { BadRequestException, globalErrorHandling } from './utils/response/error.response';
import connectDB from './DB/connection/connection.db';
import userController from './modules/user/user.controller';
import { deleteFolderByPrefix, getFile } from './utils/multer/s3.config';


import { promisify } from 'node:util';
import { pipeline } from 'node:stream';
const createS3WriteStreamPipe = promisify(pipeline)



//handel base late limit on all api request
const limiter = rateLimit({
    windowMs: 60 * 60000,
    limit: 2000,
    message: { error: "Too many request plz try again later" },
    statusCode: 429
});

//app-start-point
const bootstrap = async (): Promise<void> => {
    const app: Express = express();
    const port: number | string = process.env.PORT || 5000;

    // Connect Database
    await connectDB();




    // global application middleware cors ,helmet ,json format,rate limit
    app.use(cors(), helmet(), express.json(), limiter)







    // app-routing
    app.get("/", (req: Request, res: Response) => {
        res.json({ message: `Welcome to ${process.env.APPLICATION_NAME} landing page 💕` });
    });

    //sub-app-routing-module
    app.use("/auth", authController)
    app.use("/user", userController)


    // test
    app.get("/test/*key", async (req: Request, res: Response) => {
        // let key = req.params.key as unknown as string[]
        // let path = key.join("/")
        // const { Key } = req.query as { Key: string };
        // // const result = await deleteFile({ Key })


        // const result = await deleteFiles({
        //     urls: [
        //         path],
        //     Quiet: true,
        // })


        await deleteFolderByPrefix({ path: `users/` });

        return res.json({ message: "Done", data: {} })
    })


    // getAsset with presignedUrl 
    app.get("/upload/*path", async (req: Request, res: Response) => {
        const { path } = req.params as unknown as { path: string[] }
        const Key = path.join("/")
        const s3Response = await getFile({ Key })
        console.log(s3Response);
        if (!s3Response?.Body) {
            throw new BadRequestException("missing resource key");
        }
        res.setHeader(
            "Content-Type",
            `${s3Response.ContentType || "application/octet-stream"} `
        );

        return await createS3WriteStreamPipe(s3Response.Body as NodeJS.ReadableStream, res);
    });





    //In-valid routing
    app.use("{/*dummy}", (req: Request, res: Response) => {
        res.status(400).json({ message: "Invalid application routing plz check the method and url ❌" })
    });


    //global-error-handling
    app.use(globalErrorHandling);

























    //start Server
    app.listen(port, () => {
        console.log(`Server is running on port:::${port} 🚀`);
    });
};

export default bootstrap;
