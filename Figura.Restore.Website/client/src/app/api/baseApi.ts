import { fetchBaseQuery, type BaseQueryApi, type FetchArgs } from "@reduxjs/toolkit/query";
import { startLoading, stopLoading } from "../layout/uiSlice";
import { toast } from "react-toastify";
import { router } from "../routes/Routes";

const customBaseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    //cookies
    credentials: 'include'
});

//const sleep = () => new Promise(resolve => setTimeout(resolve, 3000));

export const baseQueryWithErrorHandling = async (args: string | FetchArgs, api: BaseQueryApi, extraOptions: object) => {
    //start loading
    //update the store state
    api.dispatch(startLoading());
    // if (import.meta.env.DEV) await sleep();
    //async call - fetch of the api data - isLoading = true
    const result = await customBaseQuery(args, api, extraOptions);
    //stop loading
    //update the store state
    api.dispatch(stopLoading());
    if (result.error) {
        const { status, data } = result.error

        switch (status) {
            case 400:
                if (typeof data === 'string')
                    toast.error(data);
                else if (typeof data === 'object' && data !== null && 'errors' in data) {
                    throw Object.values(data.errors!).flat().join(', ')
                }
                else if (typeof data === 'object' && data !== null && 'title' in data && typeof data.title === 'string') {
                    toast.error(data.title)
                }
                break;
            case 401:
                if (typeof data === 'object' && data !== null && 'title' in data && typeof data.title === 'string') {
                    toast.error(data.title)
                }
                break;
            //forbidden access - usually sends nothing back
            case 403:
                if (typeof data === 'object') {
                    toast.error('403 Forbidden')
                }
                break;
            case 404:
                if (typeof data === 'object' && data !== null && 'title' in data && typeof data.title === 'string') {
                    router.navigate('/not-found')
                }
                break;
            case 500:
                if (typeof data === 'object') {
                    router.navigate('/server-error', { state: { error: data } })
                }
                break;
            default:
                break;
        }
    }

    return result;
}