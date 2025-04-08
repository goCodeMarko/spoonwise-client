import { createAction, props } from "@ngrx/store";
import { Order } from "./order.state";

export const setToPay = createAction("[Order] Set To Pay");

export const setToPaySuccess = createAction(
  "[Order] Set To Pay Success",
  props<{ order: Order[] }>()
);

export const setToPayFailure = createAction(
  "[Order] Set To Pay Failure",
  props<{ error: string }>()
);

export const setForReview = createAction("[Order] Set For Review");

export const setForReviewSuccess = createAction(
  "[Order] Set For Review Success",
  props<{ order: Order[] }>()
);

export const setForReviewFailure = createAction(
  "[Order] Set For Review Failure",
  props<{ error: string }>()
);

export const setToPack = createAction("[Order] Set To Pack");

export const setToPackSuccess = createAction(
  "[Order] Set To Pack Success",
  props<{ order: Order[] }>()
);

export const setToPackFailure = createAction(
  "[Order] Set To Pack Failure",
  props<{ error: string }>()
);

export const setForPickup = createAction("[Order] Set For Pickup");

export const setForPickupSuccess = createAction(
  "[Order] Set For Pickup Success",
  props<{ order: Order[] }>()
);

export const setForPickupFailure = createAction(
  "[Order] Set For Pickup Failure",
  props<{ error: string }>()
);
export const setToReceive = createAction("[Order] Set To Receive");

export const setToReceiveSuccess = createAction(
  "[Order] Set To Receive Success",
  props<{ order: Order[] }>()
);

export const setToReceiveFailure = createAction(
  "[Order] Set To Receive Failure",
  props<{ error: string }>()
);
export const setCancelled = createAction("[Order] Set Cancelled");

export const setCancelledSuccess = createAction(
  "[Order] Set Cancelled Success",
  props<{ order: Order[] }>()
);

export const setCancelledFailure = createAction(
  "[Order] Set Cancelled Failure",
  props<{ error: string }>()
);

export const setLineItemOrderReceived = createAction(
  "[Order] Set LineItem Order Received",
  props<{ orderId: string; shopId: string; lineItemId: string }>()
);

export const setLineItemOrderReceivedSuccess = createAction(
  "[Order] Set LineItem Order ReceivedSuccess",
  props<{ order: Order; orderId: string; shopId: string; lineItemId: string }>()
);

export const setLineItemOrderReceivedFailure = createAction(
  "[Order] Set LineItem Order ReceivedFailure",
  props<{ error: string }>()
);

export const setReviews = createAction(
  "[Order] Set Reviews",
  props<{ orderId: string; shopId: string; rating: number; comment: string }>()
);

export const setReviewsSuccess = createAction(
  "[Order] Set Reviews Success",
  props<{
    order: Order;
    orderId: string;
    shopId: string;
    rating: number;
    comment: string;
  }>()
);

export const setReviewsFailure = createAction(
  "[Order] Set Reviews Failure",
  props<{ error: string }>()
);
