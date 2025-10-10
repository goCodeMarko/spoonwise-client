import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { allowedEmailDomainsValidator } from "../../shared/form-validators/allowed-email-domains.validator";
import { passwordsMatchValidator } from "../../shared/form-validators/passwords-match.validator";
import { passwordStrengthValidator } from "src/app/shared/form-validators/password-string.validator";
import * as _ from "lodash";
import { HttpRequestService } from "src/app/http-request/http-request.service";
import { MatDialog } from "@angular/material/dialog";
import { PopUpModalComponent } from "src/app/modals/pop-up-modal/pop-up-modal.component";
import { passwordGroupRequiredValidator } from "src/app/shared/form-validators/password-group-required.validator";
import {
  catchError,
  exhaustMap,
  filter,
  finalize,
  map,
  of,
  Subject,
  takeUntil,
  tap,
} from "rxjs";

interface ICreateAccountPayload {
  account: any;
  modalContent: { title: string; message: string };
}
@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit, OnChanges, OnDestroy {
  registrationForm: FormGroup;
  subject!: {
    coordinates: {
      lat: string | number;
      lng: string | number;
    };
  };
  coordinates = {};
  createAccountLoad = false;
  @Output() onBack = new EventEmitter();
  @Input() currentDisplay: string = "";
  private createAccount$ = new Subject<ICreateAccountPayload>();
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private hrs: HttpRequestService,
    private dialog: MatDialog
  ) {
    this.registrationForm = this.setForm();
  }

  ngOnInit(): void {
    this.createAccount$
      .pipe(
        takeUntil(this.destroy$),
        filter(() => this.registrationForm.valid),
        tap(() => (this.createAccountLoad = true)),
        exhaustMap(({ account, modalContent }) =>
          this.hrs.request("postV2", "user/addUser", account).pipe(
            map((res) => ({ res, modalContent })),
            catchError((error) => {
              this.dialog.open(PopUpModalComponent, {
                width: "500px",
                data: {
                  deletebutton: false,
                  okaybutton: true,
                  okayBtnText: "Close",
                  title: "Something went wrong",
                  message: error?.error?.message || "Unable to create account.",
                  file: "assets/icons/error.png",
                },
              });

              return of(error);
            })
          )
        ),
        finalize(() => (this.createAccountLoad = false))
      )
      .subscribe(({ res, modalContent }: any) => {
        if (res.data && res.success) {
          this.back();
          this.dialog.open(PopUpModalComponent, {
            width: "500px",
            data: {
              deletebutton: false,
              okaybutton: true,
              okayBtnText: `<b><span style="font-size: 30px;line-height: 1;vertical-align: middle;">🎉</span> Sounds good!</b>`,
              title: modalContent.title,
              message: modalContent.message,
              file: "assets/icons/party.png",
            },
          });
        }
      });
  }

  ngOnChanges(change: any) {
    this.currentDisplay = change.currentDisplay.currentValue;
    this.registrationForm = this.setForm();
    if (this.currentDisplay === "seller-form") {
      this.registrationForm.addControl(
        "businessname",
        this.fb.control("", Validators.required)
      );
    } else {
      if (!this.registrationForm.get("businessname")) return;

      this.registrationForm.removeControl("businessname");
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setForm(): FormGroup {
    return this.fb.group({
      firstname: ["", Validators.required],
      lastname: ["", Validators.required],
      email: [
        "",
        [
          Validators.required,
          Validators.email,
          allowedEmailDomainsValidator(["gmail.com", "ymail.com"]),
        ],
      ],
      passwordGroup: this.fb.group(
        {
          password: ["", [passwordStrengthValidator()]],
          confirmPassword: [""],
        },
        {
          validators: [passwordsMatchValidator, passwordGroupRequiredValidator],
        }
      ),
    });
  }

  isFormGroupInvalid(
    formGroupName: string,
    displayName: string
  ): object | null {
    const formGroup = this.registrationForm.get(formGroupName);
    let message = "";

    if (!formGroup) return null;
    if (!(formGroup instanceof FormGroup)) return null;
    if (!((formGroup.touched || formGroup.dirty) && formGroup.invalid))
      return null;

    if (formGroupName === "passwordGroup") {
      const password = formGroup.get("password");
      const confirmPassword = formGroup.get("confirmPassword");

      if (formGroup.hasError("groupRequired") && password?.touched) {
        return { message: `${displayName} is required.<br>` };
      }

      if (
        formGroup.hasError("passwordsMismatch") &&
        password?.dirty &&
        confirmPassword?.touched
      ) {
        message = `${displayName} do not match.<br>`;
      }
    }

    return { message: message };
  }

  isFormControlInvalid(
    formControlName: string,
    displayName: string
  ): { message: string } | null {
    const formControl = this.registrationForm.get(formControlName);
    let message = "";

    if (!formControl) return null;
    if (!(formControl instanceof FormControl)) return null;
    if (!((formControl.touched || formControl.dirty) && formControl.invalid))
      return null;

    if (formControl.hasError("required")) {
      message = `${displayName} is required.<br>`;
    }

    if (formControlName === "email") {
      if (formControl.hasError("invalidDomain")) {
        message = `Only @gmail.com and @ymail.com email addresses are allowed.<br>`;
      }
    }

    if (formControlName === "passwordGroup.password") {
      if (!formControl.hasError("passwordStrength")) return null;

      if (!formControl.errors?.passwordStrength.hasUppercase) {
        message += `${displayName} must contain at least one capital letter.<br>`;
        console.log("messahe", message);
      }
      if (!formControl.errors?.passwordStrength.hasNumber) {
        message += `${displayName} must contain at least one number.<br>`;
      }
      if (!formControl.errors?.passwordStrength.hasSpecialChar) {
        message += `${displayName} must contain at least one special character.<br>`;
      }
      if (!formControl.errors?.passwordStrength.isLongEnough) {
        message += `${displayName} must be at least 8 characters long.<br>`;
      }
    }

    return { message: message };
  }

  async createAccount() {
    // Mark all controls as touched to trigger validation display
    this.markAllTouched(this.registrationForm);

    const account = {
      ...this.registrationForm.value,
      role: this.currentDisplay === "buyer-form" ? "buyer" : "seller",
      coordinates: this.coordinates,
    };

    let modalContent: { title: string; message: string };

    if (account.role === "seller") {
      modalContent = {
        title: "Welcome to the Marketplace!",
        message: `Your seller account has been created successfully. You're now ready to showcase your products and grow your business with us.`,
      };
    } else {
      modalContent = {
        title: "Registration Successful!",
        message: `You're all set! Start exploring amazing products and enjoy seamless shopping with your new account.`,
      };
    }
    this.createAccount$.next({ account, modalContent });
  }

  markAllTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markAllTouched(control); // Recursively mark nested form groups
      }
    });
  }

  detectCurrentLocation = false;
  onDragend(event: any) {
    this.coordinates = {
      lat: event.lat.toString(),
      lng: event.lng.toString(),
    };
  }

  back() {
    this.onBack.emit();
  }
}
