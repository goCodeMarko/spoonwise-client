import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-chat-page",
  templateUrl: "./chat-page.component.html",
  styleUrls: ["./chat-page.component.scss"],
})
export class ChatPageComponent implements OnInit {
  static componentName = "ChatPageComponent";
  constructor() {}

  ngOnInit(): void {}
}
