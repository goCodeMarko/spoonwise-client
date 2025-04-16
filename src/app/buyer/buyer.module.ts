import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BuyerRoutingModule } from "./buyer-routing.module";
import { BuyerComponent } from "./buyer.component";
import { ProductListComponent } from "./pages/product-list/product-list.component";
import { ProductViewComponent } from "./pages/product-view/product-view.component";
import { MapComponent } from "../shared/components/map/map.component";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatBadgeModule } from "@angular/material/badge";
import { MatBottomSheetModule } from "@angular/material/bottom-sheet";
import { BottomSheetComponent } from "../shared/components/bottom-sheet/bottom-sheet.component";
import { MatListModule } from "@angular/material/list";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatSelectModule } from "@angular/material/select";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { NgxStarRatingModule } from "ngx-star-rating";
import { MatRadioModule } from "@angular/material/radio";
import { SwiperModule } from "swiper/angular";
import { BottomSheetModule } from "swipe-bottom-sheet/angular";
import { MatInputModule } from "@angular/material/input";
import { SharedModule } from "../shared/shared.module";
import { CartComponent } from "./pages/cart/cart.component";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { CheckoutComponent } from "./pages/checkout/checkout.component";
import { ProfileComponent } from "./pages/profile/profile.component";
import { MatTabsModule } from "@angular/material/tabs";
import { OrderListComponent } from "../shared/components/order-list/order-list.component";
import { MatChipsModule } from "@angular/material/chips";
import { MatRippleModule } from "@angular/material/core";

@NgModule({
  declarations: [
    BuyerComponent,
    ProductListComponent,
    ProductViewComponent,
    MapComponent,
    BottomSheetComponent,
    CartComponent,
    CheckoutComponent,
    ProfileComponent,
    OrderListComponent,
  ],
  imports: [
    SharedModule,
    CommonModule,
    BuyerRoutingModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatListModule,
    MatButtonToggleModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    NgxStarRatingModule,
    MatRadioModule,
    SwiperModule,
    BottomSheetModule,
    MatSnackBarModule,
    MatTabsModule,
    MatChipsModule,
    MatInputModule,
    MatRippleModule,
  ],
})
export class BuyerModule {}
