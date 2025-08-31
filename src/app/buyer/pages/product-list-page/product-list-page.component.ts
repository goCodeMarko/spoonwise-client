import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { takeUntil } from "rxjs";

@Component({
  selector: "app-product-list-page",
  templateUrl: "./product-list-page.component.html",
  styleUrls: ["./product-list-page.component.scss"],
})
export class ProductListPageComponent implements OnInit, OnDestroy {
  static componentName = "ProductListPageComponent";
  productVisibility = false;
  distanceVisibility = false;
  ratingVisibility = false;
  destroy$ = new EventEmitter<void>();
  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        if (params.view === "products") this.productVisibility = true;
        else this.productVisibility = false;

        if (params.view === "topNearShops") this.distanceVisibility = true;
        else this.distanceVisibility = false;

        if (params.view === "topRatedShops") this.ratingVisibility = true;
        else this.ratingVisibility = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleProductVisibility() {
    const queryParams = this.productVisibility
      ? { view: null }
      : { view: "products" };
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: "merge",
    });
  }

  toggleShopProductVisibility() {
    const queryParams = this.ratingVisibility
      ? { view: null }
      : { view: "topRatedShops" };
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: "merge",
    });
  }

  toggleDistanceVisibility() {
    const queryParams = this.distanceVisibility
      ? { view: null }
      : { view: "topNearShops" };
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: "merge",
    });
  }
}
