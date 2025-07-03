import { Component, OnInit } from "@angular/core";
import { MenuItems } from "../shared/menu-items/menu-items";

@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.css"],
})
export class AdminComponent implements OnInit {
  constructor(private menu: MenuItems) {}

  ngOnInit(): void {
    this.menu.setMenuItem([
      {
        main: "admin",
        state: "shops",
        type: "link",
        name: "Shops",
        icon: "accessibility ",
      },
      {
        main: "admin",
        state: "settlements",
        type: "link",
        name: "Settlements",
        icon: "auto_stories ",
      },
      {
        main: "admin",
        state: "blogs",
        type: "link",
        name: "Blogs",
        icon: "accessibility ",
      },
    ]);
  }
}
