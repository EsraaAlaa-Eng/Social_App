import { JwtPayload } from "jsonwebtoken";
import { HUserDocument } from "../../DB/models/user.model";


// declare to "express-serve-static-core", chang the inner interface is name request "deceleration merging"

declare module "express-serve-static-core"{
    interface Request {
        user?:HUserDocument,
        decoded?:JwtPayload
    }
}