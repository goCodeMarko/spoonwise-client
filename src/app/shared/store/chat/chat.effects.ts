import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { HttpClient } from "@angular/common/http";
import { catchError, map, mergeMap } from "rxjs/operators";
import { of } from "rxjs";
import { Chatroom, Message } from "./chat.state";
import * as ChatroomAction from "./chat.actions";
import { environment } from "../../../../environments/environment";

@Injectable()
export class ChatroomEffects {
  constructor(private actions$: Actions, private http: HttpClient) {}

  setPastChatrooms$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatroomAction.setPastChatrooms),
      mergeMap(({ lastChatroomDate }) =>
        this.http
          .get(
            `${environment.SERVER_URL_CLUSTERS}chatroom/getPastChatrooms?lastChatroomDate=${lastChatroomDate}`,
            {}
          )
          .pipe(
            map((data: any) => {
              console.log("===========getPastChatrooms", data);
              let chatrooms: Chatroom[] = data.data;
              return ChatroomAction.setPastChatroomsSuccess({
                chatrooms,
              });
            }),
            catchError((error: any) =>
              of(
                ChatroomAction.setPastChatroomsFailure({
                  error: error.message,
                })
              )
            )
          )
      )
    )
  );

  setPastMessages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatroomAction.setPastMessages),
      mergeMap(({ chatroomId, lastMessageDate }) =>
        this.http
          .get(
            `${environment.SERVER_URL_CLUSTERS}message/getPastMessages/${chatroomId}?lastMessageDate=${lastMessageDate}`
          )
          .pipe(
            map((data: any) => {
              console.log("======", data);

              let pastMessages: Message[] = data.data;

              return ChatroomAction.setPastMessagesSuccess({
                chatroomId,
                messages: pastMessages,
              });
            }),
            catchError((error: any) =>
              of(
                ChatroomAction.setPastMessagesFailure({
                  error: error.message,
                })
              )
            )
          )
      )
    )
  );

  setChatrooms$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatroomAction.setChatrooms),
      mergeMap(() =>
        this.http
          .get(`${environment.SERVER_URL_CLUSTERS}chatroom/getChatrooms`, {})
          .pipe(
            map((data: any) => {
              console.log("===========chatrooms", data);
              let chatrooms: Chatroom[] = data.data;
              return ChatroomAction.setChatroomsSuccess({
                chatrooms,
              });
            }),
            catchError((error: any) =>
              of(
                ChatroomAction.setChatroomsFailure({
                  error: error.message,
                })
              )
            )
          )
      )
    )
  );

  setTotalCountSentDeliveredMessages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatroomAction.setTotalCountSentDeliveredMessages),
      mergeMap(() =>
        this.http
          .get(
            `${environment.SERVER_URL_CLUSTERS}message/totalCountSentMessages`,
            {}
          )
          .pipe(
            map((data: any) => {
              console.log("===========chatrooms", data);
              let totalCountSentDeliveredMessages: number = data.data;
              return ChatroomAction.setTotalCountSentDeliveredMessagesSuccess({
                totalCountSentDeliveredMessages,
              });
            }),
            catchError((error: any) =>
              of(
                ChatroomAction.setTotalCountSentDeliveredMessagesFailure({
                  error: error.message,
                })
              )
            )
          )
      )
    )
  );

  sendMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatroomAction.sendMessage),
      mergeMap(({ message }) =>
        this.http
          .post(
            `${environment.SERVER_URL_MAIN}message/sendMessage/${message.chatroomId}`,
            { content: message.content, elementId: message.elementId }
          )
          .pipe(
            map((data: any) => {
              console.log("======", data);
              //   if (data.data.success) {
              let datax: Message = data.data;
              console.log("datax", datax);
              ChatroomAction.chatroomSort({
                message: datax,
              });
              return ChatroomAction.sendMessageSuccess({
                message: datax,
              });
              //   }
            }),
            catchError((error: any) =>
              of(
                ChatroomAction.sendMessageFailure({
                  error: error.message,
                })
              )
            )
          )
      )
    )
  );
}
