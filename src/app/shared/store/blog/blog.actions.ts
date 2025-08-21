import { createAction, props } from "@ngrx/store";
import { IBlog } from "./blog.state";

export const setNewBlog = createAction("[Blog] Set New Blog", props<IBlog>());

export const setNewBlogSuccess = createAction(
  "[Blog] Set New Blog Success",
  props<IBlog>()
);

export const setNewBlogFailure = createAction(
  "[Blog] Set New Blog Failure",
  props<{ error: string }>()
);

export const updateBlog = createAction(
  "[Blog] Update Blog",
  props<{ blogId: string; blog: Partial<IBlog> }>()
);

export const updateBlogSuccess = createAction(
  "[Blog] Update Blog Success",
  props<{ blogId: string; blog: Partial<IBlog> }>()
);

export const updateBlogFailure = createAction(
  "[Blog] Update Blog Failure",
  props<{ error: string }>()
);

export const getBlogs = createAction("[Blog] Get Blogs");

export const getBlogsSuccess = createAction(
  "[Blog] Get Blogs Success",
  props<{ blogs: IBlog[] }>()
);

export const getBlogsFailure = createAction(
  "[Blog] Get Blogs Failure",
  props<{ error: string }>()
);

export const getPastBlogs = createAction(
  "[Blog] Get Past Blogs",
  props<{ lastBlogDate: string }>()
);

export const getPastBlogsSuccess = createAction(
  "[Blog] Get Past Blogs Success",
  props<{ blogs: IBlog[] }>()
);

export const getPastBlogsFailure = createAction(
  "[Blog] Get Past Blogs Failure",
  props<{ error: string }>()
);

export const unsaveBlog = createAction(
  "[Blog] Saved Blog",
  props<{ id: string }>()
);

export const unsaveBlogSuccess = createAction(
  "unsaveBlogSuccess",
  props<{ id: string; data: any }>()
);

export const unsaveBlogFailure = createAction(
  "unsaveBlogFailure",
  props<{ error: string }>()
);

export const saveBlog = createAction("saveBlog", props<{ blog: IBlog }>());

export const saveBlogSuccess = createAction(
  "saveBlogSuccess",
  props<{ blog: IBlog; data: any }>()
);

export const saveBlogFailure = createAction(
  "saveBlogFailure",
  props<{ error: string }>()
);

export const getSavedBlogs = createAction("getSavedBlogs");

export const getSavedBlogsSuccess = createAction(
  "getSavedBlogsSuccess",
  props<{ blogs: IBlog[] }>()
);

export const getSavedBlogsFailure = createAction(
  "getSavedBlogsFailure",
  props<{ error: string }>()
);
