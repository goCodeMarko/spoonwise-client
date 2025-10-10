import { Component, OnDestroy, OnInit } from "@angular/core";
import { filter } from "lodash";
import { finalize, Subscription, map, tap, Observable } from "rxjs";
import { HttpRequestService } from "src/app/http-request/http-request.service";
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
  orderStatusTotalsOnLoad: boolean;
  orderStatusTotals$: Observable<IOrderStatusTotals>;

  constructor(
    private hrs: HttpRequestService,
    private orderStatusPipe: OrderStatusPipe
  ) {
    this.orderStatusTotalsOnLoad = true;
    this.selectedTab = "to_pay";
    this.orderStatusTotals$ = this.getOrderStatusTotals();
  }

  ngOnInit(): void {
    this.getOrderStatusTotals();
  }

  ngOnDestroy(): void {}

  onTabChange(event: any) {
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
