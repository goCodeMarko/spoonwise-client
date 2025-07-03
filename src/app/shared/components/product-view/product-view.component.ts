import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewContainerRef,
  ViewEncapsulation,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { HttpRequestService } from "src/app/http-request/http-request.service";
import {
  BottomSheetProvider,
  BottomSheetContent,
} from "swipe-bottom-sheet/angular";
import * as _ from "lodash";
import { Store } from "@ngrx/store";
import { Observable, Subject } from "rxjs";
import {
  addToCart,
  removeFromCart,
  updateCart,
  clearCartError,
} from "../../store/cart/cart.actions";
import {
  selectCartItems,
  selectLineItemCount,
  selectCartError,
} from "../../store/cart/cart.selectors";
import { MatSnackBar } from "@angular/material/snack-bar";

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
}
interface IProduct {
  _id: string;
  shopId: string;
  name: string;
  category: string[];
  images: string[];
  expiryDate: string;
  qty: number;
  price: number;
  specialOffers: string[];
  createdAt: string;
  updatedAt: string;
  description: string;
  shop: {
    _id: string;
    businessName: string;
    logo: string;
    documents: {
      bir: string;
      businessPermit: string;
    };
    address1: string;
    address2: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    createdAt: string;
    updatedAt: string;
  };
  rating: number;
}

// import Swiper core and required components
import SwiperCore, {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Virtual,
  Zoom,
  Autoplay,
  Thumbs,
  Controller,
} from "swiper";
import { takeUntil } from "rxjs/operators";

// install Swiper components
SwiperCore.use([
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Virtual,
  Zoom,
  Autoplay,
  Thumbs,
  Controller,
]);

@Component({
  selector: "app-product-view",
  templateUrl: "./product-view.component.html",
  styleUrls: ["./product-view.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class ProductViewComponent implements OnInit, OnDestroy {
  static componentName = "ProductViewComponent";
  product!: IProduct;
  orderQty: number = 1;
  images = [];
  productId: string | null;
  productOnLoad = true;
  public sendRequestBtnOnLoad = false;
  output = "";
  cartItems!: CartItem[];
  cartItems$: Observable<CartItem[]>;
  lineItemCount$: Observable<number>;
  stateError$: Observable<any>;
  reviewSheetLoad = true;
  reviews: any[] = [];
  private destroy$ = new Subject<void>();
  @Input() isShop = false;

  constructor(
    private hrs: HttpRequestService,
    private route: ActivatedRoute,
    private sheet: BottomSheetProvider,
    private vcRef: ViewContainerRef,
    private store: Store,
    private _snackBar: MatSnackBar
  ) {
    sheet.rootVcRef = vcRef;
    this.productId = this.route.snapshot.paramMap.get("id");

    this.cartItems$ = this.store
      .select(selectCartItems)
      .pipe(takeUntil(this.destroy$));
    this.lineItemCount$ = this.store
      .select(selectLineItemCount)
      .pipe(takeUntil(this.destroy$));
    this.stateError$ = this.store
      .select(selectCartError)
      .pipe(takeUntil(this.destroy$));
  }

  ngOnInit(): void {
    this.getProduct();

    this.store.subscribe((state) => {});

    this.cartItems$.subscribe((data) => {
      this.cartItems = data;
    });

    this.lineItemCount$.subscribe((data) => {});

    this.stateError$.subscribe((error) => {
      if (error) {
        if (
          error.message ==
          "Invalid order quantity. Ensure quantity is between 1 and 1."
        ) {
          this.product.qty = error.data.currentProductStock;
          this.orderQty = error.data.currentProductStock;
          this._snackBar.open(error.message, "", {
            duration: 3000,
            verticalPosition: "top",
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

  addToCart() {
    this.store.dispatch(
      addToCart({
        shop: { shopId: this.product.shop._id, ...this.product.shop },
        lineItem: {
          orderQty: this.orderQty,
          productId: this.product._id,
          qty: this.product.qty,
          name: this.product.name,
          images: this.product.images,
          expiryDate: this.product.expiryDate,
          price: this.product.price,
          specialOffers: this.product.specialOffers,
          description: this.product.description,
          category: this.product.category,
        },
      })
    );
  }

  removeItem(productId: string) {
    this.store.dispatch(removeFromCart({ productId }));
  }

  updateCart(productId: string, orderQty: number) {
    this.store.dispatch(updateCart({ productId, orderQty }));
  }

  getProduct() {
    this.productOnLoad = true;

    this.hrs.request(
      "get",
      `product/getProduct/${this.productId}`,
      {},
      async (res: any) => {
        if (res.success && _.has(res, "data")) {
          this.product = res.data;
          this.images = res.data.images;
          this.getReviews(res.data.shopId);
          this.productQtyInTheCart();
        } else {
        }
        this.productOnLoad = false;
      }
    );
  }

  private productQtyInTheCart() {
    const shop = this.cartItems.find(
      (shop) => shop.shop.shopId == this.product.shopId
    );
    if (shop) {
      const product = shop.lineItems.find(
        (lineItem) => lineItem.productId == this.product._id
      );

      if (product) this.orderQty = product.orderQty;
    }
  }

  async openSheet<T>(content: BottomSheetContent<T>) {
    this.output = "";

    const value = await this.sheet.show(content, {
      title: "",
      stops: [3500, 500],
    });

    this.output = value;
  }

  async openReviews<T>(content: BottomSheetContent<T>, shopId: string) {
    this.output = "";

    const value = await this.sheet.show(content, {
      title: "",
      stops: [3500, 500],
    });

    this.output = value;
  }
  async getReviews(shopId: string) {
    this.hrs.request(
      "get",
      `order/getShopReviews/${shopId}`,
      {},
      async (res: { data: object[]; success: boolean }) => {
        if (res.success && _.has(res, "data")) {
          this.reviews = res.data;
        }
        this.reviewSheetLoad = false;
      }
    );
  }

  onQtyChange(qty: any) {
    this.orderQty = qty;
  }
}
