import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { selectChatrooms } from "../../store/chat/chat.selectors";
import { Chatroom } from "../../store/chat/chat.state";
import {
  sendMessageSuccess,
  setChatrooms,
  setTotalCountSentDeliveredMessages,
} from "../../store/chat/chat.actions";
import { ActivatedRoute, Router } from "@angular/router";
import { Actions, ofType } from "@ngrx/effects";
import { AuthService, IUserData } from "src/app/authorization/auth.service";

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
}
