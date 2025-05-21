import { createReducer, on } from "@ngrx/store";
import { ChatState, Chatroom } from "./chat.state";
import * as ChatroomAction from "./chat.actions";

export const initialState: ChatState = {
  chatrooms: [],
  allSentMessageCount: 0,
  error: null,
};

export const chatroomReducer = createReducer(
  initialState,
  on(ChatroomAction.setChatroomsSuccess, (state, { chatrooms }) => ({
    ...state,
    chatrooms: chatrooms,
    error: null,
  })),
  on(ChatroomAction.setChatroomsFailure, (state, { error }) => ({
    ...state,
    error,
  })),

  on(ChatroomAction.setSendingMessage, (state, { message }) => ({
    ...state,
    chatrooms: state.chatrooms
      .map((chatroom: Chatroom) => {
        if (chatroom._id === message.chatroomId) {
          return {
            ...chatroom,
            latestMessages: [message, ...chatroom.latestMessages],
          };
        }
        return chatroom;
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    error: null,
  })),

  on(
    ChatroomAction.sendingToSentMessage,
    (state, { chatroomId, elementId }) => ({
      ...state,
      chatrooms: state.chatrooms
        .map((chatroom: Chatroom) => {
          if (chatroom._id === chatroomId) {
            return {
              ...chatroom,
              updatedAt: chatroom.updatedAt,
              latestMessages: chatroom.latestMessages.map((latestMessage) => {
                if (latestMessage.elementId == elementId) {
                  return { ...latestMessage, status: "SENT" };
                }

                return latestMessage;
              }),
            };
          }
          return chatroom;
        })
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
      error: null,
    })
  ),

  on(
    ChatroomAction.setTotalCountSentDeliveredMessagesSuccess,
    (state, { totalCountSentDeliveredMessages }) => ({
      ...state,
      allSentMessageCount: totalCountSentDeliveredMessages,
      error: null,
    })
  ),
  on(
    ChatroomAction.setTotalCountSentDeliveredMessagesFailure,
    (state, { error }) => ({
      ...state,
      error,
    })
  ),

  on(ChatroomAction.plusOneToSentDeliveredCounter, (state, { message }) => ({
    ...state,
    chatrooms: state.chatrooms.map((chatroom: Chatroom) => {
      if (chatroom._id === message.chatroomId) {
        return {
          ...chatroom,
          sentMessageCount: chatroom.sentMessageCount + 1,
        };
      }
      return chatroom;
    }),
    allSentMessageCount: state.allSentMessageCount + 1,
    error: null,
  })),

  on(
    ChatroomAction.updateChatroomsMsgStatusToDelivered,
    (state, { updatedchatroomsMsg }) => ({
      ...state,
      chatrooms: state.chatrooms
        .map((chatroom: Chatroom) => {
          if (updatedchatroomsMsg.chatroomUpdated.chatroomId === chatroom._id) {
            return {
              ...chatroom,
              latestMessages: chatroom.latestMessages.map((latestMessage) => {
                if (latestMessage.status === "SENT") {
                  return {
                    ...latestMessage,
                    status: "DELIVERED",
                    updatedAt: new Date().toISOString(),
                  };
                }

                return latestMessage;
              }),
            };
          }
          return chatroom;
        })
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
      error: null,
    })
  ),

  on(ChatroomAction.checkChatroomExistsInStore, (state, { chatroom }) => {
    const exists = state.chatrooms.some((cr) => cr._id === chatroom._id);
    console.log("-------exists", exists);
    return {
      ...state,
      chatrooms: exists ? state.chatrooms : [chatroom, ...state.chatrooms],
      error: null,
    };
  }),

  on(
    ChatroomAction.updateChatroomsMsgStatusToSeen,
    (state, { updatedChatroom }) => ({
      ...state,
      allSentMessageCount:
        state.allSentMessageCount - updatedChatroom.modifiedCount || 0,
      chatrooms: state.chatrooms.map((chatroom: Chatroom) => {
        if (updatedChatroom.chatroomId === chatroom._id) {
          return {
            ...chatroom,
            latestMessages: chatroom.latestMessages.map((latestMessage) => {
              if (["SENT", "DELIVERED"].includes(latestMessage.status)) {
                return {
                  ...latestMessage,
                  status: "SEEN",
                  updatedAt: new Date().toISOString(),
                };
              }

              return latestMessage;
            }),
            sentMessageCount: 0,
          };
        }
        return chatroom;
      }),
      error: null,
    })
  ),

  on(
    ChatroomAction.setPastMessagesSuccess,
    (state, { chatroomId, messages }) => ({
      ...state,
      chatrooms: state.chatrooms.map((chatroom: Chatroom) => {
        console.log("setPastMessagesSuccess", messages);
        console.log("chatroomId", chatroomId);
        if (chatroom._id == chatroomId) {
          return {
            ...chatroom,
            latestMessages: [...messages, ...chatroom.latestMessages],
          };
        }
        return chatroom;
      }),
      error: null,
    })
  ),

  on(ChatroomAction.chatroomSort, (state, { message }) => ({
    ...state,
    chatrooms: state.chatrooms
      .map((chatroom: Chatroom) => {
        if (chatroom._id === message.chatroomId) {
          return {
            ...chatroom,
            updatedAt: message.updatedAt,
          };
        } else return chatroom;
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    error: null,
  })),

  on(ChatroomAction.setPastMessagesFailure, (state, { error }) => ({
    ...state,
    error,
  })),

  on(ChatroomAction.setPastChatroomsSuccess, (state, { chatrooms }) => ({
    ...state,
    chatrooms: [...state.chatrooms, ...chatrooms],
    error: null,
  })),
  on(ChatroomAction.setPastChatroomsFailure, (state, { error }) => ({
    ...state,
    error,
  }))
);
