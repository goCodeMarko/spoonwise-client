import {
  AfterViewInit,
  Component,
  DoCheck,
  EventEmitter,
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
import { firstValueFrom, Observable, Subscriber } from "rxjs";
import { AuthService } from "src/app/authorization/auth.service";
import { GeolocationService } from "../../services/geolocation/geolocation.service";
import { HttpRequestService } from "src/app/http-request/http-request.service";
import { style } from "@angular/animations";
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

  @Output() dragend = new EventEmitter<any>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private hrs: HttpRequestService,
    private geolocationService: GeolocationService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params.radius) this.radius = params.radius * 1000;
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
  }

  ngOnDestroy(): void {
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
          this.dragend.emit(this.subject.coordinates);
          resolve(this.subject);
        })
        .catch((err) => {
          console.error(err);
          resolve(null);
        });
    });
  }

  private async getPositionFromDB() {
    const { data } = (await firstValueFrom(
      this.hrs.request("getV2", `user/getAuthUser`, {})
    )) as any;

    this.subject = {
      coordinates: {
        lat: data.coordinates.lat.toString(),
        lng: data.coordinates.lng.toString(),
      },
    };
    this.dragend.emit(this.subject.coordinates);
  }

  private async getShopCoordinates() {
    const { data } = (await firstValueFrom(
      this.hrs.request("getV2", `shop/getShop`, {})
    )) as any;

    this.subject = {
      coordinates: {
        lat: data.coordinates.lat.toString(),
        lng: data.coordinates.lng.toString(),
      },
    };
    this.dragend.emit(this.subject.coordinates);
  }

  private updateLocByUserClick(lat: string, lng: string) {
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    if (this.circle) {
      this.map.removeLayer(this.circle);
    }

    // Move the radius circle alog with the marker
    if (this.radius > 0) this.circle.setLatLng([lat, lng]);

    this.subject = {
      coordinates: {
        lat: lat.toString(),
        lng: lng.toString(),
      },
    };
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

    if (!this.isShop) {
      // if (this.detectCurrentLocation && !this.checkDBLocation)
      await this.getCurrentPosition();
      if (this.checkDBLocation) await this.getPositionFromDB();
    } else if (this.isShop) {
      await this.getShopCoordinates();
    }

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

    if (!this.isShop) {
      this.addRadiusSlider();
      this.addGPSButton();
    }

    if (!this.isShop) this.setUserMapPin();
    else this.setUserMapPin("seller");

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

  addGPSButton(): void {
    const gpsButton = L.control({ position: "topleft" });

    gpsButton.onAdd = () => {
      const container = L.DomUtil.create("div", "gps-control");
      container.innerHTML = `
        <style>     
        #gpsButton {
          background: white;
          border-radius: 10px;
          top: 25px;
          color: #f8da50;
          padding: 4px;
          border: none;  
          width: 38px;      
          }
          </style>
        <button id="gpsButton"> <i class="material-icons">gps_fixed</i></button>
      `;

      const gpsButton = container.querySelector(
        "#gpsButton"
      ) as HTMLLabelElement;

      gpsButton.addEventListener("click", async (event) => {
        await this.getCurrentPosition();
        if (this.marker) {
          this.map.removeLayer(this.marker);
        }

        if (this.circle) {
          this.map.removeLayer(this.circle);
        }
        this.setUserMapPin();
      });

      return container;
    };
    gpsButton.addTo(this.map);
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

    .leaflet-control-attribution {
      bottom: 7px;
      right: 7px;
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
          "#radius-slider"
        ) as HTMLInputElement;
        const label = container.querySelector(
          "#radius-value"
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
        })
          .bindPopup("Angular Leaflet")
          .addTo(this.map);
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
        }
      ).addTo(this.map);
    }
    //END

    // this.getCurrentPosition().subscribe((position: any) => {
    this.map.flyTo(
      [this.subject.coordinates.lat, this.subject.coordinates.lng],
      12,
      { animate: true }
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
      }
    )
      .bindPopup("Angular Leaflet")
      .addTo(this.map);

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
}
