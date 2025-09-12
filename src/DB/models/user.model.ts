import { HydratedDocument, model, models, Schema, Types } from 'mongoose';


export enum GenderEnum {
    male = "male",
    female = "female"
}


export enum RoleEnum {
    admin = "admin",
    user = "user"
}



export interface IUser {
    _id: Types.ObjectId;

    firstName: string;
    lastName: string;
    username?: string;

    email: string;
    confirmEmail?: Date;
    confirmEmailOtp?: string | undefined;
    confirmEmailExpiry?: Date | undefined;
    confirmEmailAt?: Date | undefined;


    password: string;
    resetPasswordOtp?: string;
    changeCredentialsTime?: Date;

    phone?: number;
    address?: string;

    gender: GenderEnum;
    role: RoleEnum;


    createdAt?: Date;
    updateAt?: Date;



}

const UserSchema = new Schema<IUser>({

    firstName: { type: String, required: true, minLength: 2, maxLength: 25 },
    lastName: { type: String, required: true, minLength: 2, maxLength: 25 },

    email: { type: String, required: true, unique: true },
    confirmEmail: { type: Date },
    confirmEmailOtp: { type: String, required: false },
    confirmEmailExpiry: { type: Date },
    confirmEmailAt: { type: Date },


    password: { type: String, required: true },
    resetPasswordOtp: { type: String },
    changeCredentialsTime: { type: Date },

    phone: { type: Number },
    address: { type: String },

    gender: { type: String, enum: GenderEnum },
    role: { type: String, enum: RoleEnum },




},

    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: false }
    }
);

UserSchema.virtual("username").set(function (value: string) {
    const [firstName, lastName] = value.split(" ") || [];
    this.set({ firstName, lastName });
}).get(function () {
    return this.firstName + " " + this.lastName;
})




export const UserModel = models.User || model<IUser>('User', UserSchema)

export type HUserDocument =HydratedDocument<IUser>
