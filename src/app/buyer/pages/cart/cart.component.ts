import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable, Subject } from "rxjs";
import {
  addToCart,
  removeFromCart,
  updateCart,
  clearCartError,
} from "../../../shared/store/cart/cart.actions";
import {
  selectCartItems,
  selectLineItemCount,
  selectCartError,
  selectLineItemTotal,
  selectOrderQtyCount,
  selectCheckedLineItemCount,
  selectCommissionPoints,
  selectPoints,
} from "../../../shared/store/cart/cart.selectors";
import { debounceTime, takeUntil } from "rxjs/operators";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import * as _ from "lodash";

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

@Component({
  selector: "app-cart",
  templateUrl: "./cart.component.html",
  styleUrls: ["./cart.component.scss"],
})
export class CartComponent implements OnInit {
  static componentName = "CartComponent";
  cartItems!: CartItem[];
  cartItems$: Observable<CartItem[]>;
  lineItemCount$: Observable<number>;
  lineItemCount: number = 0;
  stateError$: Observable<any>;
  isFilled: Boolean = false;
  selectLineItemTotal$: Observable<number>;
  lineItemTotal: number = 0;
  selectOrderQtyCount$: Observable<number>;
  orderQtyCount: number = 0;
  selectCheckedLineItemCount$: Observable<number>;
  checkedLineItemCount: number = 0;
  private destroy$ = new Subject<void>();
  // private qtyChange$ = new Subject<{
  //   orderQty: any;
  //   lineItem: any;
  //   shop: any;
  // }>();
  private debounceMap: { [productId: string]: Subject<any> } = {};
  forCheckout: CartItem[] = [];

  // commission: number = 0;
  // selectCommissionPoints$: Observable<number>;

  constructor(
    private store: Store,
    private router: Router,
    private _snackBar: MatSnackBar
  ) {
    this.cartItems$ = this.store
      .select(selectCartItems)
      .pipe(takeUntil(this.destroy$));
    this.lineItemCount$ = this.store
      .select(selectLineItemCount)
      .pipe(takeUntil(this.destroy$));
    this.stateError$ = this.store
      .select(selectCartError)
      .pipe(takeUntil(this.destroy$));
    this.selectLineItemTotal$ = this.store
      .select(selectLineItemTotal)
      .pipe(takeUntil(this.destroy$));
    this.selectOrderQtyCount$ = this.store
      .select(selectOrderQtyCount)
      .pipe(takeUntil(this.destroy$));
    this.selectCheckedLineItemCount$ = this.store
      .select(selectCheckedLineItemCount)
      .pipe(takeUntil(this.destroy$));
  }

  ngOnInit(): void {
    this.cartItems$.subscribe((data) => {
      // if (!this.isFilled) {
      const sortedData = JSON.parse(JSON.stringify(data));
      const response = sortedData
        .sort((a: any, b: any) =>
          a.shop.businessName.localeCompare(b.shop.businessName)
        )
        .map((shop: any) => {
          // if (_.size(this.cartItems) > 0) {
          //   // Find the corresponding shop in existing cartItems
          //   const existingShop = this.cartItems.find(
          //     (cartShop: any) => cartShop.shop.shopId === shop.shop.shopId
          //   );

          //   shop.lineItems = shop.lineItems.map((item: any) => {
          //     if (existingShop) {
          //       // Find the corresponding lineItem in the existing shop
          //       const existingItem = existingShop.lineItems.find(
          //         (cartItem: any) => cartItem.productId === item.productId
          //       );
          //
          //       console.log(
          //         "------existingItem.orderQty",
          //         existingItem!.orderQty
          //       );
          //       if (existingItem && existingItem.orderQty <= item.orderQty) {
          //         item.orderQty = item.orderQty;
          //       }
          //     }
          //     return item;
          //   });
          // }

          // Sort lineItems by name within each shop
          shop.lineItems.sort((a: any, b: any) => a.name.localeCompare(b.name));
          return shop;
        });

      // if (_.size(this.cartItems) > 0) {
      //   this.isFilled = true;
      // }

      // }

      this.cartItems = response;
    });

    this.selectLineItemTotal$.subscribe((data) => {
      this.lineItemTotal = data;
    });
    this.lineItemCount$.subscribe((data) => {
      this.lineItemCount = data;
    });
    this.selectCheckedLineItemCount$.subscribe((data) => {
      this.checkedLineItemCount = data;
    });

    // this.selectCommissionPoints$.subscribe((data) => {
    //
    //   this.commission = data;
    // });

    this.stateError$.subscribe((error) => {
      if (error) {
        if (
          error.message ==
          "Invalid order quantity. Ensure quantity is between 1 and 1."
        ) {
          // this.product.qty = error.data.currentProductStock;
          // this.orderQty = error.data.currentProductStock;

          this._snackBar.open(error.message, "", {
            duration: 3000,
            verticalPosition: "top",
            panelClass: "snackbar-center",
          });
        }
      }

      this.store.dispatch(clearCartError());
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onQtyChange(orderQty: any, lineItem: any, shop: any) {
    // Initialize debounce Subject if it doesn't exist
    if (!this.debounceMap[lineItem.productId]) {
      this.debounceMap[lineItem.productId] = new Subject();
      this.debounceMap[lineItem.productId]
        .pipe(debounceTime(300))
        .subscribe((data) => {
          this.dispatchAddToCart(
            data.lineItem.orderQty,
            data.lineItem,
            data.shop
          );
        });
    }

    // Emit the updated data
    this.debounceMap[lineItem.productId].next({
      shop: { shopId: shop._id, ...shop },
      lineItem: {
        checked: lineItem.checked,
        orderQty,
        productId: lineItem.productId,
        qty: lineItem.qty,
        name: lineItem.name,
        images: lineItem.images,
        expiryDate: lineItem.expiryDate,
        price: lineItem.price,
        specialOffers: lineItem.specialOffers,
        description: lineItem.description,
        category: lineItem.category,
        points: lineItem.points,
        commission: lineItem.commission,
      },
    });

    // this.qtyChange$.next({ orderQty, lineItem, shop });
  }

  isShopChecked(cart: any): boolean {
    return cart.lineItems.every((item: any) => item.checked);
  }

  trackByShopId(index: number, cart: any): string {
    return cart.shop.shopId; // or use cart.id if available
  }

  trackByLineItemId(index: number, lineItem: any): string {
    return lineItem.productId; // use a unique value per product
  }

  // Toggle shop-level checkbox (Check/Uncheck all products)
  toggleShopCheckbox(event: any, cart: any) {
    this.cartItems = this.cartItems.map((cart2) => {
      if (cart2.shop.shopId === cart.shop.shopId) {
        return {
          ...cart2,
          lineItems: cart2.lineItems.map((lineItem) => {
            // Call your function
            this.onCheckedChange(event, lineItem, cart2.shop);

            // Return the updated line item
            return {
              ...lineItem,
              checked: event.checked,
            };
          }),
        };
      }
      return cart2;
    });
  }

  onCheckedChange(event: any, lineItem: any, shop: any) {
    this.store.dispatch(
      addToCart({
        shop: { shopId: shop._id, ...shop },
        lineItem: {
          checked: event.checked,
          orderQty: lineItem.orderQty,
          productId: lineItem.productId,
          qty: lineItem.qty,
          name: lineItem.name,
          images: lineItem.images,
          expiryDate: lineItem.expiryDate,
          price: lineItem.price,
          specialOffers: lineItem.specialOffers,
          description: lineItem.description,
          category: lineItem.category,
        },
      })
    );

    this.cartItems = this.cartItems.map((cart2) => {
      if (cart2.shop.shopId === shop.shopId) {
        return {
          ...cart2,
          lineItems: cart2.lineItems.map((lineItem2) => {
            let x = {
              ...lineItem2,
            };
            if (lineItem2.productId === lineItem.productId) {
              // Return the updated line item
              x = {
                ...lineItem2,
                checked: event.checked,
              };
            }

            return x;
          }),
        };
      }
      return cart2;
    });
  }

  dispatchAddToCart(orderQty: any, lineItem: any, shop: any) {
    this.store.dispatch(
      addToCart({
        shop: { shopId: shop._id, ...shop },
        lineItem: {
          checked: lineItem.checked,
          orderQty: orderQty,
          productId: lineItem.productId,
          qty: lineItem.qty,
          name: lineItem.name,
          images: lineItem.images,
          expiryDate: lineItem.expiryDate,
          price: lineItem.price,
          specialOffers: lineItem.specialOffers,
          description: lineItem.description,
          category: lineItem.category,
        },
      })
    );
  }

  viewProduct(productId: string) {
    this.router.navigate(["/product", productId], { queryParams: {} });
  }
}
