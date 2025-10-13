import {
  Component,
  ElementRef,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { Audience, BlogStatus, IBlog } from "../../store/blog/blog.state";
import {
  distinctUntilChanged,
  filter,
  Observable,
  Subject,
  Subscription,
  takeUntil,
} from "rxjs";
import { Actions, ofType } from "@ngrx/effects";
import {
  getBlogs,
  getPastBlogs,
  getPastBlogsFailure,
  getPastBlogsSuccess,
} from "../../store/blog/blog.actions";
import { selectBlogs } from "../../store/blog/blog.selector";
import { Store } from "@ngrx/store";
import { HttpRequestService } from "src/app/http-request/http-request.service";
import { INearestShops } from "src/app/models/nearest-shops.model";
import { chatSeller, chatSellerSuccess } from "../../store/chat/chat.actions";
import { ActivatedRoute, Params, Router } from "@angular/router";

@Component({
  selector: "app-shop-list",
  templateUrl: "./shop-list.component.html",
  styleUrls: ["./shop-list.component.scss"],
})
export class ShopListComponent implements OnInit {
  nearestShops: INearestShops[] = [];
  destroy$ = new Subject<void>();
  @Input() ratingVisibility = false;
  @Input() distanceVisibility = false;
  @Input() sortBy = "distance";
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
    // console.log("ddddddd");
    // this.actions$
    //   .pipe(ofType(chatSellerSuccess), takeUntil(this.destroy$))
    //   .subscribe((action) => {
    //     const chatroom = action.chatroom;
    //     console.log("===============");
    //     this.router.navigate([`/chats/${chatroom._id}`], {
    //       queryParams: { isSpoonwiseAI: false },
    //     });
    //   });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["distanceVisibility"] || changes["ratingVisibility"]) {
      const currentdistanceVisibility =
        changes["distanceVisibility"]?.currentValue;
      const currentratingVisibility = changes["ratingVisibility"]?.currentValue;

      if (!currentdistanceVisibility && !currentratingVisibility) {
        console.log("----destroy");
        this.destroy$.next();
      } else {
        this.listenToQueryParams();
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getNearShops() {
    this.hrs
      .request("getV2", "shop/getNearestShops", {
        ...this.queryParams,
        sortBy: this.ratingVisibility ? "rating" : "distance",
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

  @ViewChild("blogListContainer", { static: false })
  blogListContainer!: ElementRef;
  allChatsHasBeenDisplayed = false;
  onLoad = false;

  listenToQueryParams(): void {
    if (!this.ratingVisibility && !this.distanceVisibility) return;

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
