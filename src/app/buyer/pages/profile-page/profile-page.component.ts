import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { filter } from "lodash";
import { finalize, Subscription, map, tap, Observable } from "rxjs";
import { HttpRequestService } from "src/app/http-request/http-request.service";
import { PopUpModalComponent } from "src/app/modals/pop-up-modal/pop-up-modal.component";
import { SocketService } from "src/app/shared/socket/socket.service";
import { IOrderStatusTotals } from "src/app/shared/models/order-status-totals.model";
import { OrderStatusPipe } from "src/app/shared/pipes/order-status.pipe";

@Component({
  selector: "app-profile-page",
  templateUrl: "./profile-page.component.html",
  styleUrls: ["./profile-page.component.scss"],
})
export class ProfilePageComponent implements OnInit, OnDestroy {
  static componentName: string = "ProfilePageComponent";
  selectedTab: string;
  mainTabIndex: number;
  orderTabIndex: number;
  orderStatusTotalsOnLoad: boolean;
  orderStatusTotals$: Observable<IOrderStatusTotals>;

  constructor(
    private hrs: HttpRequestService,
    private orderStatusPipe: OrderStatusPipe,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
  ) {
    this.orderStatusTotalsOnLoad = true;
    this.selectedTab = "to_pay";
    this.mainTabIndex = 0;
    this.orderTabIndex = 0;
    this.orderStatusTotals$ = this.getOrderStatusTotals();
  }

  ngOnInit(): void {
    this.applyTabStateFromQueryParams();
    this.openCheckoutSuccessDialogIfNeeded();
    this.getOrderStatusTotals();
  }

  ngOnDestroy(): void {}

  onMainTabChange(event: any) {
    this.mainTabIndex = event.index;
  }

  onTabChange(event: any) {
    this.orderTabIndex = event.index;
    switch (event.index) {
      case 0:
        this.selectedTab = "to_pay";
        break;
      case 1:
        this.selectedTab = "for_review";
        break;
      case 2:
        this.selectedTab = "to_pack";
        break;
      case 3:
        this.selectedTab = "for_pickup";
        break;
      case 4:
        this.selectedTab = "to_receive";
        break;
      case 5:
        this.selectedTab = "cancelled";
        break;
    }
  }

  private applyTabStateFromQueryParams() {
    const tab = this.route.snapshot.queryParamMap.get("tab");
    const orderTab = this.route.snapshot.queryParamMap.get("orderTab");

    switch (tab) {
      case "orders":
        this.mainTabIndex = 1;
        break;
      case "saved-blogs":
        this.mainTabIndex = 2;
        break;
      default:
        this.mainTabIndex = 0;
        break;
    }

    this.setOrderTab(orderTab ?? "to_pay");
  }

  private openCheckoutSuccessDialogIfNeeded() {
    const checkoutSuccess =
      this.route.snapshot.queryParamMap.get("checkoutSuccess") === "true";
    const checkoutMethod = this.route.snapshot.queryParamMap.get("checkoutMethod");

    if (!checkoutSuccess) {
      return;
    }

    this.dialog.open(PopUpModalComponent, {
      width: "500px",
      data: {
        deletebutton: false,
        okaybutton: true,
        okayBtnText: `<b>Sounds good!</b>`,
        title: "Checkout Successful!",
        message:
          checkoutMethod === "ONLINE"
            ? "Your order has been placed successfully. You can continue your payment from the Orders tab."
            : "Your order has been placed successfully. You can track it from the Orders tab.",
        file: "assets/icons/party.png",
      },
    });

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        checkoutSuccess: null,
        checkoutMethod: null,
      },
      queryParamsHandling: "merge",
      replaceUrl: true,
    });
  }

  private setOrderTab(tab: string) {
    switch (tab) {
      case "for_review":
        this.selectedTab = "for_review";
        this.orderTabIndex = 1;
        break;
      case "to_pack":
        this.selectedTab = "to_pack";
        this.orderTabIndex = 2;
        break;
      case "for_pickup":
        this.selectedTab = "for_pickup";
        this.orderTabIndex = 3;
        break;
      case "to_receive":
        this.selectedTab = "to_receive";
        this.orderTabIndex = 4;
        break;
      case "cancelled":
        this.selectedTab = "cancelled";
        this.orderTabIndex = 5;
        break;
      default:
        this.selectedTab = "to_pay";
        this.orderTabIndex = 0;
        break;
    }
  }

  getOrderStatusTotals(): Observable<IOrderStatusTotals> {
    return this.hrs
      .request("getV2", "order/getOrderStatusTotals", {
        start: "2025-01-01",
        end: "2025-10-06",
      })
      .pipe(
        map((res: any) => {
          const formattedData = res.data.map((data: any) => {
            return {
              name: this.orderStatusPipe.transform(data.status),
              value: data.count || 23,
            };
          });

          return formattedData;
        }),
        tap((res: any) => {
          console.log("??????????????????", res);
        }),
        finalize(() => {
          this.orderStatusTotalsOnLoad = false;
        })
      );
  }
}
