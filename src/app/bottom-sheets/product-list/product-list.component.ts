import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { SpecialOffer, SpecialOfferLabels } from "../../shared/enums/index";
import { Subject, takeUntil } from "rxjs";
import { HttpRequestService } from "src/app/http-request/http-request.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { MatSlideToggleChange } from "@angular/material/slide-toggle";
import _ from "lodash";
import { BottomSheetProvider } from "swipe-bottom-sheet/angular";
import { AuthService } from "src/app/authorization/auth.service";

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

@Component({
  selector: "app-product-list",
  templateUrl: "./product-list.component.html",
  styleUrls: ["./product-list.component.scss"],
})
export class ProductListComponent implements OnInit, OnDestroy {
  selectControl = new FormControl("latest"); // Default value
  products: object[] = [];
  productListOnLoad: boolean = true;
  queryParams: params = { skip: 0, limit: 10 };
  meta: Meta = { limit: 0, page: 0, pages: 0, total: 0 };
  specialOfferIds = Object.values(SpecialOffer);
  specialOfferLabels = SpecialOfferLabels;
  showPublishSlider = false;
  isShop = false;
  public account: any = {};

  private destroy$ = new Subject<void>();

  constructor(
    private hrs: HttpRequestService,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store,
    private provider: BottomSheetProvider,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.account = JSON.parse(this.auth.getUserData());
    this.isShop = this.account?.role === "seller";
    this.showPublishSlider = this.isShop;

    console.log("------------account", this.account);

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        if (params.sort) this.selectControl.setValue(params.sort);
      });

    this.selectControl.valueChanges.subscribe((value) => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { sort: value },
        queryParamsHandling: "merge",
      });
    });
    this.listenToQueryParams();
    this.getProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getProducts() {
    this.productListOnLoad = true;
    const shop =
      this.route.snapshot.paramMap.get("shopId") ||
      this.account?.shop?._id ||
      "";

    this.hrs.request(
      "get",
      "product/getProducts",
      { ...this.queryParams, shop },
      async (res: any) => {
        if (res.success && _.has(res, "data")) {
          this.products = res.data.items;
          this.meta = res.data.meta;
        } else {
          this.products = [];
        }
        this.productListOnLoad = false;
      }
    );
  }

  viewProduct(prodId: string) {
    this.router.navigate([this.isShop ? "/shop/product" : "/product", prodId], {
      queryParams: {},
    });
  }

  next() {
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
        page: this.meta.page - 1,
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
    console.log("--id", id);
    console.log("--e", e.checked);

    this.hrs.request(
      "put",
      `product/togglePublishStatus/${id}`,
      { status: e.checked },
      async (res: any) => {
        if (res.success) {
        } else {
        }
      }
    );
  }

  private listenToQueryParams() {
    // if (!this.visibility) return;

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.queryParams = { ...this.queryParams, ...params };

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
        console.log("---shared/product-list");
        this.getProducts();
      });
  }
}
