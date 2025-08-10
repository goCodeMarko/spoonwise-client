import { createReducer, on } from "@ngrx/store";
import { ChatState, Chatroom, Message } from "./chat.state";
import * as ChatroomAction from "./chat.actions";

export const initialState: ChatState = {
  chatrooms: [],
  spoonwiseAI: {
    _id: "",
    latestMessages: [],
    sentMessageCount: 0,
    createdAt: "",
    updatedAt: "",
  },
  allSentMessageCount: 0,
  error: null,
};

export const chatroomReducer = createReducer(
  initialState,
  on(
    ChatroomAction.setChatroomsSuccess,
    (state, { chatrooms, spoonwiseAI }) => ({
      ...state,
      chatrooms: chatrooms,
      spoonwiseAI: spoonwiseAI,
      error: null,
    })
  ),
  on(ChatroomAction.setChatroomsFailure, (state, { error }) => ({
    ...state,
    error,
  })),

  on(
    ChatroomAction.setSendingMessage,
    (state, { message, isSpoonwiseAI = false }) => {
      console.log("-----------setSendingMessage", isSpoonwiseAI);
      console.log("-----------message", message);
      if (!isSpoonwiseAI) {
        return {
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
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime()
            ),
          error: null,
        };
      } else {
        return {
          ...state,
          spoonwiseAI: {
            ...state.spoonwiseAI,
            latestMessages: [message, ...state.spoonwiseAI.latestMessages],
          },
          error: null,
        };
      }
    }
  ),
  on(
    ChatroomAction.sendingToSentMessage,
    (state, { chatroomId, elementId, isSpoonwiseAI }) => {
      console.log("------1chatroomId", chatroomId);
      console.log("------1elementId", elementId);
      if (!isSpoonwiseAI) {
        return {
          ...state,
          chatrooms: state.chatrooms
            .map((chatroom: Chatroom) => {
              if (chatroom._id === chatroomId) {
                return {
                  ...chatroom,
                  updatedAt: chatroom.updatedAt,
                  latestMessages: chatroom.latestMessages.map(
                    (latestMessage) => {
                      if (latestMessage.elementId == elementId) {
                        return { ...latestMessage, status: "SENT" };
                      }

                      return latestMessage;
                    }
                  ),
                };
              }
              return chatroom;
            })
            .sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime()
            ),
          error: null,
        };
      } else {
        console.log("------2");
        return {
          ...state,
          spoonwiseAI: {
            ...state.spoonwiseAI,
            latestMessages: state.spoonwiseAI.latestMessages.map(
              (latestMessage) => {
                if (latestMessage.elementId == elementId) {
                  return { ...latestMessage, status: "SENT" };
                }

                return latestMessage;
              }
            ),
          },
          error: null,
        };
      }
    }
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

  on(
    ChatroomAction.plusOneToSentDeliveredCounter,
    (state, { message, isSpoonwiseAI = false }) => {
      if (!isSpoonwiseAI) {
        return {
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
        };
      } else {
        return {
          ...state,
          spoonwiseAI: {
            ...state.spoonwiseAI,
            sentMessageCount: state.spoonwiseAI.sentMessageCount + 1,
          },
          allSentMessageCount: state.allSentMessageCount + 1,
          error: null,
        };
      }
    }
  ),

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
    console.log("--------chatrooms", chatroom);
    const exists = state.chatrooms.some((cr) => cr._id === chatroom._id);

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
      spoonwiseAI: {
        ...state.spoonwiseAI,
        latestMessages: state.spoonwiseAI.latestMessages.map(
          (latestMessage) => {
            if (["SENT", "DELIVERED"].includes(latestMessage.status)) {
              return {
                ...latestMessage,
                status: "SEEN",
                updatedAt: new Date().toISOString(),
              };
            }

            return latestMessage;
          }
        ),
        sentMessageCount: 0,
      },
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
  })),

  on(ChatroomAction.setLanguageSuccess, (state, { language, chatroomId }) => ({
    ...state,
    spoonwiseAI: {
      ...state.spoonwiseAI,
      settings: {
        ...state.spoonwiseAI.settings,
        language: language,
      },
    },
    error: null,
  })),

  on(
    ChatroomAction.chunksReceivedFromAI,
    (state, { chunks, tempMessageId }) => {
      const exists = state.spoonwiseAI.latestMessages.find(
        (msg) => msg.elementId === tempMessageId
      );

      if (exists) {
        console.log("-111");
        return {
          ...state,
          spoonwiseAI: {
            ...state.spoonwiseAI,
            latestMessages: state.spoonwiseAI.latestMessages.map((msg) => {
              if (msg.elementId === tempMessageId) {
                return {
                  ...msg,
                  content: {
                    ...msg.content,
                    message: msg.content.message + chunks,
                  },
                };
              } else {
                return msg;
              }
            }),
          },
          error: null,
        };
      } else {
        console.log("-222");
        const newMessage: Message = {
          isAIAgent: true,
          elementId: tempMessageId,
          content: { message: chunks },
          status: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return {
          ...state,
          spoonwiseAI: {
            ...state.spoonwiseAI,
            sentMessageCount: state.spoonwiseAI.sentMessageCount + 1,
            latestMessages: [newMessage, ...state.spoonwiseAI.latestMessages],
          },
          allSentMessageCount: state.allSentMessageCount + 1,
          error: null,
        };
      }
    }
  ),

  on(ChatroomAction.chatSellerSuccess, (state, { chatroom }) => {
    const isChatroomExists = state.chatrooms.find(
      (data) => data._id === chatroom._id
    );

    if (!isChatroomExists) {
      return {
        ...state,
        chatrooms: [...state.chatrooms, chatroom].sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
        error: null,
      };
    } else {
      return { ...state };
    }
  }),

  on(
    ChatroomAction.updateTemporaryMessage,
    (state, { message, tempMessageId }) => {
      console.log("Message", message);
      const exists = state.spoonwiseAI.latestMessages.find(
        (msg) => msg.elementId === tempMessageId
      );

      if (exists) {
        return { ...state };
        // return {
        //   ...state,
        //   spoonwiseAI: {
        //     ...state.spoonwiseAI,
        //     latestMessages: state.spoonwiseAI.latestMessages.map((msg) => {
        //       if (msg.elementId === tempMessageId) {
        //         return {
        //           ...msg,
        //           content: {
        //             ...msg.content,
        //             message: msg.content.message + chunks,
        //           },
        //         };
        //       } else {
        //         return msg;
        //       }
        //     }),
        //   },
        //   error: null,
        // };
      } else {
        return { ...state };
      }
    }
  )
);
