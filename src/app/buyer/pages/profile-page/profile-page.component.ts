import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { SocketService } from "src/app/shared/socket/socket.service";

@Component({
  selector: "app-profile-page",
  templateUrl: "./profile-page.component.html",
  styleUrls: ["./profile-page.component.scss"],
})
export class ProfilePageComponent implements OnInit, OnDestroy {
  selectedTab = "to_pay";
  static componentName = "ProfilePageComponent";
  constructor(private socket: SocketService) {}

  ngOnInit(): void {}

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
}
