import { Component, EventEmitter, OnDestroy, OnInit } from "@angular/core";
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
  destroy$ = new EventEmitter<void>();
  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        console.log("params", params);
        if (params.view === "products") this.productVisibility = true;
        else this.productVisibility = false;
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
}
