import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BuyerRoutingModule } from "./buyer-routing.module";
import { BuyerComponent } from "./buyer.component";
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
import { MatTabsModule } from "@angular/material/tabs";
import { OrderListComponent } from "../shared/components/order-list/order-list.component";
import { MatChipsModule } from "@angular/material/chips";
import { MatRippleModule } from "@angular/material/core";
import { ProductListPageComponent } from "./pages/product-list-page/product-list-page.component";
import { ProfilePageComponent } from "./pages/profile-page/profile-page.component";
import { ProductViewPageComponent } from "./pages/product-view-page/product-view-page.component";
import { ChatListPageComponent } from "./pages/chat-list-page/chat-list-page.component";
import { ChatPageComponent } from "./pages/chat-page/chat-page.component";
import { HomePageComponent } from './pages/home-page/home-page.component';
import { ViewBlogPageComponent } from './pages/view-blog-page/view-blog-page.component';

@NgModule({
  declarations: [
    BuyerComponent,
    BottomSheetComponent,
    CartComponent,
    CheckoutComponent,
    ProductListPageComponent,
    ProfilePageComponent,
    ProductViewPageComponent,
    ChatListPageComponent,
    ChatPageComponent,
    HomePageComponent,
    ViewBlogPageComponent,
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
    MatRadioModule,
    BottomSheetModule,
    MatSnackBarModule,
    MatTabsModule,
    MatChipsModule,
    MatInputModule,
    MatRippleModule,
  ],
})
export class BuyerModule {}
