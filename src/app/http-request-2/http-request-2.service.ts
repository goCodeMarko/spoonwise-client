import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class HttpRequest2Service {
  constructor(private http: HttpClient) {}

  getUser(id: string) {
    return this.http.get(`https://jsonplaceholder.typicode.com/users/${id}`);
  }
}
