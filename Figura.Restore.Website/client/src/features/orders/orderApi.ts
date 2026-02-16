import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithErrorHandling } from "../../app/api/baseApi";
import { type CreateOrder, type Order } from "../../app/models/order";

export const orderApi = createApi({
    reducerPath: 'orderApi',
    baseQuery: baseQueryWithErrorHandling,
    tagTypes: ['Orders'],
    endpoints: (builder) => ({
        fetchOrders: builder.query<Order[], void>({
            query: () => ({ url: 'orders' }),
            providesTags: ['Orders']
        }),
        fetchOrderDetails: builder.query<Order, number>({
            query: (id: number) => ({ url: `orders/${id}` })
        }),
        createOrder: builder.mutation<Order, CreateOrder>({
            query: (order: CreateOrder) => {
                return {
                    url: 'orders',
                    method: 'POST',
                    body: order
                }
            },
            onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
                await queryFulfilled;
                //disable cache as we want to dynamically update the transaction status
                //pending -> secceeded or failed
                dispatch(orderApi.util.invalidateTags(['Orders']));
            }
        })
    })
});

export const { useFetchOrderDetailsQuery, useFetchOrdersQuery, useCreateOrderMutation } = orderApi;