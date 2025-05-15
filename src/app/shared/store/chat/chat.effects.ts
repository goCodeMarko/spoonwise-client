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
            `${environment.SERVER_URL_CLUSTERS}message/sendMessage/${message.chatroomId}`,
            { content: message.content, elementId: message.elementId }
          )
          .pipe(
            map((data: any) => {
              console.log("======", data);
              //   if (data.data.success) {
              let datax: Message = data.data;

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
