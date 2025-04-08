import { createSelector, createFeatureSelector } from "@ngrx/store";
import { OrderState } from "./order.state";
import * as _ from "lodash";
export const selectOrderState = createFeatureSelector<OrderState>("order");

export const selectToPay = createSelector(
  selectOrderState,
  (state) => state.order.toPay
);

export const selectOrderError = createSelector(
  selectOrderState,
  (state) => state.error
);

export const selectForReview = createSelector(
  selectOrderState,
  (state) => state.order.forReview
);

export const selectForReviewError = createSelector(
  selectOrderState,
  (state) => state.error
);

export const selectToPack = createSelector(
  selectOrderState,
  (state) => state.order.toPack
);

export const selectToPackError = createSelector(
  selectOrderState,
  (state) => state.error
);

export const selectForPickup = createSelector(
  selectOrderState,
  (state) => state.order.forPickup
);

export const selectForPickupError = createSelector(
  selectOrderState,
  (state) => state.error
);

export const selectToReceive = createSelector(
  selectOrderState,
  (state) => state.order.toReceive
);

export const selectToReceiveError = createSelector(
  selectOrderState,
  (state) => state.error
);

export const selectCancelled = createSelector(
  selectOrderState,
  (state) => state.order.cancelled
);

export const selectCancelledError = createSelector(
  selectOrderState,
  (state) => state.error
);

export const selectPoints = createSelector(selectOrderState, (state) => {
  const totalPoints = state.order.toReceive
    // Filter orders where the latest order status is TO_RECEIVE
    .filter((order) => order.latestStatus.status === "TO_RECEIVE")
    // For each order, sum the points from cart items that have latestStatus of ORDER_RECEIVED
    .reduce(
      (total, order) =>
        total +
        order.cart.reduce(
          (lineItemTotal, lineItem) =>
            lineItem.latestStatus.status === "ORDER_RECEIVED"
              ? lineItemTotal + lineItem.points
              : lineItemTotal,
          0
        ),
      0
    );

  // Round to two decimal places and convert back to number
  return parseFloat(totalPoints.toFixed(2));
});
