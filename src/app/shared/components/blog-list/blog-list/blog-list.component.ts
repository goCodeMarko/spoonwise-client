import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Actions, ofType } from "@ngrx/effects";
import { select, Store } from "@ngrx/store";
import { Observable, Subject, takeUntil } from "rxjs";
import { HttpRequestService } from "src/app/http-request/http-request.service";
import { PopUpModalComponent } from "src/app/modals/pop-up-modal/pop-up-modal.component";
import {
  getBlogs,
  getPastBlogs,
  getPastBlogsFailure,
  getPastBlogsSuccess,
  getSavedBlogs,
  getSavedBlogsSuccess,
  saveBlog,
  saveBlogFailure,
  saveBlogSuccess,
  unsaveBlog,
  unsaveBlogFailure,
  unsaveBlogSuccess,
} from "src/app/shared/store/blog/blog.actions";
import {
  selectBlogs,
  selectSavedBlogs,
} from "src/app/shared/store/blog/blog.selector";
import { IBlog } from "src/app/shared/store/blog/blog.state";

@Component({
  selector: "app-blog-list",
  templateUrl: "./blog-list.component.html",
  styleUrls: ["./blog-list.component.scss"],
})
export class BlogListComponent implements OnInit, OnDestroy {
  blogs: IBlog[] = [];
  selectBlogs$!: Observable<IBlog[]>;
  private destroy$ = new Subject<void>();
  @Output() editBlog = new EventEmitter<IBlog>();
  @Input() horizontalBlogListView = false;
  @Input() isShop = false;
  @Input() savedBlogsOnly = false;

  constructor(
    private store: Store,
    private actions$: Actions,
    private hrs: HttpRequestService,
    private dialog: MatDialog
  ) {
    this.actions$
      .pipe(ofType(getSavedBlogsSuccess), takeUntil(this.destroy$))
      .subscribe((action) => {
        this.store.dispatch(getBlogs());
        this.onLoad = false;
      });

    this.actions$
      .pipe(
        ofType(getPastBlogsSuccess, getPastBlogsFailure),
        takeUntil(this.destroy$)
      )
      .subscribe((action) => {
        this.onLoad = false;
      });
  }

  ngOnInit(): void {
    console.log("BlogListComponent Initiated!", this.savedBlogsOnly);
    this.selectBlogs$ = this.store
      .select(this.savedBlogsOnly ? selectSavedBlogs : selectBlogs)
      .pipe(takeUntil(this.destroy$));

    this.selectBlogs$.subscribe((data) => {
      this.blogs = data;
    });

    this.actions$
      .pipe(
        ofType(
          saveBlogSuccess,
          saveBlogFailure,
          unsaveBlogSuccess,
          unsaveBlogFailure
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((res: any) => {
        const data = res.data;

        if (res.type === "saveBlogFailure") {
          this.dialog.open(PopUpModalComponent, {
            width: "500px",
            data: {
              deletebutton: false,
              okaybutton: false,
              title: "Error",
              message: "Blog has not been saved",
              file: "assets/icons/party.png",
            },
          });
        }

        if (res.type === "unsaveBlogFailure") {
          this.dialog.open(PopUpModalComponent, {
            width: "500px",
            data: {
              deletebutton: false,
              okaybutton: false,
              title: "Error",
              message: "Blog has not been unsaved",
              file: "assets/icons/party.png",
            },
          });
        }

        if (res.type === "saveBlogSuccess") {
          if (data.success && data.data.modifiedCount) {
            this.dialog.open(PopUpModalComponent, {
              width: "500px",
              data: {
                deletebutton: false,
                okaybutton: false,
                title: "Blog Saved! 🎉",
                message: "Blog has been saved successfully",
                file: "assets/icons/party.png",
              },
            });
          }
        }

        if (res.type === "unsaveBlogSuccess") {
          this.dialog.open(PopUpModalComponent, {
            width: "500px",
            data: {
              deletebutton: false,
              okaybutton: false,
              title: "Blog Unsaved! 🎉",
              message: "Blog has been remove to saved blogs",
              file: "assets/icons/party.png",
            },
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onEdit(blog: IBlog): void {
    this.editBlog.emit(blog);
  }

  @ViewChild("blogListContainer", { static: false })
  blogListContainer!: ElementRef;
  allChatsHasBeenDisplayed = false;
  onLoad = false;
  onScroll(): void {
    const container = this.blogListContainer.nativeElement as HTMLElement;
    const userCurrentHeight = Math.ceil(
      Math.abs(container.scrollTop) + container.clientHeight + 1
    );
    const scrollHeight = container.scrollHeight;
    const isAtTop = userCurrentHeight >= scrollHeight;
    console.log("-------------- userCurrentHeight", userCurrentHeight);
    console.log("--------------scrollHeight", scrollHeight);
    if (isAtTop && !this.onLoad) {
      this.onLoad = true;

      this.store.dispatch(
        getPastBlogs({
          lastBlogDate: this.blogs[this.blogs.length - 1]?.updatedAt ?? "",
        })
      );
    }
  }

  onScrollHorizontal(): void {
    const container = this.blogListContainer.nativeElement as HTMLElement;
    const userCurrentWidth = Math.ceil(
      Math.abs(container.scrollLeft) + container.clientWidth + 1
    );
    const scrollWidth = container.scrollWidth;
    const isAtTop = userCurrentWidth >= scrollWidth;
    console.log("-------------- userCurrentWidth", userCurrentWidth);
    console.log("--------------scrollWidth", scrollWidth);
    if (isAtTop && !this.onLoad) {
      this.onLoad = true;

      this.store.dispatch(
        getPastBlogs({
          lastBlogDate: this.blogs[this.blogs.length - 1]?.updatedAt ?? "",
        })
      );
    }
  }

  save(blog: IBlog): void {
    console.log("---save");
    this.store.dispatch(saveBlog({ blog }));
  }

  unsave(id: string): void {
    console.log("---unsave");
    this.store.dispatch(unsaveBlog({ id }));
  }
}
