import { z } from 'zod';

const passwordValidation = new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,10}$/)

export const registerSchema = z.object({
    //validators
    email: z.email(),
    password: z.string().regex(passwordValidation, {
        message: 'Password must be 6-10 characters, 1 alpha, 1 digit, 1 upper and lower'
    })
})

//type of the schema
export type RegisterSchema = z.infer<typeof registerSchema>;