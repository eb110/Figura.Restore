import { createSlice } from "@reduxjs/toolkit"

export type CounterState = {
    data: number
}

const initialState: CounterState = {
    data: 42
}

export const counterSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
        increment: (state, action) => {
            state.data += action.payload
        },
        decrement: (state, action) => {
            state.data -= action.payload
        }
    }
})

export const { increment, decrement } = counterSlice.actions;


//##########################DEPRECATED CONTENT######################################
export function incrementLegacy(amount = 1) {
    return {
        type: 'increment',
        payload: amount
    }
}

export function decrementLegacy(amount = 1) {
    return {
        type: 'decrement',
        payload: amount
    }
}

export default function counterReducer(state = initialState, action: { type: string, payload: number }) {
    switch (action.type) {
        case 'increment':
            //we can't mutate the original state -> this is why whe applied '...' and create a copy
            return {
                //new state
                ...state, data: state.data + action.payload
            }
        case 'decrement':
            return {
                //new state
                ...state, data: state.data - action.payload
            }
        default:
            return state;
    }
}