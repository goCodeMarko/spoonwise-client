import { Component, OnInit } from "@angular/core";
import * as _ from "lodash";
import { finalize, map, Observable } from "rxjs";
import { HttpRequestService } from "src/app/http-request/http-request.service";

@Component({
  selector: "app-shop-reviews",
  templateUrl: "./shop-reviews.component.html",
  styleUrls: ["./shop-reviews.component.scss"],
})
export class ShopReviewsComponent implements OnInit {
  reviews$!: Observable<any[]>;
  reviewSheetLoad = true;
  shopId!: string;
  constructor(private hrs: HttpRequestService) {}

  ngOnInit(): void {
    this.getShopReviews();
  }

  private getShopReviews() {
    this.reviews$ = this.hrs
      .request("getV2", `order/getShopReviews/${this.shopId}`, {})
      .pipe(
        map((res: any) => {
          return res?.success && _.has(res, "data") ? res.data : [];
        }),
        finalize(() => (this.reviewSheetLoad = false))
      );
  }
}
