import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import * as _ from "lodash";
import { HttpRequestService } from "src/app/http-request/http-request.service";
import { base64ToBlob, blobToBase64 } from "base64-blob";
import { MatSnackBar } from "@angular/material/snack-bar";
import {
  BottomSheetContent,
  BottomSheetProvider,
} from "swipe-bottom-sheet/angular";

// Set the workerSrc for PDF.js
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocumentProxy, getDocument } from "pdfjs-dist";
import { AuthService } from "src/app/authorization/auth.service";
import { GeolocationService } from "src/app/shared/services/geolocation/geolocation.service";
import { StepperSelectionEvent } from "@angular/cdk/stepper";
import { MatDialog } from "@angular/material/dialog";
import { PopUpModalComponent } from "src/app/modals/pop-up-modal/pop-up-modal.component";
import { MatStepper } from "@angular/material/stepper";
import { Router } from "@angular/router";
const pdfjsVersion = (pdfjsLib as any).version;
(pdfjsLib as any).GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;
import { firstValueFrom } from "rxjs";
export interface IShop {
  _id: string;
  businessName: string;
  logo: string;
  documents: {
    bir: string;
    businessPermit: string;
    owner_selfie: string;
    validID: string;
  };
  address: string;
  province: string;
  municipality: string;
  barangay: string;

  coordinates: {
    lat: string;
    lng: string;
  };
  settlement_account: {
    accountNumber: string;
    accountName: string;
  };
  verification_process: {
    status: string;
    errors: {
      tab1: string;
      tab2: string;
      tab3: string;
    };
  };
  createdAt: string;
  updatedAt: string;
  phoneNumber: string;
}
@Component({
  selector: "app-verify-business",
  templateUrl: "./verify-business.component.html",
  styleUrls: ["./verify-business.component.scss"],
})
export class VerifyBusinessComponent implements OnInit, OnChanges {
  @ViewChild("elementBIR") elementBIR!: ElementRef;
  @ViewChild("elementBusinessLogo") elementBusinessLogo!: ElementRef;
  @ViewChild("elementValidID") elementValidID!: ElementRef;
  @ViewChild("elementBusinessPermit") elementBusinessPermit!: ElementRef;
  @ViewChild("elementOwnerSelfie") elementOwnerSelfie!: ElementRef;
  @ViewChild("snackBarTemplate") snackBarTemplate!: TemplateRef<any>;
  @ViewChild("pdfContainer", { static: false })
  pdfContainer!: ElementRef<HTMLDivElement>;
  @Input() shopId?: string;
  @Input() isAdmin = false;

  output = "";
  authUser: any;
  businessProfileForm: FormGroup;
  locationContactForm: FormGroup;
  settlementForm: FormGroup;
  subject!: {
    coordinates: {
      lat: string | number;
      lng: string | number;
    };
  };
  coordinates = {};
  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private hrs: HttpRequestService,
    private _snackBar: MatSnackBar,
    private sheet: BottomSheetProvider,
    private vcRef: ViewContainerRef,
    private auth: AuthService,
    private dialog: MatDialog,
    private router: Router
  ) {
    sheet.rootVcRef = vcRef;
    console.log("================================", this.isAdmin);
    this.businessProfileForm = this.fb.group({
      businessLogo: ["", Validators.required],
      bir2303: ["", Validators.required],
      validID: ["", Validators.required],
      businessPermit: ["", Validators.required],
      ownerSelfie: ["", Validators.required],
      errorMessage: [""],
    });

    this.locationContactForm = this.fb.group({
      province: ["", Validators.required],
      municipality: ["", Validators.required],
      barangay: ["", Validators.required],
      address: ["", Validators.required],
      phoneNumber: ["", [Validators.required, Validators.pattern(/^9\d{9}$/)]],
      errorMessage: [""],
    });

    this.settlementForm = this.fb.group({
      accountName: ["", Validators.required],
      accountNumber: [
        "",
        [Validators.required, Validators.pattern(/^9\d{9}$/)],
      ],
      errorMessage: [""],
    });
  }

  async ngOnInit() {
    this.userData();
    await this.getShopDetails();
  }

  userData() {
    this.authUser = JSON.parse(this.auth.getUserData());
  }

  ngOnChanges(): void {
    if (this.isAdmin) {
      this.businessProfileForm.disable();
      this.locationContactForm.disable();
      this.settlementForm.disable();
    }
  }

  isMapStepVisible = false;
  async onStepChange(event: StepperSelectionEvent) {
    if (!this.shop) await this.getShopDetails();
    if (event.selectedIndex === 1) {
      // this.getShopDetails();
      this.isMapStepVisible = true; // only show map on step
    } else if (event.selectedIndex === 2) {
      // this.getShopDetails();
    }
  }

  onDragend(event: any) {
    console.log("VerifyBusiness::onDragend", event);
    this.coordinates = {
      lat: event.lat.toString(),
      lng: event.lng.toString(),
    };
  }

  provinces!: [{ name: string; psgcCode: string; regionCode: string }];
  async getProvinces() {
    const prov = (await firstValueFrom(
      this.hrs.request("getV2", `address/provinces`, {})
    )) as any;

    this.provinces = prov.data;
  }

  municipalities!: [{ name: string; psgcCode: string; provinceCode: string }];
  onProvinceChange(selectedProvince: string) {
    return new Promise((res, rej) => {
      const [psgcCode] = this.provinces
        .filter((province) => province.name === selectedProvince)
        .map((province) => province.psgcCode);

      this.hrs.request(
        "get",
        `address/municipalities/${psgcCode}`,
        {},
        async (response: any) => {
          this.municipalities = response.data;
          console.log("=== this.municipalities ", this.municipalities);
          res(null);
          // this.locationContactForm.get("province")!.setValue("Agusan del Sur");
        }
      );
    });
  }

  barangays!: [{ name: string; psgcCode: string; municipalCityCode: string }];
  onMunicipalityChange(selectedMunicipality: string) {
    return new Promise((res, rej) => {
      console.log("======selectedMunicipality", selectedMunicipality);
      console.log("======this.municipalities", this.municipalities);
      const [psgcCode] = this.municipalities
        .filter((municipality) => municipality.name === selectedMunicipality)
        .map((municipality) => municipality.psgcCode);

      this.hrs.request(
        "get",
        `address/barangays/${psgcCode}`,
        {},
        async (response: any) => {
          this.barangays = response.data;
          console.log("=== this.barangays ", this.barangays);
          res(null);
        }
      );
    });
  }

  public phoneNumberStrict(event: any) {
    let pasteValue = [];
    const allowedInput = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    if (event.type == "paste") {
      pasteValue = event.clipboardData.getData("text/plain").split("");
      if (pasteValue.length > 10) event.preventDefault();
      pasteValue.forEach((char: string) => {
        if (!allowedInput.includes(char)) event.preventDefault();
      });
    } else {
      if (!allowedInput.includes(event.key)) event.preventDefault();
    }
  }

  // public shopId?: string;
  public shop!: IShop;
  detectCurrentLocation = false;
  async getShopDetails() {
    const shopId = this.shopId ? this.shopId : this.authUser?.shop?._id;
    const getshop = (await firstValueFrom(
      this.hrs.request("getV2", `shop/getShop/${shopId}`, {})
    )) as any;
    console.log("=========getshop", getshop);
    this.shop = getshop.data;

    console.log("VerifyBusiness::getShopDetails", this.shop);
    if (
      this.shop.verification_process.status === "IN_PROGRESS" &&
      this.isAdmin
    ) {
      this.businessProfileForm.get("errorMessage")?.enable();
      this.locationContactForm.get("errorMessage")?.enable();
      this.settlementForm.get("errorMessage")?.enable();
    } else if (!this.isAdmin) {
      this.businessProfileForm.get("errorMessage")?.disable();
      this.locationContactForm.get("errorMessage")?.disable();
      this.settlementForm.get("errorMessage")?.disable();
    }

    this.subject = {
      coordinates: {
        lat: getshop!.data.coordinates.lat,
        lng: getshop!.data.coordinates.lng,
      },
    };
    if (!this.subject.coordinates.lat && !this.subject.coordinates.lng) {
      this.detectCurrentLocation = true;
    }
    if (this.shop?.logo) {
      this.businessLogo = {
        file: this.shop?.logo,
        fileType: "image",
      };
    }

    if (this.shop?.documents.businessPermit) {
      let fetchx = await fetch(this.shop?.documents.businessPermit);
      const contentType = fetchx.headers.get("Content-Type");

      if (contentType === "application/pdf") {
        this.loadPdfThumbnail(
          "businessPermit",
          null,
          this.shop?.documents.businessPermit
        );
        this.loadPdf(null, this.shop?.documents.businessPermit);
      }

      this.businessPermit = {
        file: this.shop?.documents.businessPermit,
        fileType: contentType === "application/pdf" ? "pdf" : "image",
      };
    }
    if (this.shop?.documents.bir) {
      let fetchx = await fetch(this.shop?.documents.bir);
      const contentType = fetchx.headers.get("Content-Type");

      if (contentType === "application/pdf") {
        this.loadPdfThumbnail("bir", null, this.shop?.documents.bir);
        this.loadPdf(null, this.shop?.documents.bir);
      }

      this.bir = {
        file: this.shop?.documents.bir,
        fileType: contentType === "application/pdf" ? "pdf" : "image",
      };
    }
    if (this.shop?.documents.validID) {
      let fetchx = await fetch(this.shop?.documents.validID);
      const contentType = fetchx.headers.get("Content-Type");

      if (contentType === "application/pdf") {
        this.loadPdfThumbnail("validID", null, this.shop?.documents.validID);
        this.loadPdf(null, this.shop?.documents.validID);
      }

      this.validID = {
        file: this.shop?.documents.validID,
        fileType: contentType === "application/pdf" ? "pdf" : "image",
      };
    }
    if (this.shop?.documents.owner_selfie) {
      this.ownerSelfie = {
        file: this.shop?.documents.owner_selfie,
        fileType: "image",
      };
    }

    if (this.shop.verification_process.errors.tab1) {
      this.businessProfileForm
        .get("errorMessage")!
        .setValue(this.shop.verification_process.errors.tab1);
    }

    await this.getProvinces();
    if (this.shop.coordinates) {
      this.coordinates = this.shop.coordinates;
    }

    if (this.shop.province) {
      this.locationContactForm.get("province")!.setValue(this.shop.province);
      await this.onProvinceChange(this.shop.province);
    }
    if (this.shop.municipality) {
      this.locationContactForm
        .get("municipality")!
        .setValue(this.shop.municipality);
      console.log("========init");
      await this.onMunicipalityChange(this.shop.municipality);
    }

    if (this.shop.barangay) {
      this.locationContactForm.get("barangay")!.setValue(this.shop.barangay);
    }

    if (this.shop.address) {
      this.locationContactForm.get("address")!.setValue(this.shop.address);
    }

    if (this.shop.phoneNumber) {
      this.locationContactForm
        .get("phoneNumber")!
        .setValue(this.shop.phoneNumber);
    }

    if (this.shop.verification_process.errors.tab2) {
      this.locationContactForm
        .get("errorMessage")!
        .setValue(this.shop.verification_process.errors.tab2);
    }

    if (this.shop.settlement_account.accountNumber) {
      this.settlementForm
        .get("accountNumber")!
        .setValue(this.shop.settlement_account.accountNumber);
    }

    if (this.shop.settlement_account.accountName) {
      this.settlementForm
        .get("accountName")!
        .setValue(this.shop.settlement_account.accountName);
    }

    if (this.shop.verification_process.errors.tab3) {
      this.settlementForm
        .get("errorMessage")!
        .setValue(this.shop.verification_process.errors.tab3);
    }
  }
  hasModalShown = false;
  public birClass = "custom-file-dropzone-default";
  public businessLogoClass = "custom-file-dropzone-default";
  public validIDClass = "custom-file-dropzone-default";
  public businessPermitClass = "custom-file-dropzone-default";
  public ownerSelfieClass = "custom-file-dropzone-default";
  async saveAsDraftDocs(isModalOn = true) {
    return new Promise(async (resolve, reject) => {
      if (
        this.bir.file &&
        this.businessLogo.file &&
        this.validID.file &&
        this.businessPermit.file &&
        this.ownerSelfie
      ) {
        console.log("business profile valid");
        console.log("x-----------1");
        const formData = new FormData();
        console.log("x-----------2");
        const bir = await this.formData("bir");
        console.log("x-----------3");
        const businessLogo = await this.formData("businessLogo");
        console.log("x-----------4");
        const validID = await this.formData("validID");
        console.log("x-----------5");
        const businessPermit = await this.formData("businessPermit");
        console.log("x-----------6");
        const ownerSelfie = await this.formData("ownerSelfie");
        console.log("x-----------7");

        if (bir) formData.append("bir", bir);
        console.log("x-----------8");
        if (businessLogo) formData.append("businessLogo", businessLogo);
        console.log("x-----------9");
        if (validID) formData.append("validID", validID);
        console.log("x-----------10");
        if (businessPermit) formData.append("businessPermit", businessPermit);
        console.log("x----------11");
        if (ownerSelfie) formData.append("ownerSelfie", ownerSelfie);
        console.log("x-----------12");

        if (bir || businessLogo || validID || businessPermit || ownerSelfie) {
          this.hrs.request(
            "put",
            "shop/saveAsDraftTab1",
            formData,
            (response: any) => {
              console.log("x-----------");
              //When success
              if (response.success) {
                //Show success modal
                if (isModalOn)
                  this.dialog.open(PopUpModalComponent, {
                    width: "500px",
                    data: {
                      deletebutton: false,
                      okaybutton: true,
                      okayBtnText: `<b> Sounds good! <span style="font-size: 30px;line-height: 1;vertical-align: middle;">🎉</span></b>`,
                      title: "Draft Saved!",
                      message: `Your changes have been saved as a draft.`,
                      file: "assets/icons/party.png",
                    },
                  });
                resolve(null);
              } else {
                reject(null);
              }
            }
          );
        } else {
          resolve(null);
        }
      } else {
        reject(null);
        console.log("business profile invalid");
        if (!this.bir.file) this.birClass = "custom-file-dropzone-error";
        if (!this.businessLogo.file)
          this.businessLogoClass = "custom-file-dropzone-error";
        if (!this.validID.file)
          this.validIDClass = "custom-file-dropzone-error";
        if (!this.businessPermit.file)
          this.businessPermitClass = "custom-file-dropzone-error";
        if (!this.ownerSelfie.file)
          this.ownerSelfieClass = "custom-file-dropzone-error";
      }
    });
  }

  saveAsDraftLocContact(isModalOn = true) {
    return new Promise((resolve, reject) => {
      Object.values(this.locationContactForm.controls).forEach((control) => {
        control.markAsTouched();
        control.markAsDirty();
      });
      if (this.locationContactForm.valid) {
        const body = {
          coordinates: this.coordinates,
          ...this.locationContactForm.value,
        };

        this.hrs.request(
          "put",
          "shop/saveAsDraftTab2",
          body,
          (response: any) => {
            //When success
            if (response.success) {
              //Show success modal
              if (isModalOn)
                this.dialog.open(PopUpModalComponent, {
                  width: "500px",
                  data: {
                    deletebutton: false,
                    okaybutton: true,
                    okayBtnText: `<b> Sounds good! <span style="font-size: 30px;line-height: 1;vertical-align: middle;">🎉</span></b>`,
                    title: "Draft Saved!",
                    message: `Your changes have been saved as a draft.`,
                    file: "assets/icons/party.png",
                  },
                });
              resolve(null);
            } else {
              reject(null);
            }
          }
        );
      } else {
        this.locationContactForm.markAllAsTouched(); // mark all fields to trigger validation
        reject(null);
      }
    });
  }

  saveAsDraftSettlement(isModalOn = true) {
    console.log("---saveAsDraftSettlement");
    return new Promise((resolve, reject) => {
      if (this.settlementForm.valid) {
        const body = {
          ...this.settlementForm.value,
        };

        this.hrs.request(
          "put",
          "shop/saveAsDraftTab3",
          body,
          (response: any) => {
            //When success
            if (response.success) {
              //Show success modal
              if (isModalOn)
                this.dialog.open(PopUpModalComponent, {
                  width: "500px",
                  data: {
                    deletebutton: false,
                    okaybutton: true,
                    okayBtnText: `<b> Sounds good! <span style="font-size: 30px;line-height: 1;vertical-align: middle;">🎉</span></b>`,
                    title: "Draft Saved!",
                    message: `Your changes have been saved as a draft.`,
                    file: "assets/icons/party.png",
                  },
                });
              resolve(null);
            } else {
              reject(null);
            }
          }
        );
      } else {
        this.settlementForm.markAllAsTouched(); // mark all fields to trigger validation
        reject(null);
      }
    });
  }

  async sendApplication() {
    try {
      await this.saveAsDraftDocs(false);
      await this.saveAsDraftLocContact(false);
      await this.saveAsDraftSettlement(false);

      this.hrs.request(
        "put",
        "shop/sendApplication",
        {},
        async (response: any) => {
          console.log("5");
          //When success
          if (response.success) {
            await this.auth.updateUserData();
            this.userData();
            //Show success modal
            this.router.navigate(["/shop/profile"]);
            this.dialog.open(PopUpModalComponent, {
              width: "500px",
              data: {
                deletebutton: false,
                okaybutton: true,
                okayBtnText: `<b> Sounds good! <span style="font-size: 30px;line-height: 1;vertical-align: middle;">🎉</span></b>`,
                title: "Application Sent!",
                message: `Your application has been sent.`,
                file: "assets/icons/party.png",
              },
            });
          }
        }
      );
    } catch (error) {
      console.log(error);
    }
  }

  @Output() onDecline = new EventEmitter();
  @Output() onApprove = new EventEmitter();
  async declineApplication() {
    try {
      const body = {
        tab1: this.businessProfileForm.get("errorMessage")?.value,
        tab2: this.locationContactForm.get("errorMessage")?.value,
        tab3: this.settlementForm.get("errorMessage")?.value,
        shopId: this.shopId,
      };

      this.hrs.request(
        "put",
        "shop/declineApplication",
        body,
        async (response: any) => {
          console.log("-----response", response);
          //When success
          if (response.success) {
            if (this.isAdmin) this.onDecline.emit(1);

            this.dialog.open(PopUpModalComponent, {
              width: "500px",
              data: {
                deletebutton: false,
                okaybutton: true,
                okayBtnText: `<b> Sounds good! <span style="font-size: 30px;line-height: 1;vertical-align: middle;">🎉</span></b>`,
                title: "Application Declined!",
                message: `The application has been declined.`,
                file: "assets/icons/party.png",
              },
            });
          }
        }
      );
    } catch (error) {
      console.log(error);
    }
  }

  async approveApplication() {
    try {
      const body = {
        shopId: this.shopId,
      };
      if (this.isAdmin) this.onApprove.emit(1);

      this.hrs.request(
        "put",
        "shop/approveApplication",
        body,
        async (response: any) => {
          console.log("-----response", response);
          //When success
          if (response.success) {
            if (this.isAdmin) this.onApprove.emit(1);

            this.dialog.open(PopUpModalComponent, {
              width: "500px",
              data: {
                deletebutton: false,
                okaybutton: true,
                okayBtnText: `<b> Sounds good! <span style="font-size: 30px;line-height: 1;vertical-align: middle;">🎉</span></b>`,
                title: "Application Approved!",
                message: `The application has been approved.`,
                file: "assets/icons/party.png",
              },
            });
          }
        }
      );
    } catch (error) {
      console.log(error);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.locationContactForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.locationContactForm.get(fieldName);
    if (!field || !field.errors) return "";

    if (field?.hasError("required"))
      return `${this.prettyFieldName(fieldName)} is required.`;
    if (field?.hasError("pattern")) return "Must start with 9 and be 10 digits";

    return "Invalid input";
  }

  prettyFieldName(field: string): string {
    const names: { [key: string]: string } = {
      province: "Province",
      municipality: "Municipality",
      barangay: "Barangay",
      phoneNumber: "Phone Number",
      address: "Address",
    };
    return names[field] || field;
  }

  public openGallery(type: string): void {
    if (type === "bir") this.elementBIR.nativeElement.click();
    else if (type === "businessLogo")
      this.elementBusinessLogo.nativeElement.click();
    else if (type === "validID") this.elementValidID.nativeElement.click();
    else if (type === "businessPermit")
      this.elementBusinessPermit.nativeElement.click();
    else if (type === "ownerSelfie")
      this.elementOwnerSelfie.nativeElement.click();
  }

  responseMsg: string = "";
  bir: { file: string | Blob; fileType: string } = {
    file: "",
    fileType: "",
  };
  birPdfThumbnail: SafeResourceUrl | null = "";
  birPdfFull: SafeResourceUrl | null = "";

  businessLogo: { file: string; fileType: string } = {
    file: "",
    fileType: "",
  };

  validID: { file: string | Blob; fileType: string } = {
    file: "",
    fileType: "",
  };
  validIDPdfThumbnail: SafeResourceUrl | null = "";
  validIDPdfFull: SafeResourceUrl | null = "";

  businessPermit: { file: string | Blob; fileType: string } = {
    file: "",
    fileType: "",
  };
  businessPermitPdfThumbnail: SafeResourceUrl | null = "";
  businessPermitPdfFull: SafeResourceUrl | null = "";

  ownerSelfie: { file: string; fileType: string } = {
    file: "",
    fileType: "",
  };
  onFileChange(event: Event, type: string): void {
    const input = event.target as HTMLInputElement; // Cast the event target to HTMLInputElement to access the files
    const maxSizeMB = 5;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (input.files && input.files[0]) {
      if (_.size(input.files) == 1) {
        const file = input.files[0]; // Get the first selected file
        const reader = new FileReader(); // Create a FileReader to read the file
        const fileType = file.type;

        if (file.size > maxSizeBytes) {
          this._snackBar.openFromTemplate(this.snackBarTemplate, {
            duration: 5000,
            horizontalPosition: "center",
            verticalPosition: "top",
          });
          this.responseMsg = `File size must be ${maxSizeMB}MB or less. Selected file is ${(
            file.size /
            (1024 * 1024)
          ).toFixed(2)}MB.`;
          return;
        }

        this.birClass = "custom-file-dropzone-default";
        this.businessLogoClass = "custom-file-dropzone-default";
        this.validIDClass = "custom-file-dropzone-default";
        this.businessPermitClass = "custom-file-dropzone-default";
        this.ownerSelfieClass = "custom-file-dropzone-default";

        if (fileType.startsWith("image/"))
          reader.readAsDataURL(file); // Read the file as a Base64 data URL
        else reader.readAsArrayBuffer(file);

        reader.onload = (e: ProgressEvent<FileReader>) => {
          // Define what to do when file reading is complete
          if (fileType.startsWith("image/")) {
            const imgSrc = e.target!.result as string; // Get the Base64 image string
            const image = new Image();
            image.src = imgSrc;

            if (type === "businessLogo") {
              const width = image.width; // Get image width
              const height = image.height; // Get image height

              if (width !== height) {
                this._snackBar.openFromTemplate(this.snackBarTemplate, {
                  duration: 5000,
                  horizontalPosition: "center",
                  verticalPosition: "top",
                });
                this.responseMsg = `Image must be square. Current dimensions: ${width}x${height}.`;
                return;
              }
            }

            image.onload = () => {
              if (type === "bir") {
                this.bir = {
                  file: imgSrc,
                  fileType: "image",
                };
              } else if (type === "businessLogo") {
                this.businessLogo = {
                  file: imgSrc,
                  fileType: "image",
                };
              } else if (type === "validID") {
                this.validID = {
                  file: imgSrc,
                  fileType: "image",
                };
              } else if (type === "businessPermit") {
                this.businessPermit = {
                  file: imgSrc,
                  fileType: "image",
                };
              } else if (type === "ownerSelfie") {
                this.ownerSelfie = {
                  file: imgSrc,
                  fileType: "image",
                };
              }
            };
          } else if (fileType.startsWith("application/pdf")) {
            // Handle PDF file
            const typedArray = reader.result as ArrayBuffer;
            const blob = new Blob([typedArray], { type: "application/pdf" });

            if (type === "bir") {
              this.bir = {
                file: blob,
                fileType: "pdf",
              };
            } else if (type === "validID") {
              this.validID = {
                file: blob,
                fileType: "pdf",
              };
            } else if (type === "businessPermit") {
              this.businessPermit = {
                file: blob,
                fileType: "pdf",
              };
            }

            this.loadPdfThumbnail(type, typedArray);
            this.loadPdf(typedArray);
          }
        };
      }
    }
  }

  async formData(type: string) {
    let data, file, mime, ext;
    const id = Math.random().toString(36).substring(2, 9);

    if (type === "bir") {
      if (
        typeof this.bir.file === "string" &&
        this.bir.file.startsWith("https://res.cloudinary.com")
      ) {
        return null;
      }

      if (this.bir.fileType === "pdf") {
        data = this.bir.file;
        mime = "application/pdf";
        ext = "pdf";

        file = new File([data], `pdf_${id}.${ext}`, { type: mime });
      } else {
        data = await base64ToBlob("" + this.bir.file);
        mime = data.type || "image/png";
        console.log("----------mime bir", mime);
        ext = mime.split("/")[1];

        file = new File([data], `image_${id}.${ext}`, { type: mime });
      }
    } else if (type === "validID") {
      if (
        typeof this.validID.file === "string" &&
        this.validID.file.startsWith("https://res.cloudinary.com")
      ) {
        return null;
      }

      if (this.validID.fileType === "pdf") {
        data = this.validID.file;
        mime = "application/pdf";
        ext = "pdf";

        file = new File([data], `pdf_${id}.${ext}`, { type: mime });
      } else {
        data = await base64ToBlob("" + this.validID.file);
        mime = data.type || "image/png";
        console.log("----------mime validID", mime);
        ext = mime.split("/")[1];

        file = new File([data], `image_${id}.${ext}`, { type: mime });
      }
    } else if (type === "businessPermit") {
      if (
        typeof this.businessPermit.file === "string" &&
        this.businessPermit.file.startsWith("https://res.cloudinary.com")
      ) {
        return null;
      }

      if (this.businessPermit.fileType === "pdf") {
        data = this.businessPermit.file;
        mime = "application/pdf";
        ext = "pdf";

        file = new File([data], `pdf_${id}.${ext}`, { type: mime });
      } else {
        data = await base64ToBlob("" + this.businessPermit.file);

        mime = data.type || "image/png";
        console.log("----------mime3 businessPermit", mime);
        ext = mime.split("/")[1];

        file = new File([data], `image_${id}.${ext}`, { type: mime });
      }
    } else if (type === "ownerSelfie") {
      if (
        typeof this.ownerSelfie.file === "string" &&
        this.ownerSelfie.file.startsWith("https://res.cloudinary.com")
      ) {
        return null;
      }

      data = await base64ToBlob("" + this.ownerSelfie.file);
      mime = data.type || "image/png";
      console.log("----------mime4 ownerSelfie", mime);
      ext = mime.split("/")[1];

      file = new File([data], `image_${id}.${ext}`, { type: mime });
    } else if (type === "businessLogo") {
      if (
        typeof this.businessLogo.file === "string" &&
        this.businessLogo.file.startsWith("https://res.cloudinary.com")
      ) {
        return null;
      }

      data = await base64ToBlob("" + this.businessLogo.file);
      mime = data.type || "image/png";
      console.log("----------mime5 businessLogo", mime);
      ext = mime.split("/")[1];

      file = new File([data], `image_${id}.${ext}`, { type: mime });
    }

    return file;
  }

  async loadPdfThumbnail(
    type: string,
    typedArray?: ArrayBuffer | null,
    url?: string
  ) {
    if (url) {
      let fetchx = await fetch(url);
      const arrayBuffer = await fetchx.arrayBuffer();
      typedArray = arrayBuffer;
    }

    const pdf: PDFDocumentProxy = await getDocument({ data: typedArray! })
      .promise;
    const page = await pdf.getPage(1); // First page
    const viewport = page.getViewport({ scale: 2 }); // Adjust scale for resolution
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context, viewport }).promise;
    const base64Image = canvas.toDataURL("image/png");

    if (type === "bir")
      this.birPdfThumbnail = this.sanitizer.bypassSecurityTrustUrl(base64Image);
    if (type === "validID")
      this.validIDPdfThumbnail =
        this.sanitizer.bypassSecurityTrustUrl(base64Image);
    if (type === "businessPermit")
      this.businessPermitPdfThumbnail =
        this.sanitizer.bypassSecurityTrustUrl(base64Image);
  }

  renderedPages: string[] = [];
  async loadPdf(typedArray: ArrayBuffer | null, url?: string) {
    if (url) {
      let fetchx = await fetch(url);
      const arrayBuffer = await fetchx.arrayBuffer();
      typedArray = arrayBuffer;
    }

    this.renderedPages = []; // clear before re-rendering

    const pdf = await pdfjsLib.getDocument({ data: typedArray! }).promise;

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const context = canvas.getContext("2d")!;
      await page.render({
        canvasContext: context,
        viewport,
      }).promise;

      const imageUrl = canvas.toDataURL(); // Convert canvas to image
      this.renderedPages.push(imageUrl);
    }
  }

  remove(type: string) {
    if (type === "bir") {
      this.bir = {
        file: "",
        fileType: "",
      };
      this.businessProfileForm.get("bir2303")?.reset();

      this.birPdfThumbnail = null;
      this.birPdfFull = null;
    } else if (type === "businessLogo") {
      this.businessLogo = {
        file: "",
        fileType: "",
      };
      this.businessProfileForm.get("businessLogo")?.reset();
    } else if (type === "validID") {
      this.validID = {
        file: "",
        fileType: "",
      };
      this.businessProfileForm.get("validID")?.reset();
    } else if (type === "businessPermit") {
      this.businessPermit = {
        file: "",
        fileType: "",
      };
      this.businessProfileForm.get("businessPermit")?.reset();
    } else if (type === "ownerSelfie") {
      this.ownerSelfie = {
        file: "",
        fileType: "",
      };
      this.businessProfileForm.get("ownerSelfie")?.reset();
    }
  }

  sheetType!: string;
  async preview<T>(content: BottomSheetContent<T>, type: string) {
    this.sheetType = type;
    const value = await this.sheet.show(content, {
      stops: [3500, 1000],
    });

    this.output = value;
  }
}
