import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { HttpClient } from "@angular/common/http";
import { catchError, map, mergeMap } from "rxjs/operators";
import { of } from "rxjs";
import * as CartActions from "./cart.actions";
import { environment } from "../../../../environments/environment";

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
    lng: number;
  };
  address1: string;
  address2: string;
}

export interface CartItem {
  shop: Shop;
  lineItems: LineItem[];
}

@Injectable()
export class CartEffects {
  constructor(private actions$: Actions, private http: HttpClient) {}

  // set cart from backend
  setCart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.setCart),
      mergeMap(() =>
        this.http.get(`${environment.SERVER_URL_CLUSTERS}user/getCart`).pipe(
          map((data: any) => {
            let cart: CartItem[] = data.data;
            return CartActions.setCartSuccess({ cart });
          }),
          catchError((error: any) =>
            of(CartActions.setCartFailure({ error: error.message }))
          )
        )
      )
    )
  );

  addToCart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.addToCart),
      mergeMap(({ shop, lineItem }) =>
        this.http
          .post(`${environment.SERVER_URL_CLUSTERS}user/addToCart`, {
            shop,
            lineItem,
          })
          .pipe(
            map(() => CartActions.addToCartSuccess({ shop, lineItem })),
            catchError((error) => {
              return of(CartActions.addToCartFailure({ error }));
            })
          )
      )
    )
  );
}
