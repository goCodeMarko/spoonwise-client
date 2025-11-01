import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { takeUntil } from "rxjs";
import { HttpRequestService } from "src/app/http-request/http-request.service";
import _ from "lodash";

@Component({
  selector: "app-deals-page",
  templateUrl: "./deals-page.component.html",
  styleUrls: ["./deals-page.component.scss"],
})
export class DealsPageComponent implements OnInit, OnDestroy {
  static componentName = "DealsPageComponent";
  isMapLoading: boolean = true;
  shops: any[] = [];

  destroy$ = new EventEmitter<void>();
  constructor(
    private hrs: HttpRequestService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getShops();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async onMapDragend(e: any) {
    try {
      await this.updatedCoordinates(e);
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          lat: e.lat,
          lng: e.lng,
        },
        queryParamsHandling: "merge",
      });
    } catch (error) {
      console.log("error", error);
    }
  }

  updatedCoordinates(coordinates: { lat: string; lng: string }) {
    return new Promise((resolve, reject) => {
      this.hrs.request(
        "put",
        `user/updateBuyerLocation`,
        {
          coordinates,
        },
        async (res: any) => {
          if (res.success) resolve(res);
          else reject(res);
        }
      );
    });
  }

  getShops() {
    this.hrs.request("get", "shop/getShops", {}, async (res: any) => {
      if (res.success && _.has(res, "data")) {
        this.shops = res.data;
      }

      this.isMapLoading = false;
    });
  }
}
