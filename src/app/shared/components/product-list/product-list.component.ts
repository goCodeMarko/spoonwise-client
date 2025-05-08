import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { HttpRequestService } from "src/app/http-request/http-request.service";
import * as _ from "lodash";
import { ActivatedRoute, Route, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import {
  ProductCategory,
  ProductCategoryLabels,
  SpecialOffer,
  SpecialOfferLabels,
} from "../../enums/index";
import { FormControl } from "@angular/forms";
import { MatSlideToggleChange } from "@angular/material/slide-toggle";

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
export class ProductListComponent implements OnInit {
  selectControl = new FormControl("latest"); // Default value
  products: object[] = [];
  productListOnLoad: boolean = true;
  queryParams: params = { skip: 0, limit: 4 };
  meta: Meta = { limit: 0, page: 0, pages: 0, total: 0 };
  specialOfferIds = Object.values(SpecialOffer);
  specialOfferLabels = SpecialOfferLabels;
  @Input() showPublishSlider = false;
  @Input() isShop = false;

  constructor(
    private hrs: HttpRequestService,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.selectControl.valueChanges.subscribe((value) => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { sort: value },
        queryParamsHandling: "merge",
      });
    });
    this.route.queryParams.subscribe((params) => {
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

      this.getProducts();
    });
  }

  getProducts() {
    this.productListOnLoad = true;

    this.hrs.request(
      "get",
      "product/getProducts",
      this.queryParams,
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
}
