import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-product-list-page",
  templateUrl: "./product-list-page.component.html",
  styleUrls: ["./product-list-page.component.scss"],
})
export class ProductListPageComponent implements OnInit {
  static componentName = "ProductListPageComponent";

  constructor() {}

  ngOnInit(): void {}
}
