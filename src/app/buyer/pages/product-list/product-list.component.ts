import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { HttpRequestService } from "src/app/http-request/http-request.service";
import * as _ from "lodash";
import { ActivatedRoute, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";

interface params {
  skip: number;
  limit: number;
  search?: string;
  sort?: string;
  page?: number;
  specialOffer?: string;
  categories?: string[];
}

@Component({
  selector: "app-product-list",
  templateUrl: "./product-list.component.html",
  styleUrls: ["./product-list.component.scss"],
})
export class ProductListComponent implements OnInit {
  static componentName = "ProductListComponent";
  products: object[] = [];
  productListOnLoad: boolean = true;
  queryParams: params = { skip: 0, limit: 4 };
  @Output() newMeta = new EventEmitter<object>();

  constructor(
    private hrs: HttpRequestService,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store
  ) {}

  ngOnInit(): void {
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

    this.store.subscribe((state) => {
      console.log("///////////////////////////// Full State:", state);
    });
  }

  getProducts() {
    this.productListOnLoad = true;

    console.log("this.queryParams", this.queryParams);
    this.hrs.request(
      "get",
      "product/getProducts",
      this.queryParams,
      async (res: any) => {
        if (res.success && _.has(res, "data")) {
          this.products = res.data.items;

          this.newMeta.emit(res.data.meta);
        } else {
          this.products = [];
        }
        this.productListOnLoad = false;
      }
    );
  }

  viewProduct(prodId: string) {
    console.log("---------------viewprod", prodId);
    this.router.navigate(["/product", prodId], { queryParams: {} });
  }
}
