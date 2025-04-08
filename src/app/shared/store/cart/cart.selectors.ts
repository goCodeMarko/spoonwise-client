import { createSelector, createFeatureSelector } from "@ngrx/store";
import { CartState } from "./cart.reducers";
import * as _ from "lodash";
export const selectCartState = createFeatureSelector<CartState>("cart");

export const selectCartItems = createSelector(
  selectCartState,
  (state) => state.cart
);

export const selectCheckedLineItems = createSelector(selectCartState, (state) =>
  state.cart.map((cart) => ({
    lineItems: cart.lineItems.filter((lineItem) => lineItem.checked),
    subtotal: cart.lineItems
      .filter((lineItem) => lineItem.checked)
      .reduce(
        (total, lineItem) => total + lineItem.price * lineItem.orderQty,
        0
      ),
    totalItems: _.size(cart.lineItems.filter((lineItem) => lineItem.checked)),
    shop: cart.shop,
  }))
);

export const selectLineItemCount = createSelector(selectCartState, (state) =>
  state.cart.reduce((total, shop) => total + shop.lineItems.length, 0)
);

export const selectOrderQtyCount = createSelector(selectCartState, (state) =>
  state.cart.reduce(
    (total, shop) =>
      total +
      shop.lineItems
        .filter((lineItem) => lineItem.checked)
        .reduce((lineItemTotal, item) => lineItemTotal + item.orderQty, 0),
    0
  )
);

export const selectCheckedLineItemCount = createSelector(
  selectCartState,
  (state) =>
    state.cart.reduce(
      (total, shop) =>
        total +
        shop.lineItems
          .filter((lineItem) => lineItem.checked)
          .reduce((lineItemTotal, item) => lineItemTotal + 1, 0),
      0
    )
);

export const selectLineItemTotal = createSelector(selectCartState, (state) =>
  state.cart.reduce(
    (total, shop) =>
      total +
      shop.lineItems
        .filter((lineItem) => lineItem.checked)
        .reduce(
          (lineItemTotal, item) => lineItemTotal + item.price * item.orderQty,
          0
        ),
    0
  )
);

export const selectCartError = createSelector(
  selectCartState,
  (state) => state.error
);

export const selectPoints = createSelector(selectCartState, (state) => {
  const totalPoints =
    state.cart.reduce(
      (total, shop) =>
        total +
        shop.lineItems
          .filter((lineItem) => lineItem.checked)
          .reduce(
            (lineItemTotal, item) => lineItemTotal + item.price * item.orderQty,
            0
          ),
      0
    ) * 0.01;
  return parseFloat(totalPoints.toFixed(2));
});

export const selectCommissionPoints = createSelector(
  selectCartState,
  (state) => {
    return state.cart.map((shop) => ({
      ...shop,
      lineItems: shop.lineItems.map((item) => {
        const total = item.orderQty * item.price;
        return {
          ...item,
          commission: +(total * 0.1).toFixed(2),
          points: +(total * 0.01).toFixed(2),
        };
      }),
    }));
  }
);
