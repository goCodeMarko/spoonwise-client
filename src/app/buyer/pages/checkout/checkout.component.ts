import { Component, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { Observable, Subject } from "rxjs";
import {
  selectCartItems,
  selectLineItemCount,
  selectCartError,
  selectLineItemTotal,
  selectOrderQtyCount,
  selectCheckedLineItemCount,
  selectCheckedLineItems,
} from "../../../shared/store/cart/cart.selectors";
import { takeUntil } from "rxjs/operators";
import { HttpRequestService } from "src/app/http-request/http-request.service";

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
  subtotal?: number;
  totalItems?: number;
}

@Component({
  selector: "app-checkout",
  templateUrl: "./checkout.component.html",
  styleUrls: ["./checkout.component.scss"],
})
export class CheckoutComponent implements OnInit {
  static componentName = "CheckoutComponent";
  checkedLineItems!: CartItem[];
  selectCheckedLineItems$: Observable<CartItem[]>;
  selectLineItemTotal$: Observable<number>;
  lineItemTotal: number = 0;
  private destroy$ = new Subject<void>();
  paymentMethod: string = "ONLINE";
  shippingOption: string = "LALAMOVE";
  disabledLalamoveBtn = false;

  // commission: number = 0;
  // selectCommission$: Observable<number>;

  constructor(
    private store: Store,
    private router: Router,
    private _snackBar: MatSnackBar,
    private hrs: HttpRequestService
  ) {
    this.selectCheckedLineItems$ = this.store
      .select(selectCheckedLineItems)
      .pipe(takeUntil(this.destroy$));
    this.selectLineItemTotal$ = this.store
      .select(selectLineItemTotal)
      .pipe(takeUntil(this.destroy$));
  }

  ngOnInit(): void {
    this.selectCheckedLineItems$.subscribe((data) => {
      console.log(
        "//////////////////checkedLineItems$ CheckoutComponent",
        data
      );

      const sortedData = JSON.parse(JSON.stringify(data));
      const response = sortedData
        .sort((a: any, b: any) =>
          a.shop.businessName.localeCompare(b.shop.businessName)
        )
        .map((shop: any) => {
          // Sort lineItems by name within each shop
          shop.lineItems.sort((a: any, b: any) => a.name.localeCompare(b.name));
          return shop;
        });

      this.checkedLineItems = response;
    });
    this.selectLineItemTotal$.subscribe((data) => {
      this.lineItemTotal = data;
    });

    // this.selectCommission$.subscribe((data) => {
    //
    //   this.commission = data;
    // });
  }

  changePaymentMethod(value: string) {
    this.paymentMethod = value;
    if (value == "CASH") {
      this.disabledLalamoveBtn = true;
      if (this.shippingOption == "LALAMOVE")
        this.shippingOption = "STORE_PICKUP";
    } else {
      this.disabledLalamoveBtn = false;
    }
  }

  changeShippingOption(value: string) {
    this.shippingOption = value;
    if (value == "CASH") {
      if (this.shippingOption == "LALAMOVE")
        this.shippingOption = "STORE_PICKUP";
    }
  }

  checkoutAPI() {
    this.hrs.request(
      "post",
      `order/checkout`,
      {
        totalPayment: this.lineItemTotal,
        cart: this.checkedLineItems,
        paymentMethod: this.paymentMethod,
        shippingOption: this.shippingOption,
      },
      async (res: any) => {
        if (res.success) {
          if (this.paymentMethod == "ONLINE") {
            window.location.href = res.data.invoice.url;
          } else {
            this.router.navigate(["/"]);
          }
        } else {
        }
      }
    );
  }
}
