import { createSlice } from "@reduxjs/toolkit/react";
import type { ProductParams } from "../../app/models/productParams";

const initialState: ProductParams = {
    pageNumber: 1,
    pageSize: 8,
    types: [],
    brands: [],
    searchTerm: '',
    orderBy: 'name'
}

export const catalogSlice = createSlice({
    name: 'catalogSlice',
    initialState,
    reducers: {
        setPageNumber(state, action) {
            state.pageNumber = action.payload
        },
        setPageSize(state, action) {
            state.pageSize = action.payload
        },
        setOrderBy(state, action) {
            state.orderBy = action.payload
            //standardApproach - in case of sort => display first page
            state.pageNumber = 1;
        },
        setTypes(state, action) {
            state.types = action.payload
            //standardApproach - in case of sort => display first page
            state.pageNumber = 1;
        },
        setBrands(state, action) {
            state.brands = action.payload
            //standardApproach - in case of sort => display first page
            state.pageNumber = 1;
        },
        setSearchTerm(state, action) {
            state.searchTerm = action.payload
            //standardApproach - in case of sort => display first page
            state.pageNumber = 1;
        },
        resetParams() {
            return initialState;
        }
    }
})

export const { setBrands, setOrderBy, setPageNumber,
    setPageSize, setSearchTerm, setTypes, resetParams } = catalogSlice.actions;