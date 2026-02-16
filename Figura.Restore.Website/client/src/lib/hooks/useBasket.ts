import type { Item } from "../../app/models/basket";
import { useClearBasketMutation, useFetchBasketQuery } from "../../features/basket/basketApi";

export const useBasket = () => {
    const { data: basket } = useFetchBasketQuery();
    const [clearBasket] = useClearBasketMutation();
    const subtotal: number =
        basket?.items.reduce((sum: number, x: Item) => sum + x.price * x.quantity, 0) || 0;

    const deliveryFee: number = subtotal > 10000 ? 0 : 500;
    const total = subtotal + deliveryFee;

    return { basket, subtotal, deliveryFee, total, clearBasket }
}