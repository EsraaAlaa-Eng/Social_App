import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {

    fullName: string;
    email: string;
    password: string;
    phone?: number;
    gender?: 'male' | 'female';

    confirmEmail?: Date;
    confirmEmailOtp?: string | undefined;
    confirmEmailExpiry?: Date | undefined;
    confirmEmailAt?: Date | undefined;


}

const UserSchema: Schema<IUser> = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: Number },
    gender: { type: String, enum: ['male', 'female'] },

    confirmEmail: { type: Boolean, default: false },        // هل البريد متأكد؟
    confirmEmailOtp: { type: String },                      // كود التأكيد (OTP)
    confirmEmailExpiry: { type: Date },                     // وقت انتهاء صلاحية الكود
    confirmEmailAt: { type: Date },                         // وقت ما تم التأكيد فعليًا
});

const UserModel = mongoose.model<IUser>('User', UserSchema)

export default UserModel