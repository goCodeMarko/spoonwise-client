import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { HttpClient } from "@angular/common/http";
import { catchError, exhaustMap, map, mergeMap } from "rxjs/operators";
import { from, of } from "rxjs";
import { Chatroom, Message, SpoonwiseAI } from "./chat.state";
import * as ChatroomAction from "./chat.actions";
import { environment } from "../../../../environments/environment";
import { base64ToBlob, blobToBase64 } from "base64-blob";
import { Router } from "@angular/router";
@Injectable()
export class ChatroomEffects {
  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private router: Router
  ) {}

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
      exhaustMap(({ chatroomId, lastMessageDate }) =>
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
              let chatrooms: Chatroom[] = data.data.chatrooms;
              let spoonwiseAI: SpoonwiseAI = data.data.spoonwiseAI;
              return ChatroomAction.setChatroomsSuccess({
                chatrooms,
                spoonwiseAI,
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
      mergeMap(({ message, forUploadImage }) => {
        let body: any = {
          content: message.content,
          elementId: message.elementId,
        };

        if (forUploadImage) {
          return from(base64ToBlob(forUploadImage)).pipe(
            mergeMap((blob) => {
              const mime = blob.type || "image/png";
              const ext = mime.split("/")[1] || "png";
              const file = new File([blob], `image_123.${ext}`, { type: mime });

              const formData = new FormData();
              formData.append("details", JSON.stringify(body));
              formData.append("image", file);

              return this.http
                .post(
                  `${environment.SERVER_URL_MAIN}message/sendMessage/${message.chatroomId}`,
                  formData
                )
                .pipe(
                  map((data: any) => {
                    let datax: Message = data.data;
                    const isAIAgent: boolean = datax.isAIAgent ?? false;

                    if (!isAIAgent) {
                      ChatroomAction.chatroomSort({
                        message: datax,
                      });
                    }

                    return ChatroomAction.sendMessageSuccess({
                      message: datax,
                      isSpoonwiseAI: isAIAgent,
                    });
                  }),
                  catchError((error: any) =>
                    of(
                      ChatroomAction.sendMessageFailure({
                        error: error.message,
                      })
                    )
                  )
                );
            })
          );
        }

        return this.http
          .post(
            `${environment.SERVER_URL_MAIN}message/sendMessage/${message.chatroomId}`,
            body
          )
          .pipe(
            map((data: any) => {
              let datax: Message = data.data;
              const isAIAgent: boolean = datax.isAIAgent ?? false;

              if (!isAIAgent) {
                ChatroomAction.chatroomSort({
                  message: datax,
                });
              }

              return ChatroomAction.sendMessageSuccess({
                message: datax,
                isSpoonwiseAI: isAIAgent,
              });
            }),
            catchError((error: any) =>
              of(
                ChatroomAction.sendMessageFailure({
                  error: error.message,
                })
              )
            )
          );
      })
    )
  );

  setLanguage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatroomAction.setLanguage),
      mergeMap(({ language, chatroomId }) => {
        return this.http
          .put(
            `${environment.SERVER_URL_MAIN}chatroom/updateLanguage/${chatroomId}`,
            {
              language,
            }
          )
          .pipe(
            map((data: any) => {
              let datax = data.data;

              console.log("--------sendMessage", datax);

              return ChatroomAction.setLanguageSuccess({
                language,
                chatroomId,
              });
            }),
            catchError((error: any) =>
              of(
                ChatroomAction.setLanguageFailure({
                  error: error.message,
                })
              )
            )
          );
      })
    )
  );

  chatSeller$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatroomAction.chatSeller),
      mergeMap(({ shopId }) =>
        this.http
          .get(
            `${environment.SERVER_URL_CLUSTERS}chatroom/chatSeller?shopId=${shopId}`,
            {}
          )
          .pipe(
            map((data: any) => {
              console.log("===========chatrooms", data);
              let chatroom: Chatroom = data.data;

              this.router.navigate([`/chats/${chatroom._id}`], {
                queryParams: { isSpoonwiseAI: false },
              });

              return ChatroomAction.chatSellerSuccess({
                chatroom,
              });
            }),
            catchError((error: any) =>
              of(
                ChatroomAction.chatSellerFailure({
                  error: error.message,
                })
              )
            )
          )
      )
    )
  );
}
