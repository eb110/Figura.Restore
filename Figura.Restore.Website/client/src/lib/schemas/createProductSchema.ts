import { z } from 'zod';

//file initial schema
const fileSchema = z.instanceof(File).refine(file => file.size > 0, {
    message: 'A file must be uploaded'
    //we want to add extra parameter to the 'File' type of zod
})
//.transform(file => ({
//    ...file,
//so now the zod provides as a type for file: File type plus preview parameter
//    preview: URL.createObjectURL(file)
//}));

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
    //optional as if this is a new product then we can not have the url
    //so this paramter is for edition of existing product
    pictureUrl: z.string().optional(),
    //file handling => optional in case it's edition of existing product
    //be is not sending back the file -> it sends back the url
    file: fileSchema.optional()
})
    //we want to trigger validation for file
    .refine((data) => data.pictureUrl || data.file, {
        message: 'Please provide an image',
        path: ['file']
    })

export type CreateProductSchema = z.infer<typeof createProductSchema>;