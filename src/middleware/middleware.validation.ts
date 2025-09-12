import { z } from 'zod'

import type { Response, Request, NextFunction } from "express";
import type { ZodError, ZodType } from "zod"
import { BadRequestException } from "../utils/response/error.response";

type keyReqType = keyof Request; //'body' | 'params' | 'query' | 'file'
type SchemaType = Partial<Record<keyReqType, ZodType>>

export const validation = (schema: SchemaType) => {
    return (req: Request, res: Response, next: NextFunction): NextFunction => {
        const validationErrors: Array<{
            key: keyReqType;
            issues: Array<{
                message: string;
                path: string | number | symbol | undefined;
            }>;
        }> = [];

        for (const key of Object.keys(schema) as keyReqType[]) {
            if (!schema[key]) continue;

            const validationResult = schema[key].safeParse(req[key]);

            if (!validationResult.success) {
                const errors = validationResult.error as ZodError;

                validationErrors.push({
                    key,
                    issues: errors.issues.map((issue) => {
                        return { message: issue.message, path: issue.path[0] }
                    }),
                });
            }


        }

        if (validationErrors.length) {
            throw new BadRequestException("validation Error", {
                validationErrors,
            });
        }

        return next() as unknown as NextFunction;

    };
};




export const generalFields = {

    username: z.string().min(2).max(20),
    email: z.email(),
    password: z.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
    confirmPassword: z.string(),
}












