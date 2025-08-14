import { Component, OnDestroy, OnInit } from "@angular/core";
import { AuthService } from "../authorization/auth.service";
import { finalize, Observable, Subscription } from "rxjs";
import { SocketService } from "../shared/socket/socket.service";
import { Store } from "@ngrx/store";
import { setToPay } from "../shared/store/order/order.actions";
import {
  chatroomSort,
  checkChatroomExistsInStore,
  chunksReceivedFromAI,
  plusOneToSentDeliveredCounter,
  setChatrooms,
  setSendingMessage,
  setTotalCountSentDeliveredMessages,
  updateChatroomsMsgStatusToDelivered,
  updateChatroomsMsgStatusToSeen,
} from "../shared/store/chat/chat.actions";
import { HttpRequestService } from "../http-request/http-request.service";
import _ from "lodash";

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
  onReceivedChunksFromAI: Subscription;
  isMapLoading: boolean = true;
  buyers: any[] = [];

  constructor(
    private socket: SocketService,
    private store: Store,
    private hrs: HttpRequestService
  ) {
    this.socket.connect();

    this.onNewChatMessage = this.socket
      .onNewChatMessage()
      .subscribe((data: any) => {
        console.log("Seller Delivered a message", data);
        this.markSenderMessagesAsDelivered();
        this.store.dispatch(
          checkChatroomExistsInStore({ chatroom: data.chatroom })
        );
        this.store.dispatch(chatroomSort({ message: data.message }));
        this.store.dispatch(setSendingMessage({ message: data.message }));
        this.store.dispatch(
          plusOneToSentDeliveredCounter({ message: data.message })
        );

        if (!data.isAIAgent) {
          this.store.dispatch(
            checkChatroomExistsInStore({ chatroom: data.chatroom })
          );
          this.store.dispatch(chatroomSort({ message: data.message }));
        }
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

    this.onReceivedChunksFromAI = this.socket
      .onReceivedChunksFromAI()
      .subscribe((data) => {
        this.store.dispatch(
          chunksReceivedFromAI({
            chunks: data.chunks,
            tempMessageId: data.temporaryMessageId,
          })
        );
      });
  }

  ngOnInit(): void {
    this.getBuyers();
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

  getBuyers() {
    console.log("-------------------x");
    this.hrs
      .request("getV2", "user/getBuyers", {})
      .pipe(finalize(() => (this.isMapLoading = false)))
      .subscribe((res: any) => {
        console.log("----", res);
        this.buyers = res.data;
      });
  }

  markSenderMessagesAsDelivered() {
    this.hrs.request(
      "put",
      `message/updateChatroomsMsgStatusToDelivered`,
      {},
      (response: any) => {}
    );
  }
}
