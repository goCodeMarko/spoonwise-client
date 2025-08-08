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
