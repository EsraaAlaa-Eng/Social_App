import { HUserDocument } from "../../DB/models/user.model";

export interface IProfileImageResponse {
    url: string
}

export interface IUserResponse {
    user:Partial<HUserDocument>
}