import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithErrorHandling } from "../../app/api/baseApi";
import type { Product } from "../../app/models/product";

export const adminApi = createApi({
    reducerPath: 'adminApi',
    baseQuery: baseQueryWithErrorHandling,
    endpoints: (builder) => ({
        //schema in fact stores and handles the form data -> handled by zod and useForm
        //the parameter should to be CreateProductSchema but to send file the content-type has to be
        //the FormData
        //we have populated all parameters to formdata so we have 1-1 copy of CreateProductSchema
        createProduct: builder.mutation<Product, FormData>({
            query: (data: FormData) => {
                return {
                    url: 'products',
                    method: 'POST',
                    body: data
                }
            }
        }),
        //the parameter should to be CreateProductSchema
        updateProduct: builder.mutation<void, { id: number, data: FormData }>({
            query: ({ id, data }) => {
                //FormData misses the id
                //same strategy -> we have to append the missing parameter and
                //now our paramter is 1 to 1 with the backend 'UpdateProductDto'
                data.append('id', id.toString())
                return {
                    url: 'products',
                    method: 'PUT',
                    body: data
                }
            }
        })
    })
});

export const { useCreateProductMutation, useUpdateProductMutation } = adminApi;