import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import {
  distinctUntilChanged,
  filter,
  Subject,
  Subscription,
  takeUntil,
} from "rxjs";
import { HttpRequestService } from "src/app/http-request/http-request.service";
import { INearestShops } from "src/app/models/nearest-shops.model";
import { chatSeller } from "src/app/shared/store/chat/chat.actions";

@Component({
  selector: "app-shop-list",
  templateUrl: "./shop-list.component.html",
  styleUrls: ["./shop-list.component.scss"],
})
export class ShopListComponent implements OnInit {
  nearestShops: INearestShops[] = [];
  destroy$ = new Subject<void>();

  sortBy = "distance";
  queryParams = {};
  private queryParamsSub?: Subscription;

  constructor(
    private store: Store,
    private actions$: Actions,
    private hrs: HttpRequestService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.listenToQueryParams();
    this.getNearShops();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getNearShops() {
    this.hrs
      .request("getV2", "shop/getNearestShops", {
        ...this.queryParams,
        sortBy: this.sortBy,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (res: any) => {
        console.log("----shop/getNearestShops", res);
        const data: INearestShops[] = res.data;
        this.nearestShops = data;
      });
  }

  chatSeller(shopId: string) {
    this.store.dispatch(chatSeller({ shopId }));
  }

  listenToQueryParams(): void {
    this.queryParamsSub?.unsubscribe();
    this.queryParamsSub = this.route.queryParams
      .pipe(
        filter(
          (params: Params) => params["lat"] || params["lng"] || params["radius"]
        ),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((params: Params) => {
        console.log("params/near-shop-list", params);
        this.queryParams = params;

        this.getNearShops();
      });
  }

  onScroll(): void {
    // const container = this.blogListContainer.nativeElement as HTMLElement;
    // const userCurrentHeight = Math.ceil(
    //   Math.abs(container.scrollTop) + container.clientHeight + 1
    // );
    // const scrollHeight = container.scrollHeight;
    // const isAtTop = userCurrentHeight >= scrollHeight;
    // console.log("-------------- userCurrentHeight", userCurrentHeight);
    // console.log("--------------scrollHeight", scrollHeight);
    // if (isAtTop && !this.onLoad) {
    //   this.onLoad = true;
    //   this.store.dispatch(
    //     getPastBlogs({
    //       lastBlogDate: this.blogs[this.blogs.length - 1]?.updatedAt ?? "",
    //     })
    //   );
    // }
  }
}
