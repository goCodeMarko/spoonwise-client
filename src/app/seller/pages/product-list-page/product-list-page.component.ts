import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-product-list-page",
  templateUrl: "./product-list-page.component.html",
  styleUrls: ["./product-list-page.component.scss"],
})
export class ProductListPageComponent implements OnInit {
  static componentName = "ProductListPageComponent";
  productVisibility = false;
  constructor() {}

  ngOnInit(): void {}
  toggleProductVisibility() {
    this.productVisibility = !this.productVisibility;
  }
}
