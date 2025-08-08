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

@Component({
  selector: "app-near-shop-list",
  templateUrl: "./near-shop-list.component.html",
  styleUrls: ["./near-shop-list.component.scss"],
})
export class NearShopListComponent implements OnInit {
  nearestShops: INearestShops[] = [];

  constructor(
    private store: Store,
    private actions$: Actions,
    private hrs: HttpRequestService
  ) {}

  ngOnInit(): void {
    this.getNearShops();
  }

  ngOnDestroy(): void {}

  getNearShops() {
    this.hrs.request("get", "shop/getNearestShops", {}, async (res: any) => {
      console.log("----shop/getNearestShops", res);
      const data: INearestShops[] = res.data;
      this.nearestShops = data;
    });
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
