import { Component, OnInit } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { HttpRequestService } from "src/app/http-request/http-request.service";
import _ from "lodash";
import { Subscription } from "rxjs";
import { SocketService } from "src/app/shared/socket/socket.service";
@Component({
  selector: "app-lalamove-request-details",
  templateUrl: "./lalamove-request-details.component.html",
  styleUrls: ["./lalamove-request-details.component.scss"],
})
export class LalamoveRequestDetailsComponent implements OnInit {
  isLalamoveLoad = true;
  shopId = "";
  orderId = "";
  lalamoveQoutationData: any = {};
  lalamoveStatus = "";
  lalamoveDriver: any = {};
  lalamoveOrder: any = {};
  lalamoveShareLink: SafeResourceUrl = "";
  public _ = _;
  public onLalamoveStatusChangeSubscriber: Subscription;

  constructor(
    private hrs: HttpRequestService,
    private sanitizer: DomSanitizer,
    private socket: SocketService,
  ) {
    this.onLalamoveStatusChangeSubscriber = this.socket
      .onLalamoveStatusChange()
      .subscribe((lalamove: any) => {
        console.log("===================lalamove", lalamove);
        console.log("===================lalamoveOrder", this.lalamoveOrder);

       
        if (
          ["ASSIGNING_DRIVER"].includes(lalamove.orderFullDetails.status) &&
          lalamove.orderStatus == "ORDER_STATUS_CHANGED"
        ) {

          
          this.lalamoveStatus = lalamove.orderFullDetails.status;
          this.lalamoveOrder = {
            ...lalamove.orderFullDetails,
          };
          this.lalamoveDriver = { };

          console.log("----------------1");
          console.log(
            "----------------1 this.lalamoveStatus",
            this.lalamoveStatus,
          );
          console.log(
            "----------------1 this.lalamoveOrder",
            this.lalamoveOrder,
          );
          console.log(
            "----------------1 this.lalamoveDriver",
            this.lalamoveDriver,
          );
        } else if (["DRIVER_ASSIGNED"].includes(lalamove.orderStatus)) {
          this.lalamoveStatus = lalamove.orderFullDetails.status;
          this.lalamoveOrder = {
            ...lalamove.orderFullDetails,
          };
          this.lalamoveDriver = { phone: lalamove.driverPhone };
        } else if (["CANCELLED"].includes(lalamove.orderStatus)) {
          this.lalamoveStatus = lalamove.orderFullDetails.status;
          this.lalamoveOrder = {};
          this.lalamoveDriver = {};
        }
      });
  }

  ngOnInit(): void {
    this.getQoutation();
  }

  ngOnDestroy(): void {
    this.onLalamoveStatusChangeSubscriber.unsubscribe();
  }

  getQoutation() {
    this.hrs.request(
      "get",
      "order/lalamove/getQuotation",
      { shopId: this.shopId, orderId: this.orderId },
      async (data: any) => {
        if (!data.success) {
          this.isLalamoveLoad = false;
          return;
        }

        if (data.success) {
          this.lalamoveQoutationData = data.data.quotation;
          this.lalamoveStatus = data.data.lalamoveStatus;
          this.isLalamoveLoad = false;
        }

        if (
          ["ASSIGNING_DRIVER", "PICKED_UP", "ON_GOING", "COMPLETED"].includes(
            data.data.lalamoveStatus,
          )
        ) {
          this.lalamoveOrder = {
            ...data.data.latestLalamoveOrder,
          };
          ((this.lalamoveShareLink =
            this.sanitizer.bypassSecurityTrustResourceUrl(
              data.data.latestLalamoveOrder.shareLink,
            )),
            (this.lalamoveDriver = data.data.latestLalamoveDriver));
        }
      },
    );
  }

  findDriver() {
    this.isLalamoveLoad = true;
    this.hrs.request(
      "post",
      "order/lalamove/createOrder",
      {
        shopId: this.shopId,
        quotation: this.lalamoveQoutationData,
        orderId: this.orderId,
      },
      async (data: any) => {
        if (data.success) {
          this.lalamoveStatus = data.data.status;

          this.lalamoveOrder = {
            ...data.data,
          };

          this.lalamoveShareLink =
            this.sanitizer.bypassSecurityTrustResourceUrl(data.data.shareLink);
        }

        this.isLalamoveLoad = false;
      },
    );
  }

  stopFinding(lalamoveOrder: object) {
    this.isLalamoveLoad = true;
    this.hrs.request(
      "put",
      "order/lalamove/stopFindingDrivers",
      {
        lalamoveOrder,
      },
      async (data: any) => {
        if (data.success) {
        }

        this.isLalamoveLoad = false;
      },
    );
  }

  onBottomSheetClosed() {
    this.isLalamoveLoad = true;
    this.shopId = "";
    this.orderId = "";
    this.lalamoveQoutationData = {};
    this.lalamoveStatus = "";
    this.lalamoveDriver = {};
    this.lalamoveOrder = {};
  }
}
