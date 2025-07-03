import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { GeolocationService } from "src/app/shared/services/geolocation/geolocation.service";
import { allowedEmailDomainsValidator } from "../../shared/form-validators/allowed-email-domains.validator";
import { passwordsMatchValidator } from "../../shared/form-validators/passwords-match.validator";
import { passwordStrengthValidator } from "src/app/shared/form-validators/password-string.validator";
import * as _ from "lodash";
import { HttpRequestService } from "src/app/http-request/http-request.service";
import { MatDialog } from "@angular/material/dialog";
import { PopUpModalComponent } from "src/app/modals/pop-up-modal/pop-up-modal.component";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit, OnChanges, AfterViewChecked {
  registrationForm!: FormGroup;
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

  constructor(
    private geolocationService: GeolocationService,
    private fb: FormBuilder,
    private hrs: HttpRequestService,
    private dialog: MatDialog
  ) {
    this.initForm();
  }

  ngOnInit(): void {}

  ngAfterViewChecked(): void {}

  ngOnChanges(change: any) {
    console.log("==========change", change.currentDisplay.currentValue);
    this.currentDisplay = change.currentDisplay.currentValue;
    this.initForm();
  }

  onDragend(event: any) {
    console.log("=============event", event);
    this.coordinates = {
      lat: event.lat.toString(),
      lng: event.lng.toString(),
    };
  }

  detectCurrentLocation = false;
  initForm() {
    if (this.currentDisplay === "seller-form") {
      this.detectCurrentLocation = true;
      // this.geolocationService
      //   .getCurrentPosition()
      //   .then((position) => {
      //     this.coordinates = {
      //       lat: position.coords.latitude.toString(),
      //       lng: position.coords.longitude.toString(),
      //     };
      //     this.subject = {
      //       coordinates: {
      //         lat: position.coords.latitude.toString(),
      //         lng: position.coords.longitude.toString(),
      //       },
      //     };
      //   })
      //   .catch((err) => {
      //     console.error(err);
      //   });

      this.registrationForm = this.fb.group({
        firstname: ["", Validators.required],
        lastname: ["", Validators.required],
        businessname: ["", Validators.required],
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
            password: ["", [Validators.required, passwordStrengthValidator()]],
            confirmPassword: ["", Validators.required],
          },
          { validators: passwordsMatchValidator }
        ),
      });
    } else {
      this.registrationForm = this.fb.group({
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
            password: ["", [Validators.required, passwordStrengthValidator()]],
            confirmPassword: ["", Validators.required],
          },
          { validators: passwordsMatchValidator }
        ),
      });
    }
    this.registrationForm.reset();
    this.resetFormErrors();
  }

  resetFormErrors() {
    // // Mark all controls as pristine and untouched, and clear their errors
    // this.registrationForm.markAsPristine();
    // this.registrationForm.markAsUntouched();

    // Iterate over all form controls to clear their errors
    Object.values(this.registrationForm.controls).forEach((control) => {
      if (control instanceof FormGroup) {
        Object.values(control.controls).forEach((innerControl) => {
          innerControl.reset(); // ✅ This clears value + state
        });
      } else {
        control.reset(); // ✅ This clears value + state
      }
    });
  }

  passwordGroupHasError(errorCode: string): boolean {
    const group = this.registrationForm.get("passwordGroup");
    return !!(
      group &&
      group.hasError(errorCode) &&
      (group.dirty || group.touched)
    );
  }

  isInvalid(
    formcontrol: string,
    formgroup: null | string = null,
    formGroupErrorOnly = false
  ): object | null {
    const element = formgroup
      ? formGroupErrorOnly
        ? this.registrationForm.get(formgroup)
        : this.registrationForm.get(`${formgroup}.${formcontrol}`)
      : this.registrationForm.get(formcontrol);
    let errors = element?.errors || {};
    let message = "";

    if (!errors?.passwordStrength?.hasUppercase)
      message += "Password must contain at least one capital letter.<br>";
    if (!errors?.passwordStrength?.hasNumber)
      message += "Password must contain at least one number.<br>";
    if (!errors?.passwordStrength?.hasSpecialChar)
      message += "Password must contain at least one special character.<br>";
    if (!errors?.passwordStrength?.isLongEnough)
      message += "Password must be at least 8 characters long.";
    if (errors?.required) message = "First Name is required.";
    if (errors?.passwordsMismatch) message = "Passwords do not match.";
    if (errors?.invalidDomain)
      message = "Only @gmail.com and @ymail.com email addresses are allowed.";

    if (
      element &&
      element.invalid &&
      (element.dirty || element.touched) &&
      !formGroupErrorOnly
    ) {
      return { errors, message };
    }
    if (
      formGroupErrorOnly &&
      formgroup == "passwordGroup" &&
      element &&
      element.invalid &&
      (this.registrationForm.get(`${formgroup}.${formcontrol}`)?.dirty ||
        this.registrationForm.get(`${formgroup}.${formcontrol}`)?.touched)
    ) {
      return { errors, message };
    }

    return null;
  }
  markAllTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markAllTouched(control); // Recursively mark nested form groups
      }
    });
  }

  back() {
    this.onBack.emit();
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

    this.hrs.request("post", "user/addUser", account, (res: any) => {
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
}
