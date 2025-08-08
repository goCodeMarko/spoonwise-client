import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable, Subject, takeUntil } from "rxjs";
import { IBlog } from "../../store/blog/blog.state";
import { Store } from "@ngrx/store";
import { Actions } from "@ngrx/effects";
import { selectBlog } from "../../store/blog/blog.selector";
import { HttpRequestService } from "src/app/http-request/http-request.service";
import * as _ from "lodash";

@Component({
  selector: "app-view-blog",
  templateUrl: "./view-blog.component.html",
  styleUrls: ["./view-blog.component.scss"],
})
export class ViewBlogComponent implements OnInit {
  blog!: IBlog;
  blogId!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,

    private hrs: HttpRequestService
  ) {
    this.blogId = this.route.snapshot.paramMap.get("blogId")!;
    if (this.blogId) this.getBlog(this.blogId);
    else this.router.navigate(["/admin/blogs"]);
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  getBlog(blogId: string) {
    this.hrs.request("get", `blog/getBlog/${blogId}`, {}, (res: any) => {
      if (res.success && _.has(res, "data")) {
        this.blog = res.data;
      } else {
        this.router.navigate(["/admin/blogs"]);
      }
    });
  }
}
