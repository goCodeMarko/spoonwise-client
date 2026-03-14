import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, switchMap, throwError } from "rxjs";
import { AuthService } from "../authorization/auth.service";
import { SocketService } from "../shared/socket/socket.service";
@Injectable({
  providedIn: "root",
})
export class TokenInterceptorServiceService implements HttpInterceptor {
  constructor(
    private auth: AuthService,
    private socket: SocketService,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): any {
    // Skip interceptor for Cloudinary uploads
    if (req.url.includes("https://api.cloudinary.com")) {
      return next.handle(req); // just pass through,     const buildRequest = (    // Always send cookies
    }

    const reqWithCredentials = req.clone({
      withCredentials: true,
      setHeaders: {
        "X-Timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
        "X-Socket-Id": "" + this.socket.getSocketId(),
      },
    });

    return next.handle(reqWithCredentials).pipe(
      catchError((error: HttpErrorResponse) => {
        // Access token expired or invalid
        if (error.status === 401) {
          console.log("------x");
          return this.auth.rotateAccessToken$().pipe(
            switchMap(() => {
              // Refresh successful → retry original request
              return next.handle(reqWithCredentials);
            }),
            catchError((refreshErr) => {
              // Refresh failed → logout user
              // store.dispatch(logout());

              return throwError(() => refreshErr);
            }),
          );
        }

        return throwError(() => error);
      }),
    );
  }
}
