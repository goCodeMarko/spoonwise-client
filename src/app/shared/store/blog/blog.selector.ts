import { createSelector, createFeatureSelector } from "@ngrx/store";
import { IBlogState } from "./blog.state";
import * as _ from "lodash";
export const selectBlogState = createFeatureSelector<IBlogState>("blog");

export const selectBlogs = createSelector(selectBlogState, (state) => {
  const blogs = state.blogs;
  return blogs;
});

export const selectBlog = (blogId: string) =>
  createSelector(selectBlogState, (state) => {
    const blog = state.blogs.find((blog) => blog._id === blogId);
    return blog;
  });

export const selectSavedBlogs = createSelector(selectBlogState, (state) => {
  const savedBlogs = state.savedBlogs
    .map((blog) => {
      return { ...blog, isSaved: true };
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  return savedBlogs;
});
