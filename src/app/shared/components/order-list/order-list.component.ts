import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewContainerRef,
  ViewEncapsulation,
} from "@angular/core";
import { Observable, Subject } from "rxjs";
import { Order } from "./../../../shared/store/order/order.state";
import { takeUntil } from "rxjs/operators";
import { Store } from "@ngrx/store";
import {
  selectToPay,
  selectForReview,
  selectToPack,
  selectForPickup,
  selectToReceive,
  selectCancelled,
} from "../../store/order/order.selectors";
import { AuthService } from "src/app/authorization/auth.service";
import {
  BottomSheetContent,
  BottomSheetProvider,
} from "swipe-bottom-sheet/angular";
import { HttpRequestService } from "src/app/http-request/http-request.service";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import {
  setLineItemOrderReceived,
  setReviews,
} from "../../store/order/order.actions";
import { dispatch } from "rxjs/internal/observable/pairs";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

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
  private destroy$ = new Subject<void>();
  account = {};
  output = "";
  storeRating = 5;
  storeComment = "";
  ratingForm: FormGroup;

  constructor(
    private store: Store,
    private auth: AuthService,
    private sheet: BottomSheetProvider,
    private vcRef: ViewContainerRef,
    private hrs: HttpRequestService,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder
  ) {
    this.account = JSON.parse(this.auth.getUserData());
    sheet.rootVcRef = vcRef;

    this.ratingForm = fb.group({
      rating: [this.storeRating, Validators.required],
      comment: [this.storeComment],
    });
  }

  ngOnInit(): void {
    this.orderItems$.subscribe((data) => {
      this.orderItems = data;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('changes["data"]', changes.type.currentValue);
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
        console.log("---------data", data);
        if (data.success) {
          this.lalamoveQoutationData = data.data.quotation;
          this.lalamoveStatus = data.data.lalamoveStatus;
          this.isLalamoveLoad = false;
        }

        console.log("-----------xxxxxxxx", data.data.lalamoveStatus);

        if (
          ["ASSIGNING_DRIVER", "PICKED_UP", "ON_GOING", "COMPLETED"].includes(
            data.data.lalamoveStatus
          )
        ) {
          this.lalamoveOrder = {
            ...data.data.latestLalamoveOrder,
            shareLink: this.sanitizer.bypassSecurityTrustResourceUrl(
              data.data.latestLalamoveOrder.shareLink
            ),
          };
          this.lalamoveDriver = data.data.latestLalamoveDriver;

          console.log("-------this.lalamoveOrder", this.lalamoveOrder);
          console.log("------- this.lalamoveDriver", this.lalamoveDriver);
          console.log("------- this.lalamoveDriver", this.lalamoveDriver);
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

  findDriver() {
    console.log("--------------this.orderId2", this.orderId);
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
        console.log("---------------x", data);
        if (data.success) {
          this.lalamoveStatus = data.data.status;

          this.lalamoveOrder = {
            ...data.data,
            shareLink: this.sanitizer.bypassSecurityTrustResourceUrl(
              data.data.shareLink
            ),
          };
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
    console.log("close");
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

  orderReceived(orderId: string, shopId: string, lineItemId: string) {
    this.store.dispatch(
      setLineItemOrderReceived({ orderId, shopId, lineItemId })
    );
  }

  isCancelBtnLoad = false;
  cancel(orderId: string, shopId: string) {
    console.log("------orderId", orderId);
    this.isCancelBtnLoad = true;
    this.hrs.request(
      "put",
      "order/updateOrderStatus",
      {
        orderId,
        shopId,
        status: "BUYER_CANCELED",
      },
      async (data: any) => {
        this.isCancelBtnLoad = false;
        if (data.success) {
        }
      }
    );
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
    console.log("close");
    this.storeRateBtnOnLoad = false;
  }
}
