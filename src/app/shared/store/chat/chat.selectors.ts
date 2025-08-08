import { createSelector, createFeatureSelector } from "@ngrx/store";
import { ChatState } from "./chat.state";
import * as _ from "lodash";
export const selectChatState = createFeatureSelector<ChatState>("chat");

export const selectChatrooms = createSelector(selectChatState, (state) => {
  const chatroomsWithSortedLatestMessages = state.chatrooms
    .map((chatroom) => {
      return {
        ...chatroom,
        latestMessages: [...chatroom.latestMessages].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
      };
    })
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  return chatroomsWithSortedLatestMessages;
});

export const selectSpoonwiseAI = createSelector(selectChatState, (state) => {
  const spoonwiseAI = state.spoonwiseAI;

  return spoonwiseAI;
});

export const selectAllSentMessageCount = createSelector(
  selectChatState,
  (state) => state.allSentMessageCount
);

export const selectSortedChatroomMessages = (
  chatroomId: string,
  isSpoonwiseAI = false
) =>
  createSelector(selectChatState, (state) => {
    if (!isSpoonwiseAI) {
      const chatroom = state.chatrooms.find((c) => c._id === chatroomId);

      if (!chatroom) return [];
      return [...chatroom.latestMessages].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else {
      const spoonwiseAI = state.spoonwiseAI;
      if (!spoonwiseAI) return [];
      return [...spoonwiseAI.latestMessages].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  });
