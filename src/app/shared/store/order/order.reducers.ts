import { createReducer, on } from "@ngrx/store";
import { OrderState, Order } from "./order.state";
import * as OrderActions from "./order.actions";

export const initialState: OrderState = {
  order: {
    toPay: [],
    forReview: [],
    toPack: [],
    forPickup: [],
    toReview: [],
    toReceive: [],
    cancelled: [],
  },
  error: null,
};

export const orderReducer = createReducer(
  initialState,
  on(OrderActions.setToPaySuccess, (state, { order }) => ({
    ...state,
    order: {
      ...state.order,
      toPay: order,
    },
    error: null,
  })),
  on(OrderActions.setToPayFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(OrderActions.setForReviewSuccess, (state, { order }) => ({
    ...state,
    order: {
      ...state.order,
      forReview: order,
    },
    error: null,
  })),
  on(OrderActions.setForReviewFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(OrderActions.setToPackSuccess, (state, { order }) => ({
    ...state,
    order: {
      ...state.order,
      toPack: order,
    },
    error: null,
  })),
  on(OrderActions.setToPackFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(OrderActions.setForPickupSuccess, (state, { order }) => ({
    ...state,
    order: {
      ...state.order,
      forPickup: order,
    },
    error: null,
  })),
  on(OrderActions.setForPickupFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(OrderActions.setToReceiveSuccess, (state, { order }) => ({
    ...state,
    order: {
      ...state.order,
      toReceive: order,
    },
    error: null,
  })),
  on(OrderActions.setToReceiveFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(OrderActions.setCancelledSuccess, (state, { order }) => ({
    ...state,
    order: {
      ...state.order,
      cancelled: order,
    },
    error: null,
  })),
  on(OrderActions.setCancelledFailure, (state, { error }) => ({
    ...state,
    error,
  })),

  on(OrderActions.setNewOrder, (state, { order }) => ({
    ...state,
    order: {
      ...state.order,
      toPay: [...state.order.toPay, order],
    },
    error: null,
  })),

  on(
    OrderActions.setOrderStatusSuccess,
    (state, { order, orderId, shopId, status }) => {
      console.log("-----------x", order);
      const statusBefore = order[0].status[order[0].status.length - 2];
      console.log("----------statusBefore", statusBefore);
      console.log("----------status", status);
      if (
        ["TO_PAY", "FOR_REVIEW"].includes(statusBefore.status) &&
        ["CANCELED", "SELLER_CANCELED", "BUYER_CANCELED"].includes(status)
      ) {
        return {
          ...state,
          order: {
            ...state.order,
            toPay: state.order.toPay.filter(
              (order) => order.orderId != orderId && order.shop._id != shopId
            ),
            forReview: state.order.toPay.filter(
              (order) => order.orderId != orderId && order.shop._id != shopId
            ),

            cancelled: [...order],
          },
          error: null,
        };
      } else if (statusBefore.status == "TO_PAY" && status == "FOR_REVIEW") {
        return {
          ...state,
          order: {
            ...state.order,
            toPay: state.order.toPay.filter(
              (order) => order.orderId != orderId && order.shop._id != shopId
            ),
            forReview: [...order],
          },
          error: null,
        };
      } else if (statusBefore.status == "FOR_REVIEW" && status == "TO_PACK") {
        return {
          ...state,
          order: {
            ...state.order,
            forReview: state.order.forReview.filter(
              (order) => order.orderId != orderId && order.shop._id != shopId
            ),
            toPack: [...order],
          },
          error: null,
        };
      } else if (statusBefore.status == "TO_PACK" && status == "FOR_PICKUP") {
        return {
          ...state,
          order: {
            ...state.order,
            toPack: state.order.toPack.filter(
              (order) => order.orderId != orderId && order.shop._id != shopId
            ),
            forPickup: [...order],
          },
          error: null,
        };
      } else if (
        statusBefore.status == "FOR_PICKUP" &&
        status == "TO_RECEIVE"
      ) {
        return {
          ...state,
          order: {
            ...state.order,
            forPickup: state.order.forPickup.filter(
              (order) => order.orderId != orderId && order.shop._id != shopId
            ),
            toReceive: [...order],
          },
          error: null,
        };
      } else {
        return {
          ...state,
          order: {
            ...state.order,
          },
          error: null,
        };
      }
    }
  ),
  on(OrderActions.setOrderStatusFailure, (state, { error }) => ({
    ...state,
    error,
  })),

  on(
    OrderActions.setLineItemOrderReceivedSuccess,
    (state, { order, orderId, shopId, lineItemId }) => ({
      ...state,
      order: {
        ...state.order,
        toReceive: state.order.toReceive.map((order) => {
          return {
            ...order,
            cart: order.cart.map((lineItem) => {
              if (lineItem._id == lineItemId) {
                return {
                  ...lineItem,
                  latestStatus: { status: "ORDER_RECEIVED" },
                };
              } else {
                return { ...lineItem };
              }
            }),
          };
        }),
      },
      error: null,
    })
  ),
  on(OrderActions.setLineItemOrderReceivedFailure, (state, { error }) => ({
    ...state,
    error,
  })),

  on(
    OrderActions.setReviewsSuccess,
    (state, { order, orderId, shopId, rating, comment }) => ({
      ...state,
      order: {
        ...state.order,
        toReceive: state.order.toReceive.map((order) => {
          if (order.orderId == orderId) {
            return {
              ...order,
              reviews: { rate: rating, comment },
            };
          } else {
            return { ...order };
          }
        }),
      },
      error: null,
    })
  ),
  on(OrderActions.setLineItemOrderReceivedFailure, (state, { error }) => ({
    ...state,
    error,
  }))
);
