import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { HttpClient } from "@angular/common/http";
import { catchError, map, mergeMap, tap } from "rxjs/operators";
import { of } from "rxjs";
import { IBlog, Audience, BlogStatus } from "./blog.state";
import * as BlogAction from "./blog.actions";
import { environment } from "../../../../environments/environment";

@Injectable()
export class BlogEffects {
  constructor(
    private actions$: Actions,
    private http: HttpClient,
  ) {}

  setNewBlog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BlogAction.setNewBlog),
      mergeMap((blog) =>
        this.http
          .post(`${environment.SERVER_URL_MAIN}blog/createBlog`, blog, {
            withCredentials: true,
          })
          .pipe(
            tap((data: any) => {
              console.log("Blog:", data);
            }),
            map((data: any) => {
              console.log(data);
              if (data.success) {
                const newBlogData: IBlog = data.data;
                return BlogAction.setNewBlogSuccess(newBlogData);
              } else {
                return BlogAction.setNewBlogFailure({
                  error: data.data.message,
                });
              }
            }),
            catchError((error: any) => {
              console.log("error", error);
              return of(
                BlogAction.setNewBlogFailure({
                  error: error.message,
                }),
              );
            }),
          ),
      ),
    ),
  );

  updateBlog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BlogAction.updateBlog),
      mergeMap(({ blogId, blog }) =>
        this.http
          .put(
            `${environment.SERVER_URL_MAIN}blog/updateBlog/${blogId}`,
            blog,
            { withCredentials: true },
          )
          .pipe(
            tap((data: any) => {
              console.log("Blog:", data);
            }),
            map((data: any) => {
              console.log(data);
              if (data.success) {
                const blogData: IBlog = data.data;
                return BlogAction.updateBlogSuccess({ blogId, blog });
              } else {
                return BlogAction.updateBlogFailure({
                  error: data.data.message,
                });
              }
            }),
            catchError((error: any) => {
              console.log("error", error);
              return of(
                BlogAction.updateBlogFailure({
                  error: error.message,
                }),
              );
            }),
          ),
      ),
    ),
  );

  getBlogs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BlogAction.getBlogs),
      mergeMap(({}) => {
        return this.http
          .get(`${environment.SERVER_URL_CLUSTERS}blog/getBlogs`, {
            withCredentials: true,
          })
          .pipe(
            map((data: any) => {
              let blogs: IBlog[] = data.data;
              return BlogAction.getBlogsSuccess({
                blogs,
              });
            }),
            catchError((error: any) =>
              of(
                BlogAction.getBlogsFailure({
                  error: error.message,
                }),
              ),
            ),
          );
      }),
    ),
  );

  getPastBlogs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BlogAction.getPastBlogs),
      mergeMap(({ lastBlogDate }) => {
        let query = "";
        if (lastBlogDate) query = `?lastBlogDate=${lastBlogDate}`;

        return this.http
          .get(`${environment.SERVER_URL_CLUSTERS}blog/getPastBlogs${query}`, {
            withCredentials: true,
          })
          .pipe(
            map((data: any) => {
              let blogs: IBlog[] = data.data;
              return BlogAction.getPastBlogsSuccess({
                blogs,
              });
            }),
            catchError((error: any) =>
              of(
                BlogAction.getPastBlogsFailure({
                  error: error.message,
                }),
              ),
            ),
          );
      }),
    ),
  );

  getSavedBlogs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BlogAction.getSavedBlogs),
      mergeMap(({}) => {
        return this.http
          .get(`${environment.SERVER_URL_CLUSTERS}user/getSavedBlogs`, {
            withCredentials: true,
          })
          .pipe(
            map((response: any) => {
              console.log("response", response);
              let blogs = response.data || [];
              return BlogAction.getSavedBlogsSuccess({
                blogs,
              });
            }),
            catchError((error: any) =>
              of(
                BlogAction.getSavedBlogsFailure({
                  error: error.message,
                }),
              ),
            ),
          );
      }),
    ),
  );

  saveBlog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BlogAction.saveBlog),
      mergeMap(({ blog }) => {
        console.log("------------------blog", blog);
        return this.http
          .post(
            `${environment.SERVER_URL_MAIN}user/saveBlog/${blog._id}`,
            {},
            { withCredentials: true },
          )
          .pipe(
            tap((data: any) => {
              console.log("Blog:", data);
            }),
            map((data: any) => {
              if (data.success) {
                console.log("blog", blog);
                return BlogAction.saveBlogSuccess({ blog, data });
              } else {
                return BlogAction.saveBlogFailure({
                  error: data.data.message,
                });
              }
            }),
            catchError((error: any) => {
              console.log("error", error);
              return of(
                BlogAction.saveBlogFailure({
                  error: error.message,
                }),
              );
            }),
          );
      }),
    ),
  );

  unsaveBlog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BlogAction.unsaveBlog),
      mergeMap(({ id }) => {
        return this.http
          .put(
            `${environment.SERVER_URL_MAIN}user/unsaveBlog/${id}`,
            {},
            { withCredentials: true },
          )
          .pipe(
            tap((data: any) => {
              console.log("--------------unsaveBlog");
              console.log("Blog:", data);
            }),
            map((data: any) => {
              if (data.success) {
                return BlogAction.unsaveBlogSuccess({ id, data });
              } else {
                return BlogAction.unsaveBlogFailure({
                  error: data.data.message,
                });
              }
            }),
            catchError((error: any) => {
              console.log("error", error);
              return of(
                BlogAction.unsaveBlogFailure({
                  error: error.message,
                }),
              );
            }),
          );
      }),
    ),
  );
}
