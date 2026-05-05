import { Component, OnDestroy, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import {
  setCancelled,
  setCancelledSuccess,
  setForPickup,
  setForReview,
  setNewOrder,
  setOrderStatusSuccess,
  setToPack,
  setToPay,
  setToReceive,
} from "../../store/order/order.actions";
import { selectPoints } from "../../store/order/order.selectors";
import { AuthService } from "src/app/authorization/auth.service";
import { takeUntil } from "rxjs/operators";
import { Observable, Subject, Subscriber, Subscription } from "rxjs";
import { SocketService } from "../../socket/socket.service";
import { Router } from "@angular/router";
import { clearCart } from "../../store/cart/cart.actions";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
})
export class ProfileComponent implements OnInit, OnDestroy {
  static componentName = "ProfileComponent";
  selectedTab = "to_pay";
  points: number = 0;
  points$: Observable<number>;
  authUser: any;
  private destroy$ = new Subject<void>();
  onOrderListSocketUpdateSubscriber: Subscription;
  onNewOrderSubscriber: Subscription;
  onPaidOrderSubscriber: Subscription;
  onExpirePaymentOrderSubscriber: Subscription;

  constructor(
    private store: Store,
    private auth: AuthService,
    private socket: SocketService,
    private router: Router,
  ) {
    console.log("ProfileComponent Initiated!");

    this.points$ = this.store
      .select(selectPoints)
      .pipe(takeUntil(this.destroy$));

    this.onOrderListSocketUpdateSubscriber = this.socket
      .onOrderListSocketUpdate()
      .subscribe((order: any) => {
        const { orderId, shopId, latestStatus } = order[0];
        console.log("----------socket-order", order);
        console.log("----------socket-order", orderId);
        console.log("----------socket-order", shopId);
        console.log("----------socket-order", latestStatus.status);

        this.store.dispatch(
          setOrderStatusSuccess({
            order,
            orderId,
            shopId,
            status: latestStatus.status,
          }),
        );
      });

    this.onNewOrderSubscriber = this.socket
      .onNewOrder()
      .subscribe((order: any) => {
        this.store.dispatch(setToPay());
      });

    this.onPaidOrderSubscriber = this.socket
      .onNewOrder()
      .subscribe((order: any) => {
        console.log("&&&&&&& onPaidOrder", order);
        this.store.dispatch(setToPay());
      });

    this.onExpirePaymentOrderSubscriber = this.socket
      .onExpirePaymentOrder()
      .subscribe((order: any) => {
        console.log("&&&&&&& onExpirePaymentOrder", order);
        this.store.dispatch(setToPay());
      });
  }

  ngOnInit(): void {
    this.userData();
    this.points$.subscribe((data) => {
      this.points = data;
    });

    this.store.dispatch(setToPay());
    this.store.dispatch(setForReview());
    this.store.dispatch(setToPack());
    this.store.dispatch(setForPickup());
    this.store.dispatch(setToReceive());
    this.store.dispatch(setCancelled());
  }

  ngOnDestroy(): void {
    this.onOrderListSocketUpdateSubscriber.unsubscribe();
    this.onNewOrderSubscriber.unsubscribe();
    this.onPaidOrderSubscriber.unsubscribe();
    this.onExpirePaymentOrderSubscriber.unsubscribe();

    this.destroy$.next();
    this.destroy$.complete();
  }

  load = true;
  async userData() {
    await this.auth.updateUserData();
    this.load = false;
    this.authUser = JSON.parse(this.auth.getUserData());
    console.log("---xxxxxxxxx", this.authUser);
  }

  logout(): void {
    this.store.dispatch(clearCart());
    this.auth.logout();
  }
}
