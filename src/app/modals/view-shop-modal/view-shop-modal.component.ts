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

  ngOnInit(): void {
    console.log("==============data", this.data);
  }
}
