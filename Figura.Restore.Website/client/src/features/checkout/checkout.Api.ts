import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithErrorHandling } from "../../app/api/baseApi";
import { basketApi } from "../basket/basketApi";
import type { Basket } from "../../app/models/basket";

export const checkoutApi = createApi({
    reducerPath: 'checkoutApi',
    baseQuery: baseQueryWithErrorHandling,
    endpoints: (builder) => ({
        createPaymentIntent: builder.mutation<Basket, void>({
            query: () => {
                return {
                    url: 'payments',
                    method: 'POST'
                }
            },
            onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
                try {
                    //basket
                    const { data } = await queryFulfilled;
                    //at the current state - the basket is in memory (cache)
                    //its there as fetchBasket already been performed earler on
                    //we have to update it's parameter
                    //the basket fetch(cache trigger) has been performed by 'fetchBasket' rtq query call
                    //this is why we provid it as a root
                    dispatch(
                        basketApi.util.updateQueryData('fetchBasket', undefined, (draft) => {
                            draft.clientSecret = data.clientSecret
                        })
                    )
                } catch (error) {
                    console.log('payment intent creation failed: ', error)
                }
            }
        })
    })
})

export const { useCreatePaymentIntentMutation } = checkoutApi;