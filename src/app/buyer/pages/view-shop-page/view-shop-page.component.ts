import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import { HttpRequestService } from "src/app/http-request/http-request.service";
import { chatSeller } from "src/app/shared/store/chat/chat.actions";

@Component({
  selector: "app-view-shop-page",
  templateUrl: "./view-shop-page.component.html",
  styleUrls: ["./view-shop-page.component.scss"],
})
export class ViewShopPageComponent implements OnInit {
  static componentName = "ViewShopPageComponent";
  shop: any = {};
  constructor(
    private store: Store,
    private hrs: HttpRequestService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getShop();
  }

  getShop() {
    const shop = this.route.snapshot.paramMap.get("shopId");

    this.hrs
      .request("getV2", `shop/getShop/${shop}`, {})
      .pipe()
      .subscribe((data: any) => {
        console.log("data.data", data.data);
        this.shop = data.data;
      });
  }

  chatSeller(shopId: string) {
    this.store.dispatch(chatSeller({ shopId }));
  }
}
