import {
  AfterViewInit,
  Component,
  DoCheck,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { size } from "lodash";
import { firstValueFrom, Observable, Subscriber, takeUntil } from "rxjs";
import { AuthService } from "src/app/authorization/auth.service";
import { GeolocationService } from "../../services/geolocation/geolocation.service";
import { HttpRequestService } from "src/app/http-request/http-request.service";
import { style } from "@angular/animations";
import { ProductListComponent } from "src/app/bottom-sheets/product-list/product-list.component";
import { BottomSheetProvider } from "swipe-bottom-sheet/angular";
import Swiper from "swiper";
import { ShopListComponent } from "src/app/bottom-sheets/shop-list/shop-list.component";
declare let L: any; // Declare Leaflet from the global scope

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.scss"],
})
export class MapComponent
  implements OnInit, OnChanges, OnDestroy, AfterViewInit
{
  map: any;
  circle: any;
  marker: any;

  @Input() shops: any[] = [];
  @Input() buyers: any[] = [];
  @Input() subject: any = {};
  @Input() radius: number = 0;
  @Input() detectCurrentLocation = false;
  @Input() checkDBLocation = false;
  @Input() disabled = true;
  @Input() isShop = false;
  @Input() nearestShopButton = false;
  @Input() topRatedShopButton = false;
  @Input() showProductButton = false;
  @Input() showLocationButton = true;
  @Input() showRadiusSlider = false;

  @HostBinding("style.height") @Input() height = "calc(100dvh - 56.1px - 84px)";
  @HostBinding("style.z-index") @Input() zIndex = "1";
  @HostBinding("style.border-radius") @Input() borderRadius = "0px";
  @HostBinding("style.display") display = "block";
  @HostBinding("style.overflow") overflow = "hidden";

  @Output() dragend = new EventEmitter<any>();
  @Output() locationError = new EventEmitter<string | null>();
  destroy$ = new EventEmitter<void>();

  productListSheet: any;
  topRatedShopsSheet: any;
  nearShopsSheet: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private hrs: HttpRequestService,
    private geolocationService: GeolocationService,
    private swipeSheet: BottomSheetProvider,
  ) {}

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (params) => {
        if (params.radius) this.radius = params.radius * 1000;

        if (params.view === "products" && !this.productListSheet) {
          console.log("-----x");
          this.productListSheet = this.swipeSheet
            .show(ProductListComponent, {
              title: "",
              props: {},
              stops: [200, 800],
            })
            .then(() => {
              this.productListSheet = null;
              this.nearShopsSheet = null;
              this.topRatedShopsSheet = null;
              this.router.navigate([], {
                relativeTo: this.route,
                queryParams: { view: null },
                queryParamsHandling: "merge",
              });
            });
          this.productVisibility = true;
        } else {
          this.productVisibility = false;
        }

        if (params.view === "topNearShops" && !this.nearShopsSheet) {
          this.nearShopsSheet = this.swipeSheet
            .show(ShopListComponent, {
              title: "",
              props: {
                sortBy: "distance",
              },
              stops: [200, 800],
            })
            .then(() => {
              this.productListSheet = null;
              this.nearShopsSheet = null;
              this.topRatedShopsSheet = null;
              this.router.navigate([], {
                relativeTo: this.route,
                queryParams: { view: null },
                queryParamsHandling: "merge",
              });
            });
          this.distanceVisibility = true;
        } else {
          this.distanceVisibility = false;
        }

        if (params.view === "topRatedShops" && !this.topRatedShopsSheet) {
          this.topRatedShopsSheet = await this.swipeSheet
            .show(ShopListComponent, {
              title: "",
              props: {
                sortBy: "rating",
              },
              stops: [200, 800],
            })
            .then(() => {
              this.productListSheet = null;
              this.nearShopsSheet = null;
              this.topRatedShopsSheet = null;
              this.router.navigate([], {
                relativeTo: this.route,
                queryParams: { view: null },
                queryParamsHandling: "merge",
              });
            });

          this.ratingVisibility = true;
        } else {
          this.ratingVisibility = false;
        }
      });
  }

  ngAfterViewInit(): void {
    this.loadMap();

    if (this.map) {
      this.map.invalidateSize();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes["subject"] &&
      this.subject?.coordinates?.lat &&
      this.subject?.coordinates?.lng
    ) {
      console.log("Map initializing with subject:", this.subject);
      this.loadMap();
    }

    if (
      changes["detectCurrentLocation"]?.currentValue &&
      !changes["detectCurrentLocation"].firstChange &&
      !this.hasSubjectCoordinates()
    ) {
      this.detectLocation();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.map) {
      this.map.off(); // Remove all event listeners
      this.map.remove(); // Completely removes the map and its layers from the DOM
      this.map = null;
    }

    if (this.circle) {
      this.circle.remove(); // Optional: remove the circle layer if it exists
      this.circle = null;
    }
  }

  private getCurrentPosition() {
    return new Promise((resolve, reject) => {
      this.geolocationService
        .getCurrentPosition()
        .then((position) => {
          this.subject = {
            coordinates: {
              lat: position.coords.latitude.toString(),
              lng: position.coords.longitude.toString(),
            },
          };
          this.locationError.emit(null);
          this.dragend.emit(this.subject.coordinates);
          resolve(this.subject);
        })
        .catch((err) => {
          console.error(err);
          this.locationError.emit(
            err instanceof Error ? err.message : "Unable to detect location.",
          );
          resolve(null);
        });
    });
  }

  private hasSubjectCoordinates() {
    const coordinates = this.subject?.coordinates;

    return Boolean(
      coordinates &&
        coordinates.lat !== undefined &&
        coordinates.lat !== null &&
        coordinates.lat !== "" &&
        coordinates.lng !== undefined &&
        coordinates.lng !== null &&
        coordinates.lng !== "",
    );
  }

  private clearUserLayers() {
    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }

    if (this.circle) {
      this.map.removeLayer(this.circle);
      this.circle = null;
    }
  }

  private async getPositionFromDB() {
    const { data } = (await firstValueFrom(
      this.hrs.request("getV2", `user/getAuthUser`, {}),
    )) as any;

    const lat = data?.coordinates?.lat;
    const lng = data?.coordinates?.lng;

    if (lat === undefined || lat === null || lng === undefined || lng === null) {
      this.subject = {};
      return;
    }

    this.subject = {
      coordinates: {
        lat: lat.toString(),
        lng: lng.toString(),
      },
    };
    this.locationError.emit(null);
    this.dragend.emit(this.subject.coordinates);
  }

  private async getShopCoordinates() {
    const { data } = (await firstValueFrom(
      this.hrs.request("getV2", `shop/getShop`, {}),
    )) as any;

    this.subject = {
      coordinates: {
        lat: data.coordinates.lat.toString(),
        lng: data.coordinates.lng.toString(),
      },
    };
    this.locationError.emit(null);
    this.dragend.emit(this.subject.coordinates);
  }

  private async initializeSubjectCoordinates() {
    if (this.hasSubjectCoordinates()) {
      return;
    }

    if (this.isShop) {
      await this.getShopCoordinates();
      return;
    }

    if (this.checkDBLocation) {
      await this.getPositionFromDB();

      if (this.hasSubjectCoordinates()) {
        return;
      }
    }

    if (this.detectCurrentLocation) {
      await this.getCurrentPosition();
    }
  }

  private updateLocByUserClick(lat: string, lng: string) {
    this.clearUserLayers();

    this.subject = {
      coordinates: {
        lat: lat.toString(),
        lng: lng.toString(),
      },
    };
    this.locationError.emit(null);
    this.dragend.emit(this.subject.coordinates);
    this.setUserMapPin();
  }

  private async loadMap() {
    // Destroy existing map if already initialized
    if (this.map) {
      this.map.off(); // Remove all event listeners
      this.map.remove(); // Properly destroy the map
      this.map = null; // Clear the reference
    }

    await this.initializeSubjectCoordinates();

    this.map = L.map("map", {
      center: [12.8797, 121.774], // Center of the Philippines
      zoom: 30, // Adjust zoom level
      minZoom: 5,
      maxBounds: [
        [4.5, 116.0], // Southwest corner (Palawan)
        [21.0, 127.0], // Northeast corner (Batanes)
      ],
      maxBoundsViscosity: 1.0, // Fully restrict panning outside bounds
      zoomAnimation: true,
      fadeAnimation: true,
      zoomControl: false,
    }).setView([0, 5], 5);

    //  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      detectRetina: true,
    }).addTo(this.map);

    this.addZoomControl();

    if (this.showRadiusSlider) {
      this.addRadiusSlider();
    }

    if (this.hasSubjectCoordinates()) {
      if (!this.isShop) this.setUserMapPin();
      else this.setUserMapPin("seller");
    }

    if (!this.isShop) {
      this.addNearShops();

      this.map.on("click", (event: any) => {
        const { lat, lng } = event.latlng;

        this.updateLocByUserClick(lat, lng);
      });
    } else {
      this.addNearBuyers();
    }
  }

  async detectLocation(event?: Event) {
    event?.preventDefault();
    event?.stopPropagation();

    if (this.isShop) {
      await this.getShopCoordinates();
    } else {
      const currentLocation = await this.getCurrentPosition();

      if (!currentLocation && this.checkDBLocation) {
        await this.getPositionFromDB();
      }
    }

    if (!this.map || !this.hasSubjectCoordinates()) {
      return;
    }

    this.clearUserLayers();
    this.setUserMapPin(this.isShop ? "seller" : "buyer");
  }

  onMapControlClick(
    event: Event,
    view: "products" | "topRatedShops" | "topNearShops",
  ): void {
    event.preventDefault();
    event.stopPropagation();

    if (view === "products") {
      this.toggleProductVisibility();
      return;
    }

    if (view === "topRatedShops") {
      this.toggleTopRatedShopsVisibility();
      return;
    }

    this.toggleNearShopsVisibility();
  }

  addZoomControl(): void {
    // Create the zoom control
    const zoomControl = L.control.zoom({
      position: "topleft",
      zoomInText: '<i class="material-icons" style="color: #f8da50;">add</i>',
      zoomOutText:
        '<i class="material-icons" style="color: #f8da50;">remove</i>',
    });

    // Add it to the map
    zoomControl.addTo(this.map);

    // Access and style its container element
    const container = zoomControl.getContainer();
    container.style.background = "white";
    container.style.borderRadius = "10px";
    container.style.padding = "4px";
    container.style.border = "none";
  }

  addRadiusSlider(): void {
    const sliderControl = L.control({ position: "topright" });

    sliderControl.onAdd = () => {
      const container = L.DomUtil.create("div", "leaflet-bar leaflet-control");
      container.innerHTML = `
  <style>
 
    #radius-slider {
      -webkit-appearance: none; 
      appearance: none;
      width: 150px;
      height: 8px; 
      border-radius: 10px;
      background: #ddd; 
      outline: none; 
    }

    #radius-value {
      color: #f8da50;
    }
   
    #radius-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px; 
      height: 20px; 
      border-radius: 50%;
      background: #f8da50;
      cursor: pointer; 
    }


    #radius-slider::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #f8da50; 
      cursor: pointer;
    }

  </style>
`;

      if (this.radius > 0) {
        container.innerHTML += `<input id="radius-slider" type="range" min="3000" max="20000" value="" step="1000">
  <label id="radius-value">3 KM</label>`;
      }

      // Prevent map drag while interacting with slider
      L.DomEvent.disableClickPropagation(container);

      if (this.radius > 0) {
        // Set custom CSS
        Object.assign(container.style, {
          background: "white",
          padding: "10px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          font: "Poppins",
          fontFamily: "Poppins, sans-serif",
          border: "none",
        });

        // Handle slider input
        let slider = container.querySelector(
          "#radius-slider",
        ) as HTMLInputElement;
        const label = container.querySelector(
          "#radius-value",
        ) as HTMLLabelElement;
        slider.value = this.radius.toString();

        label.textContent = `${(this.radius / 1000).toFixed(0)} KM`;
        slider.addEventListener("input", (event) => {
          const newRadius = Number(slider.value);
          this.circle.setRadius(newRadius);
          label.textContent = `${(newRadius / 1000).toFixed(0)} KM`;
        });

        slider.addEventListener("change", () => {
          const radius = (Number(slider.value) / 1000).toFixed(0);

          // Perform actions AFTER the user stops sliding

          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
              radius: radius,
            },
            queryParamsHandling: "merge",
          });
        });
      }

      return container;
    };

    sliderControl.addTo(this.map);
  }

  addNearShops() {
    //SHOPS MARKER
    if (size(this.shops) > 0) {
      const coordinates = this.shops.map((shop) => {
        return { lat: shop.coordinates.lat, lng: shop.coordinates.lng };
      });
      const SHOPIcon = L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/128/869/869432.png",
        iconSize: [40, 40], // Width and height
        iconAnchor: [20, 40], // Pinpoint position (center-bottom)
        popupAnchor: [0, -40], // Position relative to the marker
      });
      coordinates.forEach((SHOP) => {
        L.marker([SHOP.lat, SHOP.lng], {
          draggable: false,
          icon: SHOPIcon,
        }).addTo(this.map);
        // .bindPopup("Angular Leaflet")
      });
    }
    //END
  }

  addNearBuyers() {
    //Buyers Marker
    if (size(this.buyers) > 0) {
      const BuyerIcon = L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/128/8587/8587894.png",
        iconSize: [40, 40], // Width and height
        iconAnchor: [20, 40], // Pinpoint position (center-bottom)
        popupAnchor: [0, -40], // Position relative to the marker
      });
      this.buyers.forEach((buyer) => {
        L.marker([buyer.coordinates.lat, buyer.coordinates.lng], {
          draggable: false,
          icon: BuyerIcon,
        })
          .bindPopup()
          .addTo(this.map);
      });
    }
    //END
  }

  setUserMapPin(userType = "buyer") {
    if (this.radius > 0 && userType === "buyer") {
      this.circle = L.circle(
        [this.subject.coordinates.lat, this.subject.coordinates.lng],
        {
          color: "transparent",
          fillColor: "#f8da50",
          fillOpacity: 0.3,
          stroke: false,
          radius: this.radius, // 1km in meters
        },
      ).addTo(this.map);
    }
    //END

    // this.getCurrentPosition().subscribe((position: any) => {
    this.map.flyTo(
      [this.subject.coordinates.lat, this.subject.coordinates.lng],
      12,
      { animate: true },
    );

    const iconUrl =
      userType === "buyer"
        ? "https://cdn-icons-png.flaticon.com/128/8587/8587894.png"
        : "https://cdn-icons-png.flaticon.com/128/869/869432.png";
    //USER LOC MARKER
    const userLoc = L.icon({
      iconUrl,
      iconSize: [50, 50], // Width and height
      iconAnchor: [20, 40], // Pinpoint position (center-bottom)
      popupAnchor: [0, -40], // Position relative to the marker
    });
    this.marker = L.marker(
      [this.subject.coordinates.lat, this.subject.coordinates.lng],
      {
        draggable: !this.disabled,
        icon: userLoc,
      },
    ).addTo(this.map);
    // .bindPopup("Angular Leaflet")

    // Listen for drag events
    this.marker.on("dragend", (event: any) => {
      console.log("Map::dragend");
      const position = event.target.getLatLng();
      // Move the radius circle alog with the marker
      console.log("======,this.radius", this.radius);
      if (this.radius > 0) this.circle.setLatLng([position.lat, position.lng]);
      this.dragend.emit(position);
    });
    // });
  }

  public productVisibility = false;
  public distanceVisibility = false;
  public ratingVisibility = false;

  private resetSheetRefs() {
    this.productListSheet = null;
    this.nearShopsSheet = null;
    this.topRatedShopsSheet = null;
  }

  private async closeOpenSheets() {
    if (
      !this.productListSheet &&
      !this.nearShopsSheet &&
      !this.topRatedShopsSheet
    ) {
      return;
    }

    // await this.swipeSheet.dismiss();
    this.resetSheetRefs();
  }

  public async toggleProductVisibility() {
    if (this.productListSheet) return;

    await this.closeOpenSheets();

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view: "products" },
      queryParamsHandling: "merge",
    });
  }

  async toggleTopRatedShopsVisibility() {
    if (this.topRatedShopsSheet) return;

    await this.closeOpenSheets();

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view: "topRatedShops" },
      queryParamsHandling: "merge",
    });
  }

  async toggleNearShopsVisibility() {
    if (this.nearShopsSheet) return;

    await this.closeOpenSheets();

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view: "topNearShops" },
      queryParamsHandling: "merge",
    });
  }
}
