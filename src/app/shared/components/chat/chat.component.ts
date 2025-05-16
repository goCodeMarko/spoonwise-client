import { Component, OnDestroy, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { selectSortedChatroomMessages } from "../../store/chat/chat.selectors";
import { Message } from "../../store/chat/chat.state";
import { Observable, Subject, Subscription } from "rxjs";
import { ActivatedRoute, Route, Router } from "@angular/router";
import { takeUntil } from "rxjs/operators";
import { AuthService, IUserData } from "src/app/authorization/auth.service";
import {
  sendingToSentMessage,
  sendMessage,
  sendMessageFailure,
  setSendingMessage,
  setTotalCountSentDeliveredMessages,
  updateChatroomsMsgStatusToSeen,
} from "../../store/chat/chat.actions";
import { random } from "lodash";
import { ObjectId } from "bson";
import { Actions, ofType } from "@ngrx/effects";
import { sendMessageSuccess } from "../../../shared/store/chat/chat.actions";
import { HttpRequestService } from "src/app/http-request/http-request.service";
import { SocketService } from "../../socket/socket.service";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"],
})
export class ChatComponent implements OnInit, OnDestroy {
  chatroomMessages$: Observable<Message[] | []>;
  chatroomMessages: Message[] | [] = [];
  chatroomId: string;
  authUser!: IUserData;
  private destroy$ = new Subject<void>();
  text = "";
  onNewChatMessage: Subscription;

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private auth: AuthService,
    private actions$: Actions,
    private hrs: HttpRequestService,
    private socket: SocketService
  ) {
    this.chatroomId = this.route.snapshot.paramMap.get("id")!;
    this.auth.getUserData$().subscribe((user) => {
      this.authUser = user;
      console.log(this.authUser);
    });
    this.chatroomMessages$ = this.store
      .select(selectSortedChatroomMessages(this.chatroomId))
      .pipe(takeUntil(this.destroy$));
    this.chatroomMessages$.subscribe((data) => {
      console.log("=====================messages", data);
      this.chatroomMessages = data;
    });

    this.onNewChatMessage = this.socket
      .onNewChatMessage()
      .subscribe((message: any) => {
        this.markSenderMessagesAsSeen();
      });
  }

  ngOnInit(): void {
    this.actions$
      .pipe(ofType(sendMessageSuccess), takeUntil(this.destroy$))
      .subscribe(({ message }) => {
        this.store.dispatch(
          sendingToSentMessage({
            chatroomId: message.chatroomId,
            elementId: message.elementId,
          })
        );
      });

    this.markSenderMessagesAsSeen();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.onNewChatMessage.unsubscribe();
  }

  trackByMessageId(index: number, message: any): string {
    return message._id;
  }

  private onLoad = false;
  onScroll(container: HTMLElement): void {
    const currentPosition = container.scrollHeight + container.scrollTop - 33; // 0 - most top
    const threshold = 20; // when user is in scroll position

    console.log("scrollHeight", container.scrollHeight);
    console.log("scrollTop", container.scrollTop);
    console.log("x", container.scrollHeight + container.scrollTop);
    console.log("currentPosition", currentPosition);
    if (currentPosition <= threshold && !this.onLoad) {
      this.onLoad = true;
      console.log("User reached the top (visually, for column-reverse)");
    }
  }

  sendMessage() {
    const { role } = this.authUser;
    const elementId = new ObjectId().toHexString();
    const senderId = role === "seller" ? this.authUser.shop : this.authUser._id;

    if (!senderId) {
      console.error("Sender ID is undefined!");
      return;
    }

    const message = {
      elementId,
      chatroomId: this.chatroomId,
      senderId,
      content: {
        message: this.text,
      },
      status: "SENDING",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.store.dispatch(setSendingMessage({ message }));
    this.store.dispatch(sendMessage({ message }));
    console.log("sending message", message);
  }

  markSenderMessagesAsSeen() {
    this.hrs.request(
      "put",
      `message/updateChatroomsMsgStatusToSeen/${this.chatroomId}`,
      {},
      (response: any) => {
        console.log("======response", response);
        if (response.success) {
          this.store.dispatch(
            updateChatroomsMsgStatusToSeen({ updatedChatroom: response.data })
          );
        }
      }
    );
  }
}
