import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { HttpRequestService } from "src/app/http-request/http-request.service";
import { BottomSheetContext } from "swipe-bottom-sheet/angular";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Store } from "@ngrx/store";
import { AuthService } from "src/app/authorization/auth.service";

interface OtpSheetProps {
  userId: string;
  role: string;
  expiresAt: number;
  account: object;
}
@Component({
  selector: "app-otp-bottom-sheet",
  templateUrl: "./otp-bottom-sheet.component.html",
  styleUrls: ["./otp-bottom-sheet.component.scss"],
})
export class OtpBottomSheetComponent implements OnInit, AfterViewInit {
  @ViewChild("otpInput") otpInput!: ElementRef;
  responseMsg = "";
  @ViewChild("snackBarTemplate") snackBarTemplate!: TemplateRef<any>;
  otp: string = "";
  @Input() userId!: string;
  @Input() role!: string;
  @Input() expiresAt!: number;
  @Input() account!: any;
  constructor(
    public context: BottomSheetContext<OtpSheetProps>,
    public hrs: HttpRequestService,
    private _snackBar: MatSnackBar,
    private store: Store,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.otpInput?.nativeElement.focus();
    });
  }

  checkCharCount(event: any) {
    const otp = this.otpInput?.nativeElement.value;
    const count = this.otpInput?.nativeElement.value.length;

    if (count === 4) this.checkOTP(otp);
  }

  checkOTP(otp: string) {
    if (this.otpInput) this.otpInput.nativeElement.disabled = true;
    this.hrs.request(
      "get",
      `user/checkOTP?userId=${this.userId}&otp=${otp}`,
      {},
      async (data: any) => {
        if (data.success && data.data.message == "OTP_SUCCESS") {
          const user = await this.auth.setToken(this.account);

          if (this.role == "buyer") {
            this.auth.navigate("/home", "");
          } else if (this.role == "seller") {
            this.auth.navigate("/shop/home", "");
          } else if (this.role == "admin") {
            this.auth.navigate("/admin/shops", "");
          }
        } else if (
          !data.success &&
          data.error?.data.errorType == "OTP_EXPIRED"
        ) {
          this._snackBar.openFromTemplate(this.snackBarTemplate, {
            duration: 5000,
            horizontalPosition: "center",
            verticalPosition: "top",
          });
          this.responseMsg = data.error.message;
        } else if (
          !data.success &&
          data.error?.data.errorType == "OTP_CONSUMED"
        ) {
          this._snackBar.openFromTemplate(this.snackBarTemplate, {
            duration: 5000,
            horizontalPosition: "center",
            verticalPosition: "top",
          });
          this.responseMsg = data.error.message;
        } else if (
          !data.success &&
          data.error?.data.errorType == "OTP_INCORRECT"
        ) {
          this._snackBar.openFromTemplate(this.snackBarTemplate, {
            duration: 5000,
            horizontalPosition: "center",
            verticalPosition: "top",
          });
          this.responseMsg = data.error.message;
        }

        if (this.otpInput) this.otpInput.nativeElement.disabled = false;
        this.otpInput?.nativeElement.focus();
      }
    );
  }

  countdownValue: string = "00:00";
  isExpired = false;

  updateCountdown(val: string) {
    this.countdownValue = val;
    this.isExpired = val === "00:00";
  }

  resendOTP() {
    this.hrs.request(
      "put",
      `user/generateOTP?userId=${this.userId}`,
      {},
      async (data: any) => {
        // this.context.props
        if (data.success) {
          this._snackBar.openFromTemplate(this.snackBarTemplate, {
            duration: 5000,
            horizontalPosition: "center",
            verticalPosition: "top",
          });
          this.responseMsg = "OTP resent successfully.";

          this.expiresAt = data?.data?.expiresAt;
          this.isExpired = false;
        } else if (
          !data.success &&
          data.error?.data.errorType == "OTP_NOT_EXPIRED"
        ) {
          this._snackBar.openFromTemplate(this.snackBarTemplate, {
            duration: 5000,
            horizontalPosition: "center",
            verticalPosition: "top",
          });
          this.responseMsg =
            "Wait for the OTP to expire before requesting a new one.";
        }

        this.otpInput.nativeElement.value = "";
        this.otpInput?.nativeElement.focus();
      }
    );
  }
}
