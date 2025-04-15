import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Route, Router } from "@angular/router";
import { FormControl } from "@angular/forms";
import { HttpRequestService } from "../http-request/http-request.service";
import * as _ from "lodash";
import { AuthService } from "../authorization/auth.service";
import { Location } from "@angular/common";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";

import {
  selectLineItemCount,
  selectOrderQtyCount,
} from "./../shared/store/cart/cart.selectors";

interface Meta {
  limit: number;
  page: number;
  pages: number;
  total: number;
}
@Component({
  selector: "app-buyer",
  templateUrl: "./buyer.component.html",
  styleUrls: ["./buyer.component.scss"],
})
export class BuyerComponent implements OnInit {
  selectControl = new FormControl("latest"); // Default value
  meta: Meta = { limit: 0, page: 0, pages: 0, total: 0 };
  routerOutletComponent: any;
  shops: any[] = [];
  subject: object = {};
  radius: number = 3000;
  isMapLoading: boolean = true;
  orderQtyCount$: Observable<number>;
  orderQtyCount: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private hrs: HttpRequestService,
    private auth: AuthService,
    private store: Store
  ) {
    this.orderQtyCount$ = this.store.select(selectOrderQtyCount);

    this.orderQtyCount$.subscribe((data) => {
      this.orderQtyCount = data;
    });
  }

  ngOnInit(): void {
    this.selectControl.valueChanges.subscribe((value) => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { sort: value },
        queryParamsHandling: "merge",
      });
    });
    this.subject = JSON.parse(this.auth.getUserData());
    this.getShops();
    this.getCategories();
    this.getSpecialOffers();

    this.route.queryParams.subscribe((params) => {
      if (params.radius) this.radius = params.radius;
    });
  }

  getCategories() {
    this.hrs.request("get", "category/getCategories", {}, async (res: any) => {
      if (res.success && _.has(res, "data")) {
        localStorage.setItem("categories", JSON.stringify(res.data));
      }
    });
  }

  getShops() {
    this.hrs.request("get", "shop/getShops", {}, async (res: any) => {
      if (res.success && _.has(res, "data")) {
        this.shops = res.data;

        console.log("BuyerComponent:this.shops", this.shops);
      }

      this.isMapLoading = false;
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

  getSpecialOffers() {
    this.hrs.request(
      "get",
      "specialOffer/getSpecialOffers",
      {},
      async (res: any) => {
        if (res.success && _.has(res, "data")) {
          localStorage.setItem("specialOffers", JSON.stringify(res.data));
        }
      }
    );
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

  fromRouterOutlet(component: any) {
    console.log("------------component.constructor.name", component);
    this.routerOutletComponent = component.constructor.name;

    component.newMeta.subscribe((value: Meta) => {
      this.meta = value;
    });
  }
}
