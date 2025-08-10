import {
  Component,
  ElementRef,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { Audience, BlogStatus, IBlog } from "../../store/blog/blog.state";
import { Observable, Subject, takeUntil } from "rxjs";
import { EventEmitter } from "stream";
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
import { Router } from "@angular/router";

@Component({
  selector: "app-near-shop-list",
  templateUrl: "./near-shop-list.component.html",
  styleUrls: ["./near-shop-list.component.scss"],
})
export class NearShopListComponent implements OnInit {
  nearestShops: INearestShops[] = [];
  destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private actions$: Actions,
    private hrs: HttpRequestService,
    private route: Router
  ) {}

  ngOnInit(): void {
    this.getNearShops();

    this.actions$
      .pipe(ofType(chatSellerSuccess), takeUntil(this.destroy$))
      .subscribe((action) => {
        const chatroom = action.chatroom;

        this.route.navigate([`/chats/${chatroom._id}`], {
          queryParams: { isSpoonwiseAI: false },
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getNearShops() {
    this.hrs.request("get", "shop/getNearestShops", {}, async (res: any) => {
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
