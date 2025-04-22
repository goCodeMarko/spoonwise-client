import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { AuthService } from "../authorization/auth.service";
import { HttpRequestService } from "../http-request/http-request.service";
import { trigger, style, animate, transition } from "@angular/animations";
import * as moment from "moment";
import * as _ from "lodash";
import { Store } from "@ngrx/store";
import { setCart } from "./../shared/store/cart/cart.actions";
import { setToPay } from "./../shared/store/order/order.actions";

interface IUser {
  email: string;
  fullname: string;
  role: string;
  _id: string;
  isblock: boolean;
}

interface IResponse {
  success: string;
  data: { account: any; token: any };
  code: number;
  message?: string;
  error?: {
    message: string;
  };
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
  message: string = "";
  loginForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private hrs: HttpRequestService,
    private auth: AuthService,
    private store: Store
  ) {
    this.loginForm = this.fb.group({
      email: [""],
      password: [""],
    });
  }

  ngOnInit(): void {}

  private transactionId!: string;
  private getTransaction(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Parse the client's local timezone
      const startDate = moment().startOf("day").format("YYYY-MM-DDTHH:mm:ss");
      const endDate = moment().endOf("day").format("YYYY-MM-DDTHH:mm:ss");

      this.hrs.request(
        "get",
        "transaction/getTransaction",
        { startDate, endDate },
        async (res: any) => {
          if (res.success && _.has(res, "data")) {
            this.transactionId = res.data?._id;
          }

          resolve();
        }
      );
    });
  }

  login() {
    this.hrs.request(
      "post",
      "user/authenticate",
      this.loginForm.value,
      async (data: IResponse) => {
        if (data.success) {
          try {
            const user = await this.auth.setToken(data.data);

            if (data.data.account.role == "buyer") {
              this.store.dispatch(setCart());
              this.store.dispatch(setToPay());
              this.auth.navigate("/", "");
            } else if (data.data.account.role == "seller") {
              this.auth.navigate("/shop/add-product", "");
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
}
