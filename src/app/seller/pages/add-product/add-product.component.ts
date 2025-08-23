import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import * as _ from "lodash";
import {
  BottomSheetProvider,
  BottomSheetContent,
} from "swipe-bottom-sheet/angular";
import {
  ImageCropperComponent,
  ImageCroppedEvent,
  LoadedImage,
} from "ngx-image-cropper";
import { DomSanitizer } from "@angular/platform-browser";
import { MatStepper } from "@angular/material/stepper";
import {
  ProductCategory,
  ProductCategoryLabels,
  SpecialOffer,
  SpecialOfferLabels,
} from "./../../../shared/enums/index";
import { base64ToBlob, blobToBase64 } from "base64-blob";
import { HttpRequestService } from "src/app/http-request/http-request.service";

@Component({
  selector: "app-add-product",
  templateUrl: "./add-product.component.html",
  styleUrls: ["./add-product.component.scss"],
})
export class AddProductComponent implements OnInit {
  static componentName = "AddProductComponent";
  @ViewChild("scrollContainer") scrollContainer!: ElementRef;
  @ViewChild("openCameraInput") openCameraInput!: ElementRef;
  @ViewChild("openGalleryInput") openGalleryInput!: ElementRef;
  copiesForm: FormGroup;
  productDetailsForm: FormGroup;
  public webcamImage: object | null | string = null; //latest snapshot
  originals: { base64: string; id: string }[] = [];
  copies: { img?: string; id?: string }[] | any = [];
  minDate: Date;
  categoryIds = Object.values(ProductCategory);
  categoryLabels = ProductCategoryLabels;

  specialOfferIds = Object.values(SpecialOffer);
  specialOfferLabels = SpecialOfferLabels;

  constructor(
    private fb: FormBuilder,
    private sheet: BottomSheetProvider,
    private vcRef: ViewContainerRef,
    private sanitizer: DomSanitizer,
    private hrs: HttpRequestService
  ) {
    sheet.rootVcRef = vcRef;
    const today = new Date();
    this.minDate = new Date(today.setDate(today.getDate() + 2)); // today + 2 days

    this.copiesForm = this.fb.group({
      copies: [false, Validators.requiredTrue],
    });

    this.productDetailsForm = this.fb.group({
      name: ["", Validators.required],
      category: [[], Validators.required],
      description: ["", Validators.required],
      expiryDate: [this.minDate, Validators.required],
      qty: [1, [Validators.required, Validators.min(1)]],
      price: ["", [Validators.required, Validators.min(0)]],
      specialOffers: [[], []],
      isPublished: [true],
    });
  }

  ngOnInit(): void {}

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productDetailsForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.productDetailsForm.get(fieldName);
    if (!field || !field.errors) return "";

    if (field.errors["required"]) {
      return `${this.prettyFieldName(fieldName)} is required.`;
    }
    if (field.errors["min"]) {
      return `${this.prettyFieldName(fieldName)} must be at least ${
        field.errors["min"].min
      }.`;
    }

    return "Invalid input";
  }

  prettyFieldName(field: string): string {
    const names: { [key: string]: string } = {
      name: "Name",
      category: "Category",
      expiryDate: "Expiry Date",
      qty: "Quantity",
      price: "Price",
      specialOffers: "Special Offers",
    };
    return names[field] || field;
  }

  addProdBtnOnLoad = false;
  async submitForm() {
    if (this.productDetailsForm.valid && _.size(this.copies)) {
      const formData = await this.convertBase64ToBlob();
      formData.append("details", JSON.stringify(this.productDetailsForm.value));
      this.addProdBtnOnLoad = true;
      this.hrs.request(
        "post",
        "product/createProduct",
        formData,
        (res: any) => {
          if (res.success) {
          }

          this.addProdBtnOnLoad = false;
        }
      );
    }
  }

  convertBase64ToBlob() {
    const formData = new FormData();
    this.copies.forEach(async (base64: any, index: any) => {
      const blob = await base64ToBlob(base64.img);
      const mime = blob.type || "image/png";
      const ext = mime.split("/")[1] || "png";

      const file = new File([blob], `image_${index}.${ext}`, { type: mime });

      formData.append("prod_pictures", file);
    });

    return formData;
  }

  updateCopiesValidity() {
    const copies = this.copies.length > 0;
    this.copiesForm.get("copies")?.setValue(copies);
    console.log(
      "1------updateCopiesValidity",
      this.copiesForm.get("copies")?.value
    );

    console.log(
      "3------updateCopiesValidity",
      this.copiesForm.get("copies")?.hasError("required")
    );
  }

  public currencyStrict(event: any) {
    let pasteValue = [];
    const allowedInput = [
      ".",
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
    ];
    if (event.type == "paste") {
      pasteValue = event.clipboardData.getData("text/plain").split("");
      pasteValue.forEach((char: string) => {
        if (!allowedInput.includes(char)) event.preventDefault();
      });
    } else {
      if (!allowedInput.includes(event.key)) event.preventDefault();
    }
  }

  public numberStrict(event: any) {
    let pasteValue = [];
    const allowedInput = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

    if (event.type == "paste") {
      pasteValue = event.clipboardData.getData("text/plain").split("");
      pasteValue.forEach((char: string) => {
        if (!allowedInput.includes(char)) event.preventDefault();
      });
    } else {
      if (!allowedInput.includes(event.key)) event.preventDefault();
    }
  }

  goToNext(stepper: MatStepper) {
    stepper.next();
  }

  goToPrev(stepper: MatStepper) {
    stepper.previous();
  }

  arrayNotEmptyValidator(control: AbstractControl) {
    return _.size(this.copies) > 0 ? null : { arrayEmpty: true };
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.copies, event.previousIndex, event.currentIndex);
  }

  scrollLeft() {
    this.scrollContainer.nativeElement.scrollBy({
      left: -200,
      behavior: "smooth",
    });
  }

  scrollRight() {
    this.scrollContainer.nativeElement.scrollBy({
      left: 200,
      behavior: "smooth",
    });
  }

  maxFile = 6;
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement; // Cast the event target to HTMLInputElement to access the files

    if (input.files && input.files[0]) {
      if (_.size(input.files) == 1) {
        // Ensure a file was selected (non-null and at least one file)
        const file = input.files[0]; // Get the first selected file
        const reader = new FileReader(); // Create a FileReader to read the file

        reader.readAsDataURL(file); // Read the file as a Base64 data URL

        if (_.size(this.copies) < this.maxFile) {
          reader.onload = (e: ProgressEvent<FileReader>) => {
            // Define what to do when file reading is complete
            const imgSrc = e.target!.result as string; // Get the Base64 image string
            const image = new Image();
            image.src = imgSrc;
            image.onload = () => {
              const width = image.width; // Get image width
              const height = image.height; // Get image height

              const id = Math.random().toString(36).substring(2, 9);

              // Push the image and a generated ID into the copies array
              this.originals.push({
                base64: imgSrc,
                id, // Simple unique ID
              });

              // Push the image and a generated ID into the copies array

              if (width === height) {
                this.copies.push({
                  img: imgSrc,
                  id, // Simple unique ID
                });
              } else {
                this.autoCropSquare(image, id);
              }

              this.updateCopiesValidity();
            };
          };
        }
      } else if (_.size(input.files) > 1) {
        // Ensure a file was selected (non-null and at least one file)
        const files = Array.from(input.files);

        if (_.size(this.copies) + _.size(files) <= this.maxFile) {
          files.forEach((file) => {
            const reader = new FileReader();

            reader.onload = (e: ProgressEvent<FileReader>) => {
              // Define what to do when file reading is complete
              const imgSrc = e.target!.result as string; // Get the Base64 image string
              const image = new Image();
              image.src = imgSrc;
              image.onload = () => {
                const width = image.width; // Get image width
                const height = image.height; // Get image height

                const id = Math.random().toString(36).substring(2, 9);

                // Push the image and a generated ID into the copies array
                this.originals.push({
                  base64: imgSrc,
                  id, // Simple unique ID
                });
                // Push the image and a generated ID into the copies array

                if (width === height) {
                  this.copies.push({
                    img: imgSrc,
                    id, // Simple unique ID
                  });
                } else {
                  this.autoCropSquare(image, id);
                }
                this.updateCopiesValidity();
              };
            };

            reader.readAsDataURL(file);
          });
        }
      }
    }
  }

  public openCamera(): void {
    this.openCameraInput.nativeElement.click();
  }

  public openGallery(): void {
    this.openGalleryInput.nativeElement.click();
  }

  autoCropSquare(img: HTMLImageElement, id: string) {
    const size = Math.min(img.width, img.height); // square size
    const startX = (img.width - size) / 2;
    const startY = (img.height - size) / 2;

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(img, startX, startY, size, size, 0, 0, size, size);
    }

    const imgSrc = canvas.toDataURL("image/png", 0.1);

    this.copies.push({
      img: imgSrc,
      id,
    });
  }

  remove(imageDetails: { img: string; id: string }) {
    this.copies = this.copies.filter((copy: any) => copy.id != imageDetails.id);
    this.originals = this.originals.filter(
      (copy: any) => copy.id != imageDetails.id
    );
    this.updateCopiesValidity();
  }

  output = "";
  croppedImage: any = "";
  imageBase64: any = "";
  productId: string = "";
  async openCropper<T>(
    content: BottomSheetContent<T>,
    imageDetails: { img: string; id: string }
  ) {
    this.output = "";

    const r = this.originals.find((original) => original.id == imageDetails.id);
    this.productId = imageDetails.id;
    this.imageBase64 = r?.base64;

    const value = await this.sheet.show(content, {
      title: "",
      stops: [3500, 500],
    });

    this.output = value;
  }

  fileChangeEvent(event: Event): void {}
  async imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = await blobToBase64(event.blob!);
  }
  imageLoaded(image: LoadedImage) {
    // show cropper
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }

  cropImage() {
    this.copies = this.copies.map((copy: any) => {
      if (copy.id === this.productId) {
        return { ...copy, img: this.croppedImage };
      } else {
        return { ...copy };
      }
    });
  }
}
