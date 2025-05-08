import { Component, OnDestroy, OnInit } from "@angular/core";
import { AuthService } from "../authorization/auth.service";
import { Observable } from "rxjs";
import { SocketService } from "../shared/socket/socket.service";

@Component({
  selector: "app-seller",
  templateUrl: "./seller.component.html",
  styleUrls: ["./seller.component.scss"],
})
export class SellerComponent implements OnInit, OnDestroy {
  routerOutletComponent: any;
  getUserDataSubcription: any;

  constructor(private socket: SocketService) {}

  ngOnInit(): void {
    this.socket.connect();
  }

  ngOnDestroy(): void {
    this.socket.disconnect();
  }

  fromRouterOutlet(component: any) {
    const name = component.constructor["componentName"] || "unknown";

    this.routerOutletComponent = name;
  }
}
