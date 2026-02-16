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