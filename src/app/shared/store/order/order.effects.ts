import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { HttpClient } from "@angular/common/http";
import { catchError, map, mergeMap } from "rxjs/operators";
import { of } from "rxjs";
import { Order } from "./order.state";
import * as OrderActions from "./order.actions";
import { environment } from "../../../../environments/environment";
import { MatDialog } from "@angular/material/dialog";
import { PopUpModalComponent } from "src/app/modals/pop-up-modal/pop-up-modal.component";

@Injectable()
export class OrderEffects {
  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private dialog: MatDialog,
  ) {}

  setToPay$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrderActions.setToPay),
      mergeMap(() =>
        this.http
          .get(`${environment.SERVER_URL_CLUSTERS}order/getOrders/to_pay`, {
            withCredentials: true,
          })
          .pipe(
            map((data: any) => {
              let order: Order[] = data.data;
              return OrderActions.setToPaySuccess({ order });
            }),
            catchError((error: any) =>
              of(OrderActions.setToPayFailure({ error: error.message })),
            ),
          ),
      ),
    ),
  );

  setForReview$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrderActions.setForReview),
      mergeMap(() =>
        this.http
          .get(`${environment.SERVER_URL_CLUSTERS}order/getOrders/for_review`, {
            withCredentials: true,
          })
          .pipe(
            map((data: any) => {
              let order: Order[] = data.data;
              return OrderActions.setForReviewSuccess({ order });
            }),
            catchError((error: any) =>
              of(OrderActions.setForReviewFailure({ error: error.message })),
            ),
          ),
      ),
    ),
  );

  setToPack$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrderActions.setToPack),
      mergeMap(() =>
        this.http
          .get(`${environment.SERVER_URL_CLUSTERS}order/getOrders/to_pack`, {
            withCredentials: true,
          })
          .pipe(
            map((data: any) => {
              let order: Order[] = data.data;
              return OrderActions.setToPackSuccess({ order });
            }),
            catchError((error: any) =>
              of(OrderActions.setToPackFailure({ error: error.message })),
            ),
          ),
      ),
    ),
  );

  setForPickup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrderActions.setForPickup),
      mergeMap(() =>
        this.http
          .get(`${environment.SERVER_URL_CLUSTERS}order/getOrders/for_pickup`, {
            withCredentials: true,
          })
          .pipe(
            map((data: any) => {
              let order: Order[] = data.data;
              return OrderActions.setForPickupSuccess({ order });
            }),
            catchError((error: any) =>
              of(OrderActions.setForPickupFailure({ error: error.message })),
            ),
          ),
      ),
    ),
  );

  setToReceive$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrderActions.setToReceive),
      mergeMap(() =>
        this.http
          .get(`${environment.SERVER_URL_CLUSTERS}order/getOrders/to_receive`, {
            withCredentials: true,
          })
          .pipe(
            map((data: any) => {
              let order: Order[] = data.data;

              return OrderActions.setToReceiveSuccess({ order });
            }),
            catchError((error: any) =>
              of(OrderActions.setToReceiveFailure({ error: error.message })),
            ),
          ),
      ),
    ),
  );

  setCancelled$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrderActions.setCancelled),
      mergeMap(() =>
        this.http
          .get(`${environment.SERVER_URL_CLUSTERS}order/getOrders/cancelled`, {
            withCredentials: true,
          })
          .pipe(
            map((data: any) => {
              let order: Order[] = data.data;
              return OrderActions.setCancelledSuccess({ order });
            }),
            catchError((error: any) =>
              of(OrderActions.setCancelledFailure({ error: error.message })),
            ),
          ),
      ),
    ),
  );

  setLineItemOrderReceived$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(OrderActions.setLineItemOrderReceived),
      mergeMap(({ orderId, shopId, lineItemId }) =>
        this.http
          .put(
            `${environment.SERVER_URL_CLUSTERS}order/updateOrderLineItemStatus`,
            {
              orderId,
              shopId,
              lineItemId,
              status: "ORDER_RECEIVED",
            },
            { withCredentials: true },
          )
          .pipe(
            map((data: any) => {
              let order: Order = data.data;

              return OrderActions.setLineItemOrderReceivedSuccess({
                order,
                orderId,
                shopId,
                lineItemId,
              });
            }),
            catchError((error: any) =>
              of(
                OrderActions.setLineItemOrderReceivedFailure({
                  error: error.message,
                }),
              ),
            ),
          ),
      ),
    );
  });

  setOrderStatusCancel$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(OrderActions.setOrderStatus),
      mergeMap(({ orderId, shopId, status }) =>
        this.http
          .put(
            `${environment.SERVER_URL_MAIN}order/updateOrderStatus`,
            {
              orderId,
              shopId,
              status,
            },
            { withCredentials: true },
          )
          .pipe(
            map((data: any) => {
              let order: Order[] = data.data;

              return OrderActions.setOrderStatusSuccess({
                order,
                orderId,
                shopId,
                status,
              });
            }),
            catchError((error: any) =>
              of(
                OrderActions.setOrderStatusFailure({
                  error: error.message,
                }),
              ),
            ),
          ),
      ),
    );
  });

  setReviews$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrderActions.setReviews),
      mergeMap(({ orderId, shopId, rating, comment }) =>
        this.http
          .put(
            `${environment.SERVER_URL_CLUSTERS}order/updateStoreReviews`,
            {
              orderId,
              shopId,
              rating,
              comment,
            },
            { withCredentials: true },
          )
          .pipe(
            map((data: any) => {
              let order: Order = data.data;

              this.dialog.open(PopUpModalComponent, {
                width: "500px",
                data: {
                  deletebutton: false,
                  okaybutton: false,
                  title: "Thank You!",
                  message:
                    "You have <b>successfully rated</b> the store. <br>" +
                    "Your feedback helps us improve and serve you better!",
                  file: "assets/icons/badge.png",
                },
              });

              return OrderActions.setReviewsSuccess({
                order,
                orderId,
                shopId,
                rating,
                comment,
              });
            }),
            catchError((error: any) =>
              of(
                OrderActions.setReviewsFailure({
                  error: error.message,
                }),
              ),
            ),
          ),
      ),
    ),
  );
}
