import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { Editor } from "ngx-editor";
import { MatDialog } from "@angular/material/dialog";
import { SelectAudienceModalComponent } from "src/app/modals/select-audience-modal/select-audience-modal.component";
import { FormControl, Validators } from "@angular/forms";
import {
  setNewBlog,
  setNewBlogSuccess,
  updateBlog,
  updateBlogSuccess,
} from "src/app/shared/store/blog/blog.actions";
import { Store } from "@ngrx/store";
import { Actions, ofType } from "@ngrx/effects";
import { Subject, takeUntil } from "rxjs";
import {
  Audience,
  AudienceUI,
  BlogStatus,
  IBlog,
} from "src/app/shared/store/blog/blog.state";
import { PopUpModalComponent } from "src/app/modals/pop-up-modal/pop-up-modal.component";

@Component({
  selector: "app-add-blog",
  templateUrl: "./add-blog.component.html",
  styleUrls: ["./add-blog.component.scss"],
})
export class AddBlogComponent implements OnInit, OnDestroy, OnChanges {
  AudienceUI = AudienceUI;
  BlogStatus = BlogStatus;
  editor!: Editor;
  selectedAudience: Audience = Audience.Public;
  title = new FormControl("", Validators.required);
  html = new FormControl("", Validators.required);
  blogId?: string;
  @Input() blog: IBlog = {} as IBlog;
  @Output() onCancelUpdate = new EventEmitter<void>();
  private destroy$ = new Subject<void>();
  constructor(
    private dialog: MatDialog,
    private store: Store,
    private actions$: Actions
  ) {}

  ngOnInit(): void {
    this.editor = new Editor();

    this.actions$
      .pipe(
        ofType(setNewBlogSuccess, updateBlogSuccess),
        takeUntil(this.destroy$)
      )
      .subscribe((action) => {
        console.log("--action", action);
        const title =
          action.type === "[Blog] Update Blog Success"
            ? "Blog Update Successfuly"
            : "Blog Created Successfuly";
        const message =
          action.type === "[Blog] Update Blog Success"
            ? "Great job! Your blog is updated."
            : "Great job! Your blog is now part of Spoonwise Community.";

        this.dialog.open(PopUpModalComponent, {
          width: "500px",
          data: {
            deletebutton: false,
            okaybutton: false,
            title: title,
            message: message,
            file: "assets/icons/party.png",
          },
        });
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log("changes", changes);

    if (
      changes["blog"] &&
      changes["blog"].currentValue &&
      !changes["blog"].firstChange
    ) {
      this.title.setValue(changes["blog"].currentValue.title);
      this.html.setValue(changes["blog"].currentValue.content);
      this.selectedAudience = changes["blog"].currentValue.audience;
      this.blogId = changes["blog"].currentValue._id;
      console.log("----");
    }
  }

  ngOnDestroy(): void {
    this.editor.destroy();

    this.destroy$.next();
    this.destroy$.complete();
  }

  cancelUpdate() {
    this.title.setValue("");
    this.html.setValue("");
    this.selectedAudience = Audience.Public;
    this.blogId = "";
    this.onCancelUpdate.emit();
  }

  setAudience() {
    const dialogRef = this.dialog.open(SelectAudienceModalComponent, {
      width: "500px",
      data: { audience: this.selectedAudience },
    });

    dialogRef.afterClosed().subscribe((result: { selected: Audience }) => {
      if (result?.selected) this.selectedAudience = result.selected;
    });
  }

  setBlog(blogStatus: BlogStatus) {
    if (this.title.invalid) {
      this.title.markAsTouched();
    }
    if (this.html.invalid) {
      this.html.markAsTouched();
    }

    if (this.title.invalid || this.html.invalid) return;

    const blog: IBlog = {
      audience: this.selectedAudience,
      status: blogStatus,
      title: this.title.value,
      content: this.html.value,
    };
    console.log("blog", blog);
    if (this.blogId) {
      this.store.dispatch(updateBlog({ blogId: this.blogId, blog }));
    } else {
      this.store.dispatch(setNewBlog(blog));
    }
  }
}
