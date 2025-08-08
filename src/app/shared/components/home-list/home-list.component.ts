import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-home-list",
  templateUrl: "./home-list.component.html",
  styleUrls: ["./home-list.component.scss"],
})
export class HomeListComponent implements OnInit {
  @Input() displayNearShops: boolean = false;
  @Input() isShop = false;
  constructor() {}

  ngOnInit(): void {}
}
