import {
  Component,
  OnDestroy,
  OnInit,
  NgZone,
  ElementRef,
  ViewChild,
} from "@angular/core";
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
  setPastMessages,
  setPastMessagesSuccess,
  setSendingMessage,
  setTotalCountSentDeliveredMessages,
  updateChatroomsMsgStatusToSeen,
} from "../../store/chat/chat.actions";
import { random, size } from "lodash";
import { ObjectId } from "bson";
import { Actions, ofType } from "@ngrx/effects";
import { sendMessageSuccess } from "../../../shared/store/chat/chat.actions";
import { HttpRequestService } from "src/app/http-request/http-request.service";
import { SocketService } from "../../socket/socket.service";
import { take } from "rxjs/operators";

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
  @ViewChild("chatContainer", { static: false }) chatContainer!: ElementRef;

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private auth: AuthService,
    private actions$: Actions,
    private hrs: HttpRequestService,
    private socket: SocketService,
    private ngZone: NgZone
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

    this.actions$
      .pipe(ofType(setPastMessagesSuccess), takeUntil(this.destroy$))
      .subscribe(({ chatroomId, messages }) => {
        if (size(messages) === 0) this.allMessageHasBeenDisplayed = true;
        this.onLoad = false;
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

  allMessageHasBeenDisplayed = false;
  onLoad = false;
  onScroll(): void {
    const container = this.chatContainer.nativeElement as HTMLElement;
    const isAtTop =
      Math.abs(container.scrollTop) + container.clientHeight ===
      container.scrollHeight;

    if (isAtTop && !this.onLoad && !this.allMessageHasBeenDisplayed) {
      console.log("chatroomMessages", this.chatroomMessages);
      this.onLoad = true;

      this.store.dispatch(
        setPastMessages({
          chatroomId: this.chatroomId,
          lastMessageDate:
            this.chatroomMessages[this.chatroomMessages.length - 1].createdAt,
        })
      );
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
