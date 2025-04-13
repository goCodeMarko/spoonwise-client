import {
  AfterViewInit,
  Component,
  DoCheck,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewEncapsulation,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable, Subscriber } from "rxjs";
import { AuthService } from "src/app/authorization/auth.service";
declare let L: any; // Declare Leaflet from the global scope

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.scss"],
})
export class MapComponent implements OnInit, AfterViewInit, OnChanges {
  map: any;
  @Input() shops: any[] = [];
  @Input() subject: any;
  circle: any;
  @Input() radius: number = 3000;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.loadMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["radius"] && this.map) {
      L.circle([this.subject.coordinates.lat, this.subject.coordinates.lon], {
        color: "transparent",
        fillColor: "#00c6c8",
        fillOpacity: 0.3,
        stroke: false,
        radius: this.radius, // 1km in meters
      }).addTo(this.map);
    }
  }

  /*private getCurrentPosition(): any {
    return new Observable((observer: Subscriber<any>) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position: any) => {
          console.log(position);
          observer.next({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          observer.complete();
        });
      } else {
        observer.error();
      }
    });
  }*/

  private loadMap(): void {
    this.map = L.map("map", {
      center: [12.8797, 121.774], // Center of the Philippines
      zoom: 6, // Adjust zoom level
      minZoom: 5,
      maxBounds: [
        [4.5, 116.0], // Southwest corner (Palawan)
        [21.0, 127.0], // Northeast corner (Batanes)
      ],
      maxBoundsViscosity: 1.0, // Fully restrict panning outside bounds
    }).setView([0, 0], 1);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "mapbox/streets-v11",
      tileSize: 512,
      zoomOffset: -1,
    }).addTo(this.map);

    this.addRadiusSlider();

    // this.getCurrentPosition().subscribe((position: any) => {
    this.map.flyTo(
      [this.subject.coordinates.lat, this.subject.coordinates.lon],
      13
    );

    //BUYER MARKER
    const buyerIcon = L.icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/128/8587/8587894.png",
      iconSize: [50, 50], // Width and height
      iconAnchor: [20, 40], // Pinpoint position (center-bottom)
      popupAnchor: [0, -40], // Position relative to the marker
    });
    let marker = L.marker(
      [this.subject.coordinates.lat, this.subject.coordinates.lon],
      {
        draggable: true,
        icon: buyerIcon,
      }
    )
      .bindPopup("Angular Leaflet")
      .addTo(this.map);

    this.circle = L.circle(
      [this.subject.coordinates.lat, this.subject.coordinates.lon],
      {
        color: "transparent",
        fillColor: "#00c6c8",
        fillOpacity: 0.3,
        stroke: false,
        radius: this.radius, // 1km in meters
      }
    ).addTo(this.map);
    //END

    //SHOPS MARKER
    const coordinates = this.shops.map((shop) => {
      return { lat: shop.coordinates.lat, lon: shop.coordinates.lon };
    });
    const SHOPIcon = L.icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/128/869/869432.png",
      iconSize: [40, 40], // Width and height
      iconAnchor: [20, 40], // Pinpoint position (center-bottom)
      popupAnchor: [0, -40], // Position relative to the marker
    });
    coordinates.forEach((SHOP) => {
      console.log("SHOP", SHOP);
      L.marker([SHOP.lat, SHOP.lon], {
        icon: SHOPIcon,
      })
        .bindPopup("Angular Leaflet")
        .addTo(this.map);
    });
    //END

    // Listen for drag events
    marker.on("dragend", (event: any) => {
      const position = event.target.getLatLng();
      // Move the radius circle along with the marker
      this.circle.setLatLng([position.lat, position.lng]);
      console.log(`New Coordinates:${position.lat}, ${position.lng}`);
    });
    // });
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
      color: #00C6C8;
    }
   
    #radius-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px; 
      height: 20px; 
      border-radius: 50%;
      background: #00C6C8;
      cursor: pointer; 
    }


    #radius-slider::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #00C6C8; 
      cursor: pointer;
    }


     .leaflet-touch .leaflet-bar {
      background: white;
      border-radius: 10px;
      top: 7px;
      color:red;
      padding: 4px;
    }

    .leaflet-control-zoom-out {
      border-radius: 10px !important;
      border: none !important;
    }
    .leaflet-control-zoom-out span {
      color: #00C6C8;
    }

     .leaflet-control-zoom-in {
      border-radius: 10px !important;
      border: none !important;
    }
      .leaflet-control-zoom-in span {
      color: #00C6C8;
    }

    
    .leaflet-control-attribution {
      bottom: 7px;
      right: 7px;
    }
  </style>

  <input id="radius-slider" type="range" min="3000" max="20000" value="3000" step="1000">
  <label id="radius-value">3 KM</label>
`;

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

      // Prevent map drag while interacting with slider
      L.DomEvent.disableClickPropagation(container);

      // Handle slider input
      const slider = container.querySelector(
        "#radius-slider"
      ) as HTMLInputElement;
      const label = container.querySelector(
        "#radius-value"
      ) as HTMLLabelElement;

      slider.addEventListener("input", (event) => {
        const newRadius = Number(slider.value);
        this.circle.setRadius(newRadius);
        label.textContent = `${(newRadius / 1000).toFixed(0)} KM`;
      });

      slider.addEventListener("change", () => {
        const radius = (Number(slider.value) / 1000).toFixed(0);

        // Perform actions AFTER the user stops sliding
        console.log("Final radius after sliding:", radius);

        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {
            radius: radius,
          },
          queryParamsHandling: "merge",
        });
      });

      return container;
    };

    sliderControl.addTo(this.map);
  }
}
