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
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { Observable, Subject, takeUntil } from "rxjs";
import {
  getBlogs,
  getPastBlogs,
  getPastBlogsFailure,
  getPastBlogsSuccess,
} from "src/app/shared/store/blog/blog.actions";
import { selectBlogs } from "src/app/shared/store/blog/blog.selector";
import { IBlog } from "src/app/shared/store/blog/blog.state";

@Component({
  selector: "app-blog-list",
  templateUrl: "./blog-list.component.html",
  styleUrls: ["./blog-list.component.scss"],
})
export class BlogListComponent implements OnInit, OnDestroy {
  blogs: IBlog[] = [];
  selectBlogs$: Observable<IBlog[]>;
  private destroy$ = new Subject<void>();
  @Output() editBlog = new EventEmitter<IBlog>();
  @Input() horizontalBlogListView = false;
  @Input() isShop = false;

  constructor(private store: Store, private actions$: Actions) {
    this.store.dispatch(getBlogs());
    this.selectBlogs$ = this.store
      .select(selectBlogs)
      .pipe(takeUntil(this.destroy$));

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
    this.selectBlogs$.subscribe((data) => {
      this.blogs = data;
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
}
