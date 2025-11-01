import { Component, EventEmitter, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { finalize, takeUntil } from "rxjs";
import { HttpRequestService } from "src/app/http-request/http-request.service";

@Component({
  selector: "app-deals-page",
  templateUrl: "./deals-page.component.html",
  styleUrls: ["./deals-page.component.scss"],
})
export class DealsPageComponent implements OnInit, OnDestroy {
  static componentName = "DealsPageComponent";
  isMapLoading: boolean = true;
  buyers: any[] = [];
  destroy$ = new EventEmitter<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private hrs: HttpRequestService
  ) {}

  ngOnInit(): void {
    this.getBuyers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getBuyers() {
    this.hrs
      .request("getV2", "user/getBuyers", {})
      .pipe(finalize(() => (this.isMapLoading = false)))
      .subscribe((res: any) => {
        console.log("----", res);
        this.buyers = res.data;
      });
  }
}
