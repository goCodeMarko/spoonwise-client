import { Component, OnInit } from "@angular/core";
import { IBlog } from "src/app/shared/store/blog/blog.state";

@Component({
  selector: "app-blog-list-page",
  templateUrl: "./blog-list-page.component.html",
  styleUrls: ["./blog-list-page.component.scss"],
})
export class BlogListPageComponent implements OnInit {
  blog: IBlog = {} as IBlog;
  constructor() {}

  ngOnInit(): void {}

  onEditBlog(blog: IBlog): void {
    this.blog = blog;
  }

  cancelUpdate() {
    this.blog = {} as IBlog;
  }
}
