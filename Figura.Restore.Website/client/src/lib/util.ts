import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import type { Address } from "../app/models/address";
import type { PaymentSummary } from "../app/models/order";

export function currencyFormat(amount: number) {
    return '$' + (amount / 100).toFixed(2);
}

export function filterEmptyValues(values: object) {
    return Object.fromEntries(
        Object.entries(values).filter(
            ([, value]) => value !== '' && value !== null && value !== undefined && value.length !== 0
        )
    )
}

export function addressString(address: Address) {
    return `${address.name}, ${address.line1}, ${address.city}, ${address.state}, ${address.postal_code}, ${address.country}`;
}

export function paymentString(card: PaymentSummary) {
    return `${card.brand.toUpperCase()}, **** **** **** ${card.last4}, Exp: ${card.exp_month}/${card.exp_year}`;
}

//generic error handled for react form => it work under FieldValues type !!!
//in our case the T is CreateProductSchema => check utilisation in ProductForm
//the main idea of this is to set automatic validators of react form
//this require strict check of which error points to which form field
export function handleApiError<T extends FieldValues>(
    //this has to be evaluated later
    error: unknown,
    //this comes from react form -> we will set it in react form and send back
    setError: UseFormSetError<T>,
    //schema value - include string names of names declared in zod
    fieldNames: Path<T>[]
) {
    //based on baseApi error handler return type
    const apiError = (error as { message: string }) || {}

    if (apiError.message && typeof apiError.message === 'string') {
        //as we remember -> errors are coming back as coma separated
        const errorArray = apiError.message.split(',');

        errorArray.forEach(e => {
            //we have to correspond each error with individual fieldName of fieldNames
            const matchedField = fieldNames.find(fieldName => e.toLocaleLowerCase().includes(fieldName.toString().toLowerCase()));

            //now we are ready to locate in on react form error
            if (matchedField) setError(matchedField, { message: e.trim() });
        })
    }
}
