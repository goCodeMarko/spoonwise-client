import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AuthService } from "../authorization/auth.service";
import { SocketService } from "../shared/socket/socket.service";

@Injectable({
  providedIn: "root",
})
export class TokenInterceptorServiceService implements HttpInterceptor {
  constructor(private auth: AuthService, private socket: SocketService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const header = req.clone({
      setHeaders: {
        Accept: "application/json",
        Authorization: "Bearer " + this.auth.getToken(),
        Timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        "X-Socket-Id": "" + this.socket.getSocketId(),
      },
    });
    return next.handle(header);
  }
}
