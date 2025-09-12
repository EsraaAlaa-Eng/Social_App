import {connect} from "mongoose";
import { UserModel } from "../models/user.model";

const connectDB = async (): Promise<void> => {
  try {
    const result = await connect(process.env.MONGO_URI as string,{
      serverSelectionTimeoutMS:30000,
    });

    UserModel.syncIndexes()
    console.log(result.models);
    console.log("DB Connected Successfully ✔️");

  } catch (error) {
    console.error("DB Connection Failed: ❌", error);
  }
};

export default connectDB;
