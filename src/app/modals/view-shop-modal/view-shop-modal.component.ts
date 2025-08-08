import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "app-view-shop-modal",
  templateUrl: "./view-shop-modal.component.html",
  styleUrls: ["./view-shop-modal.component.scss"],
})
export class ViewShopModalComponent implements OnInit {
  constructor(
    private dialog: MatDialogRef<ViewShopModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {}

  decline(id: string) {
    console.log("---------_jd", id);
    this.dialog.close({ status: "declined", id: id });
  }

  approve(id: string) {
    this.dialog.close({ status: "approved", id: id });
  }
}
