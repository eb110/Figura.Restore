import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithErrorHandling } from "../../app/api/baseApi";
import type { User } from "../../app/models/user";
import type { LoginSchema } from "../../lib/schemas/loginSchema";
import { router } from "../../app/routes/Routes";
import { toast } from "react-toastify";
import type { RegisterSchema } from "../../lib/schemas/registerSchema";
import type { Address } from "../../app/models/address";

export const accountApi = createApi({
    reducerPath: 'accountApi',
    baseQuery: baseQueryWithErrorHandling,
    tagTypes: ['UserInfo', 'Address'],
    endpoints: (builder) => ({
        login: builder.mutation<void, LoginSchema>({
            query: (creds) => {
                return {
                    url: 'login?useCookies=true',
                    method: 'POST',
                    body: creds
                }
            },
            //each login should to fetech refreshed user info data -> this is why the cache for
            //GET user info has to be off
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(accountApi.util.invalidateTags(['UserInfo']))
                } catch (error) {
                    console.log(error)
                }
            }
        }),
        register: builder.mutation<void, RegisterSchema>({
            query: (creds) => {
                return {
                    url: 'account/register',
                    method: 'POST',
                    body: creds
                }
            },
            async onQueryStarted(_, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    toast.success('Registration successful - you can now sign in!')
                    //redirect
                    router.navigate('/login');
                } catch (error) {
                    console.log(error)
                    throw error;
                }
            }
        }),
        userInfo: builder.query<User, void>({
            query: () => 'account/user-info',
            providesTags: ['UserInfo']
        }),
        logout: builder.mutation<void, object>({
            query: () => ({
                url: 'account/logout',
                method: 'POST'
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    //clear cache for user-info
                    dispatch(accountApi.util.invalidateTags(['UserInfo', 'Address']));
                    //redirect
                    router.navigate('/');
                } catch (error) {
                    console.log(error)
                }
            }
        }),
        fetchAddress: builder.query<Address, void>({
            query: () => ({
                url: 'account/address',
                providesTags: ['Address']
            })
        }),
        updateUserAddress: builder.mutation<Address, Address>({
            query: (address) => ({
                url: 'account/address',
                method: 'POST',
                body: address
            }),
            onQueryStarted: async (address, { dispatch, queryFulfilled }) => {
                //update of the address -> cached address update required as well
                const patchResult = dispatch(
                    accountApi.util.updateQueryData('fetchAddress', undefined, (draft) => {
                        Object.assign(draft, { ...address })
                    })
                )

                try {
                    await queryFulfilled;
                } catch (error) {
                    //in case of error - revert the cache state to its initial value
                    patchResult.undo();
                    console.log(error)
                }
            }
        })
    })
});

export const { useLoginMutation, useRegisterMutation, useLogoutMutation, useUserInfoQuery, useLazyUserInfoQuery, useFetchAddressQuery, useUpdateUserAddressMutation } = accountApi;