import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { SellerRoutingModule } from "./seller-routing.module";
import { SellerComponent } from "./seller.component";
import { AddProductComponent } from "./pages/add-product/add-product.component";
import { MatStepperModule } from "@angular/material/stepper";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { SharedModule } from "../shared/shared.module";
import { ImageCropperComponent, ImageCropperModule } from "ngx-image-cropper";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatSelectModule } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";

@NgModule({
  declarations: [SellerComponent, AddProductComponent],
  imports: [
    CommonModule,
    SharedModule,
    SellerRoutingModule,
    MatStepperModule,
    FormsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    DragDropModule,
    ImageCropperModule,
    MatDatepickerModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
  ],
})
export class SellerModule {}
