import { hash } from "bcrypt";
import { compare } from "bcryptjs";


export const generateHash = async (
    plaintext: string,
    salt: number = Number(process.env.SALT),
): Promise<string> => {
    return await hash(plaintext, salt);

};

export const compareHash = async (
    plaintext: string,
    hash: string,
): Promise<boolean> => {
    return await compare(plaintext, hash);

};