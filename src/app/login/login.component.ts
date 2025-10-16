import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { AuthService } from "../authorization/auth.service";
import { HttpRequestService } from "../http-request/http-request.service";
import { trigger, style, animate, transition } from "@angular/animations";
import * as moment from "moment";
import * as _ from "lodash";
import { Store } from "@ngrx/store";
import {
  BottomSheetProvider,
  BottomSheetContent,
} from "swipe-bottom-sheet/angular";
import { OtpBottomSheetComponent } from "./../shared/components/otp-bottom-sheet/otp-bottom-sheet.component";

interface IUser {
  email: string;
  fullname: string;
  role: string;
  _id: string;
  isblock: boolean;
}

interface IResponse {
  success: string;
  data: { account: any; token: any; expiresAt: number };
  code: number;
  message?: string;
  error?: {
    message: string;
    data: {
      errorType: string;
      [key: string]: any;
    };
  };
}
interface OtpSheetProps {
  userId: string;
  role: string;
  expiresAt: number;
  account: object;
}
@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
  animations: [
    trigger("fade", [
      transition("void => *", [
        style({ opacity: 0 }),
        animate(300, style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class LoginComponent implements OnInit {
  static componentName = "LoginComponent";
  message: string = "";
  loginForm: FormGroup;
  currentDisplay = "login-form";
  output = "";

  constructor(
    private fb: FormBuilder,
    private hrs: HttpRequestService,
    private auth: AuthService,
    private store: Store,
    private sheet: BottomSheetProvider,
    private vcRef: ViewContainerRef
  ) {
    sheet.rootVcRef = vcRef;
    this.loginForm = this.fb.group({
      email: [""],
      password: [""],
    });
  }

  ngOnInit(): void {}

  async openSheet<T>(
    content: BottomSheetContent<OtpSheetProps>,
    userId: string,
    role: string,
    expiresAt: number,
    account: object
  ) {
    this.output = "";

    const value = await this.sheet.show(content, {
      title: "",
      stops: [3500, 500],
      props: {
        userId,
        expiresAt,
        role,
        account,
      },
    });

    this.output = value;
  }

  back() {
    this.currentDisplay = "login-form";
  }

  login() {
    this.hrs.request(
      "post",
      "user/authenticate",
      this.loginForm.value,
      async (data: IResponse) => {
        if (data.success) {
          try {
            if (data.success && data.data.token) {
              console.log("----data.data.account.role", data.data);
              this.generateOTP(
                data.data.account._id,
                data.data.account.role,
                data.data
              );
            }
          } catch (error) {
            this.message = "Client Error, Please contact your administrator";
            console.error("there's a problem in setting up token!");
          }
        } else if (!data.success) {
          this.message = data.error?.message ?? "";
        }
      }
    );
  }

  generateOTP(userId: string, role: string, account: object) {
    this.hrs.request(
      "put",
      `user/generateOTP?userId=${userId}`,
      {},
      async (data: IResponse) => {
        if (data.success) {
          await this.openSheet(
            OtpBottomSheetComponent,
            userId,
            role,
            data.data.expiresAt,
            account
          );
        } else if (
          !data.success &&
          data.error?.data.errorType == "OTP_NOT_EXPIRED"
        ) {
          await this.openSheet(
            OtpBottomSheetComponent,
            userId,
            role,
            data.error?.data.expiresAt,
            account
          );
        }
      }
    );
  }

  updateCurrentDisplay(display: string) {
    this.currentDisplay = display;
  }
}
