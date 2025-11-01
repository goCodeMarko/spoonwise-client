import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewContainerRef,
  ViewEncapsulation,
} from "@angular/core";
import { Observable, Subject, Subscription } from "rxjs";
import { Order } from "./../../../shared/store/order/order.state";
import { take, takeUntil } from "rxjs/operators";
import { Store } from "@ngrx/store";
import {
  selectToPay,
  selectForReview,
  selectToPack,
  selectForPickup,
  selectToReceive,
  selectCancelled,
} from "../../store/order/order.selectors";
import { Actions, ofType } from "@ngrx/effects";
import { AuthService } from "src/app/authorization/auth.service";
import {
  BottomSheetContent,
  BottomSheetProvider,
} from "swipe-bottom-sheet/angular";
import { HttpRequestService } from "src/app/http-request/http-request.service";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import {
  setLineItemOrderReceived,
  setLineItemOrderReceivedSuccess,
  setReviews,
  setOrderStatus,
  setToReceiveSuccess,
  setForPickup,
  setToReceive,
} from "../../store/order/order.actions";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { PopUpModalComponent } from "../../../modals/pop-up-modal/pop-up-modal.component";
import { MatDialog } from "@angular/material/dialog";
import {
  OrderStatusValue,
  OrderStatusLabels,
  PaymentLabels,
  PaymentValue,
  ShippingOptionLabels,
  ShippingOptionValue,
} from "./../../../shared/enums/index";
import { SocketService } from "../../socket/socket.service";
import { LalamoveRequestDetailsComponent } from "src/app/bottom-sheets/lalamove-request-details/lalamove-request-details.component";
import { RateShopComponent } from "src/app/bottom-sheets/rate-shop/rate-shop.component";

@Component({
  selector: "app-order-list",
  templateUrl: "./order-list.component.html",
  styleUrls: ["./order-list.component.scss"],
  encapsulation: ViewEncapsulation.None, // Disable view encapsulation
})
export class OrderListComponent implements OnInit, OnDestroy {
  @Input() type!: string;
  @Input() isShop = false;

  public orderItems!: Order[];
  public orderItems$!: Observable<Order[]>;
  private destroy$ = new Subject<void>();
  public account = {};
  public orderValue = Object.values(OrderStatusValue);
  public orderLabels = OrderStatusLabels;
  public paymentValue = Object.values(PaymentValue);
  public paymentLabels = PaymentLabels;
  public shippingOptionValue = Object.values(ShippingOptionValue);
  public shippingOptionLabels = ShippingOptionLabels;
  public onLalamoveStatusChangeSubscriber: Subscription;

  constructor(
    private store: Store,
    private auth: AuthService,
    private swipeSheet: BottomSheetProvider,
    private hrs: HttpRequestService,
    private dialog: MatDialog,
    private actions$: Actions,
    private socket: SocketService
  ) {
    this.account = JSON.parse(this.auth.getUserData());

    this.onLalamoveStatusChangeSubscriber = this.socket
      .onLalamoveStatusChange()
      .subscribe((lalamove: any) => {
        console.log("&&&&&&& onLalamoveStatusChange", lalamove);
        if (lalamove.role === "seller") {
          this.store.dispatch(setForPickup());
        } else if (lalamove.role === "buyer") {
          this.lalamoveOrder = {
            ...lalamove.orderFullDetails,
          };
          this.lalamoveDriver = { phone: lalamove.driverPhone };
        }

        if (lalamove.orderFullDetails.status === "PICKED_UP") {
          this.store.dispatch(setForPickup());
          this.store.dispatch(setToReceive());
        }
      });
  }

  ngOnInit(): void {
    this.orderItems$.subscribe((data) => {
      this.orderItems = data;
    });

    this.actions$
      .pipe(ofType(setLineItemOrderReceivedSuccess), takeUntil(this.destroy$))
      .subscribe((action) => {
        this.dialog.open(PopUpModalComponent, {
          width: "500px",
          data: {
            deletebutton: false,
            okaybutton: false,
            title: "Order Received",
            message:
              "<b >" +
              this.earnedPoints +
              " points</b> has been added in your account",
            file: "assets/icons/badge.png",
          },
        });
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    switch (changes.type.currentValue) {
      case "to_pay":
        this.orderItems$ = this.store
          .select(selectToPay)
          .pipe(takeUntil(this.destroy$));
        break;
      case "for_review":
        this.orderItems$ = this.store
          .select(selectForReview)
          .pipe(takeUntil(this.destroy$));
        break;
      case "to_pack":
        this.orderItems$ = this.store
          .select(selectToPack)
          .pipe(takeUntil(this.destroy$));
        break;
      case "for_pickup":
        // this.onBottomSheetClosed();
        this.orderItems$ = this.store
          .select(selectForPickup)
          .pipe(takeUntil(this.destroy$));
        break;
      case "to_receive":
        this.orderItems$ = this.store
          .select(selectToReceive)
          .pipe(takeUntil(this.destroy$));
        break;
      case "cancelled":
        this.orderItems$ = this.store
          .select(selectCancelled)
          .pipe(takeUntil(this.destroy$));
        break;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.onLalamoveStatusChangeSubscriber.unsubscribe();
  }

  payNow(url: string) {
    window.location.href = url;
  }

  isLalamoveLoad = true;
  lalamoveQoutationData: any = {};
  lalamoveStatus = "";
  lalamoveDriver = {};
  lalamoveOrder = {};

  async openLalamoveRequestDetailsSheet(shopId: string, orderId: string) {
    const value = await this.swipeSheet.show(LalamoveRequestDetailsComponent, {
      title: "",
      props: {
        shopId,
        orderId,
      },
      stops: [window.innerHeight, 500],
    });
  }

  trackByOrderId(index: number, order: any): string {
    return order.orderId;
  }

  trackByLineItemId(index: number, item: any): string {
    return item.productId;
  }

  pickUpMeetUp(orderId: string, shopId: string) {
    this.hrs.request(
      "put",
      "order/updateOrderStatus",
      {
        orderId,
        shopId,
        status: "TO_RECEIVE",
      },
      async (data: any) => {
        if (data.success) {
        }
      }
    );
  }

  earnedPoints = 0;
  orderReceived(
    orderId: string,
    shopId: string,
    lineItemId: string,
    points: number
  ) {
    this.earnedPoints = points;

    this.store.dispatch(
      setLineItemOrderReceived({ orderId, shopId, lineItemId })
    );
  }

  updateOrderStatus(
    order: any,
    orderId: string,
    shopId: string,
    status: string
  ) {
    let message,
      title = "";
    switch (status) {
      case "CANCELED":
        title = "Cancel Order";
        message = `Are you sure you want to cancel <strong>#${orderId}</strong>?`;
        break;
      case "FOR_REVIEW":
        title = "For Review";
        message = `Are you sure you want to move <strong>#${orderId}</strong> to <strong>For Review</strong>?`;
        break;
      case "TO_PACK":
        title = "To Pack";
        message = `Are you sure you want to move <strong>#${orderId}</strong> to <strong>To Pack</strong>?`;
        break;

      case "FOR_PICKUP":
        title = "For Pickup";
        message = `Are you sure you want to move <strong>#${orderId}</strong> to <strong>For Pickup</strong>?`;
        break;
    }
    const confirmation = this.dialog.open(PopUpModalComponent, {
      width: "500px",
      data: {
        deletebutton: false,
        okaybutton: false,
        yesBtn: true,
        noBtn: true,
        title,
        message,
        file: "assets/icons/exclamation.png",
      },
    });

    confirmation.afterClosed().subscribe((result) => {
      if (result) {
        this.store.dispatch(setOrderStatus({ orderId, shopId, status }));
      }
    });
  }

  async openStoreRatingSheet(orderId: string, shopId: string) {
    const value = await this.swipeSheet.show(RateShopComponent, {
      title: "",
      props: {
        shopId,
        orderId,
      },
      stops: [1500, 1000],
    });
  }
}
