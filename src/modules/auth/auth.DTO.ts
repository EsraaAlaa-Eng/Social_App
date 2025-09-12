
export interface ISignupBodyInputsDTO {
    username: string;
    email: string;
    password: string;
}

export interface IConfirmEmailBodyInputsDTO {
    email: string,
    otp: string
}
