import { Component, OnDestroy, OnInit } from "@angular/core";
import { AuthService } from "../authorization/auth.service";
import { Observable, Subscription } from "rxjs";
import { SocketService } from "../shared/socket/socket.service";
import { Store } from "@ngrx/store";
import { setToPay } from "../shared/store/order/order.actions";
import {
  plusOneToSentDeliveredCounter,
  setChatrooms,
  setSendingMessage,
  setTotalCountSentDeliveredMessages,
  updateChatroomsMsgStatusToDelivered,
  updateChatroomsMsgStatusToSeen,
} from "../shared/store/chat/chat.actions";
import { HttpRequestService } from "../http-request/http-request.service";

@Component({
  selector: "app-seller",
  templateUrl: "./seller.component.html",
  styleUrls: ["./seller.component.scss"],
})
export class SellerComponent implements OnInit, OnDestroy {
  routerOutletComponent: any;
  getUserDataSubcription: any;
  onNewChatMessage: Subscription;
  onUpdateChatroomsMsgStatusToDelivered: Subscription;
  onUpdateChatroomsMsgStatusToSeen: Subscription;

  constructor(
    private socket: SocketService,
    private store: Store,
    private hrs: HttpRequestService
  ) {
    this.socket.connect();

    this.onNewChatMessage = this.socket
      .onNewChatMessage()
      .subscribe((message: any) => {
        console.log("Seller Delivered a message");
        this.markSenderMessagesAsDelivered();
        this.store.dispatch(setSendingMessage({ message }));
        this.store.dispatch(plusOneToSentDeliveredCounter({ message }));
      });

    this.onUpdateChatroomsMsgStatusToDelivered = this.socket
      .onUpdateChatroomsMsgStatusToDelivered()
      .subscribe((updatedChatrooms: any) => {
        console.log("Seller onUpdateChatroomsMsgStatusToDelivered");
        this.store.dispatch(
          updateChatroomsMsgStatusToDelivered({
            updatedchatroomsMsg: updatedChatrooms,
          })
        );
      });

    this.onUpdateChatroomsMsgStatusToSeen = this.socket
      .onUpdateChatroomsMsgStatusToSeen()
      .subscribe((updatedChatroom: any) => {
        console.log("Seller onUpdateChatroomsMsgStatusToSeen", updatedChatroom);
        this.store.dispatch(
          updateChatroomsMsgStatusToSeen({
            updatedChatroom,
          })
        );
      });
  }

  ngOnInit(): void {
    this.markSenderMessagesAsDelivered();

    this.store.dispatch(setToPay());
    this.store.dispatch(setTotalCountSentDeliveredMessages());
    this.store.dispatch(setChatrooms());
  }

  ngOnDestroy(): void {
    this.socket.disconnect();
    this.onNewChatMessage.unsubscribe();
    this.onUpdateChatroomsMsgStatusToDelivered.unsubscribe();
    this.onUpdateChatroomsMsgStatusToSeen.unsubscribe();
  }

  fromRouterOutlet(component: any) {
    const name = component.constructor["componentName"] || "unknown";

    this.routerOutletComponent = name;
  }

  markSenderMessagesAsDelivered() {
    this.hrs.request(
      "put",
      `message/updateChatroomsMsgStatusToDelivered`,
      {},
      (response: any) => {
        console.log("======updateChatroomsMsgStatusToDelivered", response);
      }
    );
  }
}
