import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { selectChatrooms } from "../../store/chat/chat.selectors";
import { Chatroom } from "../../store/chat/chat.state";
import {
  sendMessageSuccess,
  setChatrooms,
  setPastChatrooms,
  setPastChatroomsSuccess,
  setTotalCountSentDeliveredMessages,
} from "../../store/chat/chat.actions";
import { ActivatedRoute, Router } from "@angular/router";
import { Actions, ofType } from "@ngrx/effects";
import { AuthService, IUserData } from "src/app/authorization/auth.service";
import { size } from "lodash";

@Component({
  selector: "app-chat-list",
  templateUrl: "./chat-list.component.html",
  styleUrls: ["./chat-list.component.scss"],
})
export class ChatListComponent implements OnInit, OnDestroy {
  chatrooms!: Chatroom[];
  chatrooms$!: Observable<Chatroom[]>;
  @Input()
  isShop = false;
  private destroy$ = new Subject<void>();
  authUser!: IUserData;
  @ViewChild("chatListContainer", { static: false })
  chatListContainer!: ElementRef;

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
    private actions$: Actions,
    private auth: AuthService
  ) {
    this.chatrooms$ = this.store
      .select(selectChatrooms)
      .pipe(takeUntil(this.destroy$));
  }

  ngOnInit(): void {
    // this.store.dispatch(setChatrooms());

    this.chatrooms$.subscribe((data) => {
      console.log("-------data", data);
      this.chatrooms = data;
    });

    this.actions$
      .pipe(ofType(sendMessageSuccess), takeUntil(this.destroy$))
      .subscribe(({ message }) => {
        console.log("**********", message);
      });

    this.auth.getUserData$().subscribe((user) => {
      this.authUser = user;
      console.log(this.authUser);
    });

    this.actions$
      .pipe(ofType(setPastChatroomsSuccess), takeUntil(this.destroy$))
      .subscribe(({ chatrooms }) => {
        if (size(chatrooms) === 0) this.allChatsHasBeenDisplayed = true;
        this.onLoad = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByChatroomId(index: number, chatroom: any): string {
    return chatroom._id;
  }

  viewChatroom(chatroomId: string) {
    this.router.navigate([this.isShop ? "/shop/chats" : "/chats", chatroomId], {
      queryParams: {},
    });
  }

  allChatsHasBeenDisplayed = false;
  onLoad = false;
  onScroll(): void {
    const container = this.chatListContainer.nativeElement as HTMLElement;
    const isAtTop =
      Math.abs(container.scrollTop) + container.clientHeight ===
      container.scrollHeight;

    if (isAtTop && !this.onLoad && !this.allChatsHasBeenDisplayed) {
      this.onLoad = true;

      console.log(
        "this.chatrooms[this.chatrooms.length - 1].updatedAt",
        this.chatrooms[this.chatrooms.length - 1].updatedAt
      );

      this.store.dispatch(
        setPastChatrooms({
          lastChatroomDate: this.chatrooms[this.chatrooms.length - 1].updatedAt,
        })
      );
    }
  }
}
