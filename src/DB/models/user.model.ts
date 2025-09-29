import { HydratedDocument, model, models, Schema, Types } from 'mongoose';


export enum GenderEnum {
    male = "male",
    female = "female"
}


export enum RoleEnum {
    admin = "admin",
    user = "user"
}

export enum ProviderEnum {
    GOOGLE = "GOOGLE",
    SYSTEM = "SYSTEM"
}




export interface IUser {
    _id: Types.ObjectId;

    firstName: string;
    lastName: string;
    username?: string;

    email: string;
    confirmEmailOtp?: string | undefined;
    confirmEmailExpiry?: Date | undefined;
    confirmedAt?: Date | undefined;


    password: string;
    resetPasswordOtp?: string;
    changeCredentialsTime?: Date;

    phone?: number;
    address?: string;

    ProfileImage?: string;
    TempProfileImage?: string;
    CoverImage?: string[];

    gender: GenderEnum;
    role: RoleEnum;
    provider: ProviderEnum;


    createdAt?: Date;
    updateAt?: Date;

    freezedAt?: Date;
    freezedBy?: Types.ObjectId;
    restoredAt?: Date;
    restoredBy?: Types.ObjectId;






}

const UserSchema = new Schema<IUser>({

    firstName: { type: String, required: true, minLength: 2, maxLength: 25 },
    lastName: { type: String, required: true, minLength: 2, maxLength: 25 },

    email: { type: String, required: true, unique: true },
    confirmEmailOtp: { type: String, required: false },
    confirmEmailExpiry: { type: Date },
    confirmedAt: { type: Date },


    password: {
        type: String,
        required: function () {
            return this.provider === ProviderEnum.GOOGLE ? false : true
        },
    },
    resetPasswordOtp: { type: String },
    changeCredentialsTime: { type: Date },

    phone: { type: Number },
    address: { type: String },

    ProfileImage: { type: String },
    TempProfileImage: { type: String },
    CoverImage: [String],

    gender: { type: String, enum: GenderEnum, default: GenderEnum.male },
    role: { type: String, enum: RoleEnum, default: RoleEnum.user },
    provider: { type: String, enum: ProviderEnum, default: ProviderEnum.GOOGLE },


    freezedAt: { type: Date },
    freezedBy: { type: Schema.Types.ObjectId, ref: "User" },
    restoredAt: { type: Date },
    restoredBy: { type: Schema.Types.ObjectId, ref: "User" },



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

export type HUserDocument = HydratedDocument<IUser>
