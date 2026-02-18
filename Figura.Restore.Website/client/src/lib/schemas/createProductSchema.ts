import { z } from 'zod';

//file initial schema
const fileSchema = z.instanceof(File).refine(file => file.size > 0, {
    message: 'A file must be uploaded'
});

//parameters are in fact fields of the form - each are going to be validate based on rules
export const createProductSchema = z.object({
    name: z.string({
        error
            : 'Name of product is required'
    }),
    description: z.string({ error: 'Description is required' }).min(10, { message: 'Description must be at least 10 characters' }),
    //paramters are coming from html as a string - we have to coerce it if different type is needed
    price: z.coerce.number<number>({ error: 'Price is required' }).min(100, 'Price must be at least $1.00'),
    type: z.string({ error: 'Type is required' }),
    brand: z.string({ error: 'Brand is required' }),
    quantityInStock: z.coerce.number<number>({ error: 'Quantity is required' }).min(1, 'Quantity must be at least 1'),
    //file handling
    file: fileSchema
})

export type CreateProductSchema = z.infer<typeof createProductSchema>;