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
import { DealsPageComponent } from "./pages/deals-page/deals-page.component";
import { MatTabsModule } from "@angular/material/tabs";
import { ProfilePageComponent } from "./pages/profile-page/profile-page.component";
import { ProductViewPageComponent } from "./pages/product-view-page/product-view-page.component";
import { AuthService } from "../authorization/auth.service";
import { ChatListPageComponent } from "./pages/chat-list-page/chat-list-page.component";
import { ChatPageComponent } from "./pages/chat-page/chat-page.component";
import { VerifyBusinessPageComponent } from "./pages/verify-business-page/verify-business-page.component";
import { MapComponent } from "../shared/components/map/map.component";
import { HomePageComponent } from "./pages/home-page/home-page.component";
import { ViewBlogPageComponent } from "./pages/view-blog-page/view-blog-page.component";
import { DashboardComponent } from "../shared/components/dashboard/dashboard/dashboard.component";

@NgModule({
  declarations: [
    SellerComponent,
    AddProductComponent,
    DealsPageComponent,
    ProfilePageComponent,
    ProductViewPageComponent,
    ChatListPageComponent,
    ChatPageComponent,
    VerifyBusinessPageComponent,
    HomePageComponent,
    ViewBlogPageComponent,
  ],
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
    MatTabsModule,
  ],
})
export class SellerModule {}
