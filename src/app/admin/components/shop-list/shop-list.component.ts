import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from "@angular/core";
import { HttpRequestService } from "src/app/http-request/http-request.service";
import * as _ from "lodash";
import { ActivatedRoute, Route, Router } from "@angular/router";
import { SpecialOffer, SpecialOfferLabels } from "../../../shared/enums/index";
import { FormControl } from "@angular/forms";
import { MatSlideToggleChange } from "@angular/material/slide-toggle";
import { debounceTime, finalize, map, tap } from "rxjs/operators";
import { fromEvent } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { ViewShopModalComponent } from "src/app/modals/view-shop-modal/view-shop-modal.component";
import { Store } from "@ngrx/store";
import { chatSeller } from "src/app/shared/store/chat/chat.actions";

interface params {
  skip: number;
  limit: number;
  search?: string;
  sort?: string;
  page?: number;
  specialOffer?: string;
  categories?: string[];
}

interface Meta {
  limit: number;
  page: number;
  pages: number;
  total: number;
}

interface Shop {
  _id: string;
  businessName: string;
  documents: {
    bir: string;
    businessPermit: string;
    owner_selfie: string;
    validID: string;
  };
  coordinates: {
    lat: string;
    lng: string;
  };
  phoneNumber: string;
  settlement_account: {
    accountName: string;
    accountNumber: string;
  };
  verification_process: {
    status: string;
    errors: {
      tab1: string;
      tab2: string;
      tab3: string;
    };
    updatedAt: string;
  };
  address: string;
  barangay: string;
  municipality: string;
  province: string;
  user: {
    _id: string;
    email: string;
    firstname: string;
    lastname: string;
  };
  productReviews: {
    _id: string;
    reviewRate: number;
  }[];
  averageRating: number;
}

@Component({
  selector: "app-shop-list",
  templateUrl: "./shop-list.component.html",
  styleUrls: ["./shop-list.component.scss"],
})
export class ShopListComponent implements OnInit, AfterViewInit {
  // selectControl = new FormControl("latest"); // Default value
  shops: Shop[] = [];
  x = 3;
  shopListOnLoad: boolean = true;
  queryParams: params = { skip: 0, limit: 10 };
  meta: Meta = { limit: 0, page: 0, pages: 0, total: 0 };
  specialOfferIds = Object.values(SpecialOffer);
  specialOfferLabels = SpecialOfferLabels;
  @Input() showPublishSlider = false;
  @Input() isShop = false;
  @ViewChild("search") searchText?: ElementRef;

  constructor(
    private hrs: HttpRequestService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private store: Store,
  ) {
    // this.selectControl.valueChanges.subscribe((value) => {
    //   this.router.navigate([], {
    //     relativeTo: this.route,
    //     queryParams: { sort: value },
    //     queryParamsHandling: "merge",
    //   });
    // });

    this.route.queryParams.subscribe((params) => {
      this.queryParams = { ...this.queryParams, ...params };
      console.log("this.queryParams", this.queryParams);
      if (params.page) this.queryParams.skip = params.page - 1;
      if (params.sort) this.queryParams.sort = params.sort;

      if (params.search) this.queryParams.search = params.search;
      else delete this.queryParams.search;

      if (params.categories)
        this.queryParams.categories = params.categories.split(" ");
      else delete this.queryParams.categories;

      if (params.specialOffer)
        this.queryParams.specialOffer = params.specialOffer;
      else delete this.queryParams.specialOffer;

      this.getShopList();
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit() {
    fromEvent(this.searchText?.nativeElement, "input")
      .pipe(
        debounceTime(500),
        tap((res: any) => {
          this.search(res.target.value);
        }),
      )
      .subscribe();
  }

  chatSeller(shopId: string) {
    this.store.dispatch(chatSeller({ shopId }));
  }

  getShopList() {
    this.shopListOnLoad = true;
    this.hrs
      .request("getV2", "shop/getShopList", this.queryParams)
      .pipe(
        tap((res: any) => {
          console.log("✅✅✅✅shop/getShopList:", res.data.items);
        }),
        map((res: any) => {
          return {
            ...res,
            items: {
              ...res.data.items,
              averageRating: res.data.items.averageRating || 0,
            },
          };
        }),
        finalize(() => (this.shopListOnLoad = false)),
      )
      .subscribe({
        next: (res: any) => {
          if (res.success && _.has(res, "data")) {
            console.log("xxxxxxxxx", res.data);
            this.meta = res.data.meta;
            this.shops = res.data.items;
          }
        },
        error: (err: any) => {
          console.error("Error loading shops", err);
        },
      });
  }
  trackByShopId(index: number, order: any): string {
    return order.orderId;
  }

  viewShop(shop: Shop) {
    console.log("-------shop", shop);
    const dialogRef = this.dialog.open(ViewShopModalComponent, {
      width: "500px",
      data: shop,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.status === "declined") {
        this.shops.map((shop) => {
          if (shop._id === result.id) {
            shop.verification_process.status = "DECLINED";
          }
        });
      } else if (result?.status === "approved") {
        this.shops.map((shop) => {
          if (shop._id === result.id) {
            shop.verification_process.status = "APPROVED";
          }
        });
      }
    });
  }

  next() {
    console.log("this.meta.page", this.meta.page);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.meta.page == 1 ? 2 : this.meta.page + 1,
      },
      queryParamsHandling: "merge",
    });
  }

  prev() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.meta.page === 1 ? 1 : this.meta.page - 1,
      },
      queryParamsHandling: "merge",
    });
  }

  search(searchInput?: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: searchInput ? searchInput : null,
        page: 1,
      },
      queryParamsHandling: "merge",
    });
  }

  updatePublish(id: string, e: MatSlideToggleChange) {
    //   console.log("--id", id);
    //   console.log("--e", e.checked);
    //   this.hrs.request(
    //     "put",
    //     `product/togglePublishStatus/${id}`,
    //     { status: e.checked },
    //     async (res: any) => {
    //       if (res.success) {
    //       } else {
    //       }
    //     }
    //   );
  }
}
