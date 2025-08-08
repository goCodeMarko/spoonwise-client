import { createAction, props } from "@ngrx/store";
import {
  Chatroom,
  IUpdateChatroomsMsgStatusToDelivered,
  IUpdateChatroomsMsgStatusToSeen,
  Language,
  Message,
  SpoonwiseAI,
} from "./chat.state";

export const setPastMessages = createAction(
  "[Chatroom] Set Past Messages",
  props<{
    chatroomId: string;
    lastMessageDate: string;
  }>()
);

export const setPastMessagesSuccess = createAction(
  "[Chatroom] Set Past Messages Success",
  props<{ chatroomId: string; messages: Message[] }>()
);

export const setPastMessagesFailure = createAction(
  "[Chatroom] Set Past Messages Failure",
  props<{ error: string }>()
);

export const setPastChatrooms = createAction(
  "[Chatroom] Set Past Chatrooms",
  props<{
    lastChatroomDate: string;
  }>()
);

export const setPastChatroomsSuccess = createAction(
  "[Chatroom] Set Past Chatrooms Success",
  props<{ chatrooms: Chatroom[] }>()
);

export const setPastChatroomsFailure = createAction(
  "[Chatroom] Set Past Chatrooms Failure",
  props<{ error: string }>()
);

export const setChatrooms = createAction("[Chatroom] Set Chatroom");

export const setChatroomsSuccess = createAction(
  "[Chatroom] Set Chatroom Success",
  props<{ chatrooms: Chatroom[]; spoonwiseAI: SpoonwiseAI }>()
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
    message: Message;
    isSpoonwiseAI?: boolean;
    forUploadImage?: string;
  }>()
);

export const sendingToSentMessage = createAction(
  "[sendingToSentMessage] Sending to Sent Message",
  props<{
    chatroomId: string;
    elementId: string;
    isSpoonwiseAI: boolean;
  }>()
);

export const plusOneToSentDeliveredCounter = createAction(
  "[plusOneToSentDeliveredCounter] Plus One to Sent/Receive Counter",
  props<{ message: Message; isSpoonwiseAI?: boolean }>()
);

export const updateChatroomsMsgStatusToDelivered = createAction(
  "[onUpdateChatroomsMsgStatusToDelivered] Update Chatrooms Message Status",
  props<{ updatedchatroomsMsg: IUpdateChatroomsMsgStatusToDelivered }>()
);

export const checkChatroomExistsInStore = createAction(
  "[checkChatroomExistsInStore] Check Chatroom Exists in Store",
  props<{ chatroom: Chatroom }>()
);

export const updateChatroomsMsgStatusToSeen = createAction(
  "[onUpdateChatroomsMsgStatusToSeen] Update Chatrooms Message Status",
  props<{ updatedChatroom: IUpdateChatroomsMsgStatusToSeen }>()
);

export const sendMessage = createAction(
  "[sendMessage] Send Message",
  props<{
    message: Message;
    forUploadImage?: string;
  }>()
);

export const sendMessageSuccess = createAction(
  "[sendMessage] Send Message Success",
  props<{ message: Message; isSpoonwiseAI?: boolean }>()
);

export const chatroomSort = createAction(
  "[sendMessage] Send Message Success",
  props<{ message: Message }>()
);

export const sendMessageFailure = createAction(
  "[sendMessage] Send Message Failure",
  props<{ error: string }>()
);

export const setLanguage = createAction(
  "[Language] Set Language",
  props<{ language: Language; chatroomId: string }>()
);

export const setLanguageSuccess = createAction(
  "[Language] Set Language Success",
  props<{ language: Language; chatroomId: string }>()
);

export const setLanguageFailure = createAction(
  "[Chatroom] Set Chatroom Failure",
  props<{ error: string }>()
);

export const chunksReceivedFromAI = createAction(
  "[Chatroom] Set Chatroom Failure",
  props<{ chunks: any; tempMessageId: string }>()
);

export const updateTemporaryMessage = createAction(
  "[Chatroom] Set Chatroom Failure",
  props<{ message: Message; tempMessageId: string }>()
);
