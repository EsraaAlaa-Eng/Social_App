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
import authController from "./auth/auth.controller"
import { globalErrorHandling } from './utils/response/error.response';
import connectDB from './DB/connection/connection.db';



//handel base late limit on all api request
const limiter = rateLimit({
    windowMs: 60 * 60000,
    limit: 2000,
    message: { error: "Too many request plz try again later" },
    statusCode: 429
});

//app-start-point
const bootstrap = (): void => {
    const app: Express = express();
    const port: number | string = process.env.PORT || 5000;

    // Connect Database
    connectDB();

    app.use(express.json());


    // global application middleware cors ,helmet ,json format,rate limit
    app.use(cors(), helmet(), express.json(), limiter)







    // app-routing
    app.get("/", (req: Request, res: Response) => {
        res.json({ message: `Welcome to ${process.env.APPLICATION_NAME} landing page 💕` });
    });

    //sub-app-routing-module
    app.use("/auth", authController)



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
