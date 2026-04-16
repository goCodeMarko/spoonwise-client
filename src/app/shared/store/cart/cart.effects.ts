import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { HttpClient } from "@angular/common/http";
import { catchError, filter, map, mergeMap, tap } from "rxjs/operators";
import { of } from "rxjs";
import * as CartActions from "./cart.actions";
import { environment } from "../../../../environments/environment";
import { MatDialog } from "@angular/material/dialog";
import { PopUpModalComponent } from "src/app/modals/pop-up-modal/pop-up-modal.component";

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
  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private dialog: MatDialog,
  ) {}

  // set cart from backend
  setCart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.setCart),
      mergeMap(() =>
        this.http
          .get(`${environment.SERVER_URL_CLUSTERS}user/getCart`, {
            withCredentials: true,
          })
          .pipe(
            map((data: any) => {
              let cart: CartItem[] = data.data;
              return CartActions.setCartSuccess({ cart });
            }),
            catchError((error: any) =>
              of(CartActions.setCartFailure({ error: error.message })),
            ),
          ),
      ),
    ),
  );

  addToCart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.addToCart),
      mergeMap(({ shop, lineItem, showSuccessModal }) =>
        this.http
          .post(
            `${environment.SERVER_URL_CLUSTERS}user/addToCart`,
            {
              shop,
              lineItem,
            },
            { withCredentials: true },
          )
          .pipe(
            map(() =>
              CartActions.addToCartSuccess({ shop, lineItem, showSuccessModal }),
            ),
            catchError((error) => {
              return of(CartActions.addToCartFailure({ error }));
            }),
          ),
      ),
    ),
  );

  showAddToCartSuccessModal$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CartActions.addToCartSuccess),
        filter(({ showSuccessModal }) => !!showSuccessModal),
        tap(({ lineItem }) => {
          this.dialog.open(PopUpModalComponent, {
            width: "500px",
            data: {
              deletebutton: false,
              okaybutton: true,
              okayBtnText:
                '<b><span style="font-size: 30px;line-height: 1;vertical-align: middle;">&#127881;</span> Sounds good!</b>',
              title: "Added to Cart!",
              message: `${lineItem.name} has been added to your cart successfully.`,
              file: "assets/icons/party.png",
            },
          });
        }),
      ),
    { dispatch: false },
  );
}
