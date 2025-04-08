import { createAction, props } from "@ngrx/store";
export interface LineItem {
  checked?: boolean;
  productId: string;
  name: string;
  qty: number;
  orderQty: number;
  images: string[];
  expiryDate: string;
  price: number;
  description: string;
  category: string[];
  specialOffers: string[];
  commision?: number;
  points?: number;
}

export interface Shop {
  checked?: boolean;
  shopId: string;
  businessName: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  address1: string;
  address2: string;
}

export interface CartItem {
  shop: Shop;
  lineItems: LineItem[];
}

export const setCart = createAction("[Cart] Set Cart");

export const setCartSuccess = createAction(
  "[Cart] Set Cart Success",
  props<{ cart: CartItem[] }>()
);

export const setCartFailure = createAction(
  "[Cart] Set Cart Failure",
  props<{ error: string }>()
);

export const addToCart = createAction(
  "[Cart] Add To Cart",
  props<{ shop: Shop; lineItem: LineItem }>()
);

export const addToCartSuccess = createAction(
  "[Cart] Add To Cart Success",
  props<{ shop: Shop; lineItem: LineItem }>()
);

export const addToCartFailure = createAction(
  "[Cart] Add To Cart Failure",
  props<{ error: any }>()
);

export const removeFromCart = createAction(
  "[Cart] Remove From Cart",
  props<{ productId: string }>()
);

export const updateCart = createAction(
  "[Cart] Update Cart",
  props<{ productId: string; orderQty: number }>()
);

export const clearCartError = createAction("[Cart] Clear Cart Error");
