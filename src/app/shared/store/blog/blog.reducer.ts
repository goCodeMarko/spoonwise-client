import { createReducer, on } from "@ngrx/store";
import { IBlogState, IBlog } from "./blog.state";
import * as BlogAction from "./blog.actions";

export const initialState: IBlogState = {
  blogs: [],
  error: null,
};

export const blogReducer = createReducer(
  initialState,
  on(BlogAction.setNewBlogSuccess, (state, blog) => ({
    blogs: [...state.blogs, blog],
    error: null,
  })),
  on(BlogAction.updateBlogSuccess, (state, { blogId, blog }) => ({
    blogs: state.blogs.map((stateBlog) =>
      stateBlog._id === blogId ? { ...stateBlog, ...blog } : stateBlog
    ),
    error: null,
  })),
  on(BlogAction.getBlogsSuccess, (state, { blogs }) => ({
    blogs: [...blogs],
    error: null,
  })),
  on(BlogAction.getPastBlogsSuccess, (state, { blogs }) => ({
    blogs: [...state.blogs, ...blogs],
    error: null,
  }))
);
