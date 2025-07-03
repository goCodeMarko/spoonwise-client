import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { HttpRequestService } from "../http-request/http-request.service";
import { BehaviorSubject } from "rxjs";

interface IResponse {
  success: string;
  data: {
    role: string;
    _id: string;
    email: string;
    fullname: string;
    isallowedtodelete: boolean;
    isallowedtocreate: boolean;
    isallowedtoupdate: boolean;
    isblock: boolean;
  };
  code: number;
  message?: {
    error: { message: string };
  };
}

export interface IUserData {
  address1: string;
  address2: string;
  branch: string;
  cart: object[];
  company: string;
  coordinates: { lat: string; lng: string };
  email: string;
  fullname: string;
  isblock: boolean;
  phoneNumber: string;
  profile_picture: { url: string; format: string };
  role: string;
  _id: string;
  shop?: {
    _id: string;
    businessName: string;
    logo: string;
    documents: {
      bir: string;
      businessPermit: string;
    };
    address1: string;
    address2: string;
    coordinates: {
      lat: string;
      lng: string;
    };
    createdAt: string;
    updatedAt: string;
    phoneNumber: string;
  };
}
@Injectable({
  providedIn: "root",
})
export class AuthService {
  public user$ = new BehaviorSubject<IUserData>({
    address1: "",
    address2: "",
    branch: "",
    cart: [],
    company: "",
    coordinates: { lat: "", lng: "" },
    email: "",
    fullname: "",
    isblock: true,
    phoneNumber: "",
    profile_picture: { url: "", format: "string" },
    role: "",
    _id: "",
  });

  constructor(private router: Router, private hrs: HttpRequestService) {
    console.log("AuthService instantiated");
    const accountData = localStorage.getItem("account")!;
    const data = JSON.parse(accountData);

    if (data) this.user$.next(data);
  }

  getUserData$() {
    return this.user$.asObservable();
  }

  setToken(data: { account: object[]; token: any }) {
    return new Promise((resolve, reject) => {
      try {
        const account = JSON.stringify(data.account);
        const token = data.token;

        localStorage.setItem("account", account);
        localStorage.setItem("token", token);

        if (data.account) this.user$.next(JSON.parse(account));
        console.log("xx", this.user$.getValue());
      } catch (e) {
        console.info(e);
        reject(false);
      } finally {
        resolve(true);
      }
    });
  }

  async checkRole(): Promise<string> {
    return new Promise((resolve) => {
      this.hrs.request("get", "user/getAuthUser", {}, (response: IResponse) => {
        try {
          const { role } = response.data;
          if (response.success) resolve(role);
          else this.router.navigate(["login"]);
        } catch (error) {
          this.router.navigate(["login"]);
        }
      });
    });
  }

  getToken(): string {
    let token = localStorage.getItem("token");
    return token ? token : "";
  }

  getUserData(): string {
    let account = localStorage.getItem("account");
    return account ? account : "";
  }

  updateUserData() {
    return new Promise((resolve) => {
      this.hrs.request("get", "user/getUserAuth", {}, (response: IResponse) => {
        const stringified = JSON.stringify(response.data);
        localStorage.setItem("account", stringified);
        resolve(null);
      });
    });
  }

  navigate(path: string, transactionId: string) {
    let params = {};
    if (transactionId) params = { tid: transactionId };

    this.router.navigate([path], {
      queryParams: params,
      queryParamsHandling: "merge",
    });
  }

  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    this.router.navigate(["/login"]);
  }
}
