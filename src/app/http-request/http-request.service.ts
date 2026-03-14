import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { catchError } from "rxjs/operators";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class HttpRequestService {
  constructor(private http: HttpClient) {}

  request(
    method: string,
    endpoint: string,
    payload: any,
    callback?: any,
  ): Observable<any> | any {
    let URL;

    switch (method) {
      case "getV2":
        return this.http.get(`${environment.SERVER_URL_CLUSTERS}${endpoint}`, {
          params: payload,
          withCredentials: true,
        });
      case "postV2":
        URL = [
          "serviceWorker/subscribe",
          "order/lalamove/createOrder",
          "order/checkout",
        ].includes(endpoint)
          ? environment.SERVER_URL_MAIN
          : environment.SERVER_URL_CLUSTERS;

        return this.http
          .post(`${URL}${endpoint}`, payload, { withCredentials: true })
          .pipe(
            catchError((error) => {
              console.error("HTTP error:", error); // Optionally log to monitoring
              throw error; // Re-throw so component can handle it
            }),
          );
      case "download":
        return this.http
          .get(`${environment.SERVER_URL_CLUSTERS}${endpoint}`, {
            params: payload,
            observe: "events",
            responseType: "blob",
            reportProgress: true,
            withCredentials: true,
          })
          .subscribe(
            (response) => {
              return callback(response);
            },
            (error) => {
              return callback(error.error);
            },
          );
      case "get":
        return this.http
          .get(`${environment.SERVER_URL_CLUSTERS}${endpoint}`, {
            params: payload,
            withCredentials: true,
          })
          .subscribe(
            (response) => {
              return callback(response);
            },
            (error) => {
              return callback(error.error);
            },
          );

      case "post":
        URL = [
          "serviceWorker/subscribe",
          "order/lalamove/createOrder",
          "order/checkout",
        ].includes(endpoint)
          ? environment.SERVER_URL_MAIN
          : environment.SERVER_URL_CLUSTERS;
        console.log("----URL", URL);
        return this.http
          .post(`${URL}${endpoint}`, payload, { withCredentials: true })
          .subscribe(
            (response) => {
              return callback(response);
            },
            (error) => {
              return callback(error.error);
            },
          );

      case "put":
        URL =
          [
            "order/updateOrderStatus",
            "message/updateChatroomsMsgStatusToDelivered",
          ].includes(endpoint) ||
          endpoint.startsWith("message/updateChatroomsMsgStatusToSeen/")
            ? environment.SERVER_URL_MAIN
            : environment.SERVER_URL_CLUSTERS;
        return this.http
          .put(`${URL}${endpoint}`, payload, { withCredentials: true })
          .subscribe(
            (response) => {
              return callback(response);
            },
            (error) => {
              return callback(error.error);
            },
          );

      default:
        return this.http.get(`${environment.SERVER_URL_CLUSTERS}${endpoint}`, {
          params: payload,
          withCredentials: true,
        });
    }
  }
}
