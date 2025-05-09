import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import "rxjs/add/operator/catch";

@Injectable({
  providedIn: "root",
})
export class HttpRequestService {
  constructor(private http: HttpClient) {}

  request(method: string, endpoint: string, payload: any, callback: any) {
    let URL;
    switch (method) {
      case "download":
        return this.http
          .get(`${environment.SERVER_URL_CLUSTERS}${endpoint}`, {
            params: payload,
            observe: "events",
            responseType: "blob",
            reportProgress: true,
          })
          .subscribe(
            (response) => {
              return callback(response);
            },
            (error) => {
              return callback(error.error);
            }
          );
      case "get":
        return this.http
          .get(`${environment.SERVER_URL_CLUSTERS}${endpoint}`, {
            params: payload,
          })
          .subscribe(
            (response) => {
              return callback(response);
            },
            (error) => {
              return callback(error.error);
            }
          );

      case "post":
        URL = [
          "serviceWorker/subscribe",
          "order/lalamove/createOrder",
          "order/checkout",
        ].includes(endpoint)
          ? environment.SERVER_URL_MAIN
          : environment.SERVER_URL_CLUSTERS;
        return this.http.post(`${URL}${endpoint}`, payload).subscribe(
          (response) => {
            return callback(response);
          },
          (error) => {
            return callback(error.error);
          }
        );

      case "put":
        URL = ["order/updateOrderStatus"].includes(endpoint)
          ? environment.SERVER_URL_MAIN
          : environment.SERVER_URL_CLUSTERS;
        return this.http.put(`${URL}${endpoint}`, payload).subscribe(
          (response) => {
            return callback(response);
          },
          (error) => {
            return callback(error.error);
          }
        );
    }
  }
}
