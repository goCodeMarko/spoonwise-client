import { createReducer, on } from "@ngrx/store";
import { IBlogState, IBlog } from "./blog.state";
import * as BlogAction from "./blog.actions";

export const initialState: IBlogState = {
  blogs: [],
  savedBlogs: [],
  error: null,
};

export const blogReducer = createReducer(
  initialState,
  on(BlogAction.setNewBlogSuccess, (state, blog) => ({
    blogs: [...state.blogs, blog],
    savedBlogs: [...state.savedBlogs],
    error: null,
  })),
  on(BlogAction.updateBlogSuccess, (state, { blogId, blog }) => ({
    blogs: state.blogs.map((stateBlog) =>
      stateBlog._id === blogId ? { ...stateBlog, ...blog } : stateBlog
    ),
    savedBlogs: [...state.savedBlogs],
    error: null,
  })),
  on(BlogAction.getBlogsSuccess, (state, { blogs }) => ({
    blogs: [...blogs].map((blog) => {
      console.log("blog", blog);
      console.log("state.savedBlogs", state.savedBlogs);
      if (state.savedBlogs.some((saved) => saved._id === blog._id))
        return { ...blog, isSaved: true };
      else return blog;
    }),
    savedBlogs: [...state.savedBlogs],
    error: null,
  })),
  on(BlogAction.getPastBlogsSuccess, (state, { blogs }) => ({
    blogs: [
      ...state.blogs,
      ...blogs.map((blog) => {
        if (state.savedBlogs.some((saved) => saved._id === blog._id))
          return { ...blog, isSaved: true };
        else return blog;
      }),
    ],
    savedBlogs: [...state.savedBlogs],
    error: null,
  })),
  on(BlogAction.getSavedBlogsSuccess, (state, { blogs }) => ({
    blogs: [...state.blogs],
    savedBlogs: [...blogs],
    error: null,
  })),

  on(BlogAction.saveBlogSuccess, (state, { blog, data }) => ({
    blogs: [...state.blogs].map((blogx) => {
      if (blogx._id === blog._id) return { ...blogx, isSaved: true };
      else return blogx;
    }),
    savedBlogs: [...state.savedBlogs, blog],
    error: null,
  })),

  on(BlogAction.unsaveBlogSuccess, (state, { id, data }) => ({
    blogs: [...state.blogs].map((blog) => {
      if (blog._id === id) return { ...blog, isSaved: false };
      else return blog;
    }),
    savedBlogs: [...state.savedBlogs].filter((blog) => {
      if (blog._id !== id) return blog;
    }),
    error: null,
  }))
);
