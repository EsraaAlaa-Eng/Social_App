import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("DB Connected Successfully ✔️");
  } catch (error) {
    console.error("DB Connection Failed: ❌", error);
    process.exit(1); 
  }
};

export default connectDB;
