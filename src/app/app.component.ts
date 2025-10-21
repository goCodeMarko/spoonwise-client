import { Component, OnInit, ViewContainerRef, isDevMode } from "@angular/core";
import { environment } from "src/environments/environment";
import { InternetConnectionService } from "./shared/internet-connection/internet-connection.service";
import { ImagePreloadService } from "./shared/services/image-preload.service";
import { SwPush } from "@angular/service-worker";
import { HttpRequestService } from "./http-request/http-request.service";
import { Store } from "@ngrx/store";
import { CartItem } from "./shared/models/cart-item.model";
import { setCart } from "./shared/store/cart/cart.actions";
import { setToPay } from "./shared/store/order/order.actions";
import { setChatrooms } from "./shared/store/chat/chat.actions";
import { GeolocationService } from "./shared/services/geolocation/geolocation.service";
import { BottomSheetProvider } from "swipe-bottom-sheet/angular";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  public isOnline!: Boolean | null;

  constructor(
    internetConnection: InternetConnectionService,
    imagePreloadService: ImagePreloadService,
    private store: Store,
    private geolocationService: GeolocationService,
    private bottomSheet: BottomSheetProvider,
    private vcRef: ViewContainerRef
  ) {
    // only set this once and do so in the app component's constructor
    bottomSheet.rootVcRef = vcRef;

    // Subscribe to the internet connection status
    internetConnection.getConnectionStatus().subscribe((status) => {
      this.isOnline = status; // Update the isOnline property with the current status

      // If the status is online (true), set a timeout to reset isOnline after 5 seconds
      if (status) {
        setTimeout(() => {
          this.isOnline = null;
        }, 5000);
      }
    });

    // Check if the app is in development mode and log the appropriate environment
    if (isDevMode()) console.log("Development!");
    else console.log("Production!");

    // List of images to be preloaded
    const imagesToPreload = [
      "assets/images/gcash.png",
      "assets/images/cash.png",
      "assets/images/noDataFound.png",
      "assets/images/logo/lalamove-icon.webp",
      "assets/images/logo/lalamove-whole-logo.png",
      "assets/icons/check.png",
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      "assets/images/1.png",
      "assets/images/2.png",
      "assets/images/3.png",
      "assets/images/4.png",
      "assets/images/5.png",
      "assets/images/6.png",
      "assets/images/7.png",
    ];
    // Preload the listed images
    imagePreloadService.preload(imagesToPreload);
  }

  ngOnInit(): void {}
}
