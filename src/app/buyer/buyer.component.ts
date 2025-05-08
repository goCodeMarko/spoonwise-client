import { Component, OnDestroy, OnInit } from "@angular/core";
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
import { SocketService } from "../shared/socket/socket.service";

@Component({
  selector: "app-buyer",
  templateUrl: "./buyer.component.html",
  styleUrls: ["./buyer.component.scss"],
})
export class BuyerComponent implements OnInit, OnDestroy {
  selectControl = new FormControl("latest"); // Default value
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
    private store: Store,
    private socket: SocketService
  ) {
    this.socket.connect();

    this.orderQtyCount$ = this.store.select(selectOrderQtyCount);

    this.orderQtyCount$.subscribe((data) => {
      this.orderQtyCount = data;
    });
  }

  ngOnInit(): void {
    this.subject = JSON.parse(this.auth.getUserData());
    this.getShops();
    this.getCategories();
    this.getSpecialOffers();

    this.route.queryParams.subscribe((params) => {
      console.log("params", params);
      if (params.radius) this.radius = params.radius;
    });
  }

  ngOnDestroy(): void {
    this.socket.disconnect();
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
      }

      this.isMapLoading = false;
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

  fromRouterOutlet(component: any) {
    const name = component.constructor["componentName"] || "unknown";

    this.routerOutletComponent = name;
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
}
