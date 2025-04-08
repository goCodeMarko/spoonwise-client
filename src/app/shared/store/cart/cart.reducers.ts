import { createReducer, on } from "@ngrx/store";
import * as CartActions from "./cart.actions";

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

export interface CartState {
  cart: CartItem[];
  error: any;
}

export const initialState: CartState = {
  cart: [],
  error: null,
};

export const cartReducer = createReducer(
  initialState,
  on(CartActions.setCartSuccess, (state, { cart }) => ({
    ...state,
    cart: cart,
    error: null,
  })),
  on(CartActions.setCartFailure, (state, { error }) => ({
    ...state,
    error,
  })),

  on(CartActions.addToCartSuccess, (state, { shop, lineItem }) => {
    // 1. Check if the shop already exists in the cart
    const shopRes = state.cart.find(
      (shopF) => shopF.shop.shopId === shop.shopId
    );

    if (shopRes) {
      console.log("Shop Exists");

      // 2. Check if the product already exists within the shop's line items
      const product = shopRes.lineItems.find(
        (prod) => prod.productId === lineItem.productId
      );

      if (product) {
        console.log("Product Exists");

        // 3. If the product exists, update it by:
        //    -  Copying all the lineitems of the shop except for the lineitem that need to be updated
        //    -  Adding the updated lineitem
        return {
          ...state,
          cart: [
            ...state.cart.filter(
              (shop) => shop.shop.shopId !== shopRes.shop.shopId
            ), // Remove the existing shop from the cart
            ...state.cart // Add the updated shop with the modified product
              .filter((shop) => shop.shop.shopId == shopRes.shop.shopId)
              .map((shop) => {
                return {
                  lineItems: [
                    // Remove the existing product
                    ...shop.lineItems.filter(
                      (prod) => prod.productId !== lineItem.productId
                    ),
                    // Add the new product (updated version)
                    lineItem,
                  ].map((item) => {
                    const total = item.orderQty * item.price;
                    return {
                      ...item,
                      commission: +(total * 0.1).toFixed(2),
                      points: +(total * 0.01).toFixed(2),
                    };
                  }),
                  shop: shop.shop,
                };
              }),
          ],
        };
      } else {
        // 4. If the shop exists but the product is new, add the new product
        return {
          ...state,
          cart: [
            ...state.cart.filter(
              (shop) => shop.shop.shopId !== shopRes.shop.shopId
            ), // Copying all the data in cart except the shop that need an update
            { lineItems: [...shopRes.lineItems, lineItem], shop: shopRes.shop }, // Add the updated shop with the new product
          ],
        };
      }
    } else {
      console.log("No Shop Found");
      // 5. If the shop does not exist, create a new shop entry with the product
      return {
        ...state,
        cart: [...state.cart, { lineItems: [lineItem], shop: shop }],
      };
    }
  }),
  on(CartActions.addToCartFailure, (state, { error }) => ({
    ...state,
    error: error.error.error, // Store error on failure
  })),

  on(CartActions.clearCartError, (state) => ({
    ...state,
    error: null,
  }))

  // on(CartActions.removeFromCart, (state, { productId }) => ({
  //   ...state,
  //   items: state.items.filter((i: CartItem) => i.productId !== productId),
  // })),

  // on(CartActions.updateQuantity, (state, { productId, quantity }) => ({
  //   ...state,
  //   items: state.items.map((i: CartItem) =>
  //     i.productId === productId ? { ...i, quantity } : i
  //   ),
  // })),

  // on(CartActions.clearCart, () => initialState)

  // [{
  //   storeId: "434234234",
  //   lineItems: [{ productId: "35455", orderQty: 12 }],
  // }],
);
