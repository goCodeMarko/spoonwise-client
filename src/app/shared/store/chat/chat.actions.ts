import { createAction, props } from "@ngrx/store";
import {
  Chatroom,
  IUpdateChatroomsMsgStatusToDelivered,
  IUpdateChatroomsMsgStatusToSeen,
  Message,
} from "./chat.state";

export const setChatrooms = createAction("[Chatroom] Set Chatroom");

export const setChatroomsSuccess = createAction(
  "[Chatroom] Set Chatroom Success",
  props<{ chatrooms: Chatroom[] }>()
);

export const setChatroomsFailure = createAction(
  "[Chatroom] Set Chatroom Failure",
  props<{ error: string }>()
);

export const setTotalCountSentDeliveredMessages = createAction(
  "[setTotalCountSentDeliveredMessages] Set Total Count Sent/Delivered Messages"
);

export const setTotalCountSentDeliveredMessagesSuccess = createAction(
  "[setTotalCountSentDeliveredMessages] Set Total Count Sent/Delivered Messages Success",
  props<{ totalCountSentDeliveredMessages: number }>()
);

export const setTotalCountSentDeliveredMessagesFailure = createAction(
  "[setTotalCountSentDeliveredMessages] Set Total Count Sent/Delivered Messages Failure",
  props<{ error: string }>()
);

export const setSendingMessage = createAction(
  "[SendingMessage] Sending Message",
  props<{
    message: {
      elementId: string;
      chatroomId: string;
      senderId: string;
      content: {
        message: string;
        orderId?: string;
        productId?: string;
      };
      status: string;
      createdAt: string;
    };
  }>()
);

export const sendingToSentMessage = createAction(
  "[sendingToSentMessage] Sending to Sent Message",
  props<{
    chatroomId: string;
    elementId: string;
  }>()
);

export const plusOneToSentDeliveredCounter = createAction(
  "[plusOneToSentDeliveredCounter] Plus One to Sent/Receive Counter",
  props<{ message: Message }>()
);

export const updateChatroomsMsgStatusToDelivered = createAction(
  "[onUpdateChatroomsMsgStatusToDelivered] Update Chatrooms Message Status",
  props<{ updatedchatroomsMsg: IUpdateChatroomsMsgStatusToDelivered }>()
);

export const updateChatroomsMsgStatusToSeen = createAction(
  "[onUpdateChatroomsMsgStatusToSeen] Update Chatrooms Message Status",
  props<{ updatedChatroom: IUpdateChatroomsMsgStatusToSeen }>()
);

export const sendMessage = createAction(
  "[sendMessage] Send Message",
  props<{
    message: {
      elementId: string;
      chatroomId: string;
      senderId: string;
      content: {
        message: string;
        orderId?: string;
        productId?: string;
      };
    };
  }>()
);

export const sendMessageSuccess = createAction(
  "[sendMessage] Send Message Success",
  props<{ message: Message }>()
);

export const sendMessageFailure = createAction(
  "[sendMessage] Send Message Failure",
  props<{ error: string }>()
);
