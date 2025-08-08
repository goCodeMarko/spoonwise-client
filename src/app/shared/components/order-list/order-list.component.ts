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

@Component({
  selector: "app-order-list",
  templateUrl: "./order-list.component.html",
  styleUrls: ["./order-list.component.scss"],
  encapsulation: ViewEncapsulation.None, // Disable view encapsulation
})
export class OrderListComponent implements OnInit, OnDestroy {
  orderItems!: Order[];
  orderItems$!: Observable<Order[]>;

  @Input() type!: string;
  @Input() isShop = false;
  private destroy$ = new Subject<void>();
  account = {};
  output = "";
  storeRating = 5;
  storeComment = "";
  ratingForm: FormGroup;
  orderValue = Object.values(OrderStatusValue);
  orderLabels = OrderStatusLabels;
  paymentValue = Object.values(PaymentValue);
  paymentLabels = PaymentLabels;
  shippingOptionValue = Object.values(ShippingOptionValue);
  shippingOptionLabels = ShippingOptionLabels;
  onLalamoveStatusChangeSubscriber: Subscription;
  lalamoveShareLink: SafeResourceUrl = "";
  constructor(
    private store: Store,
    private auth: AuthService,
    private sheet: BottomSheetProvider,
    private vcRef: ViewContainerRef,
    private hrs: HttpRequestService,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private actions$: Actions,
    private socket: SocketService
  ) {
    this.account = JSON.parse(this.auth.getUserData());
    sheet.rootVcRef = vcRef;

    this.ratingForm = fb.group({
      rating: [this.storeRating, Validators.required],
      comment: [this.storeComment],
    });

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
        this.onBottomSheetClosed();
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
  shopId = "";
  orderId = "";
  lalamoveQoutationData: any = {};
  lalamoveStatus = "";
  lalamoveDriver = {};
  lalamoveOrder = {};

  async openSheet<T>(
    content: BottomSheetContent<T>,
    shopId: string,
    orderId: string
  ) {
    this.output = "";
    this.shopId = shopId;
    this.orderId = orderId;

    this.isLalamoveLoad = true;

    this.lalamoveQoutationData = {};
    this.lalamoveStatus = "";
    this.lalamoveDriver = {};
    this.lalamoveOrder = {};

    this.hrs.request(
      "get",
      "order/lalamove/getQuotation",
      { shopId: shopId, orderId: orderId },
      async (data: any) => {
        if (data.success) {
          this.lalamoveQoutationData = data.data.quotation;
          this.lalamoveStatus = data.data.lalamoveStatus;
          this.isLalamoveLoad = false;
        }

        if (
          ["ASSIGNING_DRIVER", "PICKED_UP", "ON_GOING", "COMPLETED"].includes(
            data.data.lalamoveStatus
          )
        ) {
          this.lalamoveOrder = {
            ...data.data.latestLalamoveOrder,
          };
          (this.lalamoveShareLink =
            this.sanitizer.bypassSecurityTrustResourceUrl(
              data.data.latestLalamoveOrder.shareLink
            )),
            (this.lalamoveDriver = data.data.latestLalamoveDriver);

          console.log("==", this.lalamoveOrder);
          console.log("==", this.lalamoveDriver);
        }
      }
    );

    const value = await this.sheet.show(content, {
      title: "",
      stops: [3500, 1000],
    });

    this.output = value;

    this.onBottomSheetClosed();
  }

  trackByOrderId(index: number, order: any): string {
    return order.orderId;
  }

  trackByLineItemId(index: number, item: any): string {
    return item.productId;
  }

  findDriver() {
    this.isLalamoveLoad = true;
    this.hrs.request(
      "post",
      "order/lalamove/createOrder",
      {
        shopId: this.shopId,
        quotation: this.lalamoveQoutationData,
        orderId: this.orderId,
      },
      async (data: any) => {
        if (data.success) {
          this.lalamoveStatus = data.data.status;

          this.lalamoveOrder = {
            ...data.data,
          };

          this.lalamoveShareLink =
            this.sanitizer.bypassSecurityTrustResourceUrl(data.data.shareLink);
        }

        this.isLalamoveLoad = false;
      }
    );
  }

  stopFinding(lalamoveOrder: object) {
    this.isLalamoveLoad = true;
    this.hrs.request(
      "put",
      "order/lalamove/stopFindingDrivers",
      {
        lalamoveOrder,
      },
      async (data: any) => {
        if (data.success) {
        }

        this.isLalamoveLoad = false;
      }
    );
  }

  onBottomSheetClosed() {
    this.isLalamoveLoad = true;
    this.shopId = "";
    this.orderId = "";
    this.lalamoveQoutationData = {};
    this.lalamoveStatus = "";
    this.lalamoveDriver = {};
    this.lalamoveOrder = {};
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

  storeRateBtnOnLoad = false;
  storeRateOrderId: string = "";
  storeRateShopId: string = "";
  storeRate(orderId: string, shopId: string) {
    const rating = this.ratingForm.get("rating")?.value;
    const comment = this.ratingForm.get("comment")?.value;

    this.storeRateBtnOnLoad = true;
    this.store.dispatch(
      setReviews({
        orderId: this.storeRateOrderId,
        shopId: this.storeRateShopId,
        rating,
        comment,
      })
    );
    this.storeRatingSheetClosed();
    this.storeRateBtnOnLoad = false;
  }

  async openStoreRatingSheet<T>(
    content: BottomSheetContent<T>,
    orderId: string,
    shopId: string
  ) {
    this.storeRateBtnOnLoad = false;
    this.storeRateOrderId = orderId;
    this.storeRateShopId = shopId;
    const value = await this.sheet.show(content, {
      title: "",
      stops: [3500, 1000],
    });

    this.output = value;

    this.storeRatingSheetClosed();
  }

  storeRatingSheetClosed() {
    this.storeRateBtnOnLoad = false;
  }
}
