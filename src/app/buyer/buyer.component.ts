import { Component, OnInit } from "@angular/core";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { BottomSheetComponent } from "./components/bottom-sheet/bottom-sheet.component";
import { ActivatedRoute, Route, Router } from "@angular/router";
import { FormControl } from "@angular/forms";
import { HttpRequestService } from "../http-request/http-request.service";
import * as _ from "lodash";
import { AuthService } from "../authorization/auth.service";
import { Location } from "@angular/common";

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
  searchInput: string | null = null;
  isMapLoading: boolean = true;
  constructor(
    private bottomSheet: MatBottomSheet,
    private router: Router,
    private route: ActivatedRoute,
    private hrs: HttpRequestService,
    private auth: AuthService,
    private location: Location
  ) {}

  ngOnInit(): void {
    // Detect changes on mat-select
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
      console.log("----------queryParams", params);
      if (params.radius) this.radius = params.radius;
    });
  }

  search() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.searchInput ? this.searchInput : null,
        page: 1,
      },
      queryParamsHandling: "merge",
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

  openBottomSheet(): void {
    this.bottomSheet.open(BottomSheetComponent);
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

  goBack() {
    this.location.back();
  }

  fromRouterOutlet(component: any) {
    this.routerOutletComponent = component.constructor.name;
    console.log("------------component", component.constructor.name);
    component.newMeta.subscribe((value: Meta) => {
      this.meta = value;
    });
    // if (component.hideMainButton) {
    //   component.hideMainButton.subscribe((value: boolean) => {
    //     this.hideMainButton = value;
    //   });
    // }
  }
}
