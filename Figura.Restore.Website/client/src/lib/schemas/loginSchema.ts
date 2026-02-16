import { z } from 'zod';

export const loginSchema = z.object({
    //validators
    email: z.email(),
    password: z.string().min(6, {
        message: 'Password must be at least 6 characters'
    })
})

//type of the schema
export type LoginSchema = z.infer<typeof loginSchema>;