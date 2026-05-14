import { NgModule } from "@angular/core";

import { MenuItems } from "./menu-items/menu-items";
import {
  AccordionAnchorDirective,
  AccordionLinkDirective,
  AccordionDirective,
} from "./accordion";
import { MatCardModule } from "@angular/material/card";
import { CommonModule } from "@angular/common";
import { LongPressDirective } from "./directives/long-press/long-press.directive";
import { ImageHandlerDirective } from "./directives/image-handler/image-handler.directive";
import { CounterComponent } from "./components/counter/counter.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatChipsModule } from "@angular/material/chips";
import { StickyHeaderComponent } from "./components/sticky-header/sticky-header.component";
import { MatBadgeModule } from "@angular/material/badge";
import { MatButtonModule } from "@angular/material/button";
import { RouterModule } from "@angular/router";
import { StickyFooterComponent } from "./components/sticky-footer/sticky-footer.component";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { ProductListComponent } from "./components/product-list/product-list.component";
import { MatOptionModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { MatRadioButton, MatRadioModule } from "@angular/material/radio";
import { ProfileComponent } from "./components/profile/profile.component";
import { MatTabsModule } from "@angular/material/tabs";
import { ProductViewComponent } from "./components/product-view/product-view.component";
import { SwiperModule } from "swiper/angular";
import { NgxStarRatingModule } from "ngx-star-rating";
import { OrderListComponent } from "./components/order-list/order-list.component";
import { ChatListComponent } from "./components/chat-list/chat-list.component";
import { ChatComponent } from "./components/chat/chat.component";
import { TimeAgoPipe } from "./pipes/time-ago.pipe";
import { MapComponent } from "./components/map/map.component";
import { allowedEmailDomainsValidator } from "./form-validators/allowed-email-domains.validator";
import { OtpBottomSheetComponent } from "./components/otp-bottom-sheet/otp-bottom-sheet.component";
import { CountDownPipe } from "./pipes/count-down.pipe";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { ShopVerificationStatusPipe } from "./pipes/shop-verification-statuse.pipe";
import { VerifyBusinessComponent } from "./components/verify-business/verify-business.component";
import { MatStep, MatStepperModule } from "@angular/material/stepper";
import { LineClampPipe } from "./pipes/line-clamp/line-clamp.pipe";
import { BlogListComponent } from "./components/blog-list/blog-list/blog-list.component";
import { ViewBlogComponent } from "./components/view-blog/view-blog.component";
import { HomeListComponent } from "./components/home-list/home-list.component";
import { CountDown2Pipe } from "./pipes/count-down2.pipe";
import { DashboardComponent } from "./components/dashboard/dashboard/dashboard.component";
import { OrderStatusTotalsComponent } from "./components/order-status-totals/order-status-totals/order-status-totals.component";
import { OrderStatusPipe } from "./pipes/order-status.pipe";
import { MetersToKilometersPipe } from "./pipes/meters-to-kilometers.pipe";
import { NgxChartsModule } from "@swimlane/ngx-charts";

@NgModule({
  declarations: [
    AccordionAnchorDirective,
    AccordionLinkDirective,
    AccordionDirective,
    LongPressDirective,
    ImageHandlerDirective,
    CounterComponent,
    StickyHeaderComponent,
    StickyFooterComponent,
    ProductListComponent,
    ProfileComponent,
    ProductViewComponent,
    OrderListComponent,
    ChatListComponent,
    ChatComponent,
    TimeAgoPipe,
    CountDownPipe,
    CountDown2Pipe,
    ShopVerificationStatusPipe,
    MapComponent,
    OtpBottomSheetComponent,
    VerifyBusinessComponent,
    LineClampPipe,
    BlogListComponent,
    ViewBlogComponent,
    HomeListComponent,
    OrderStatusPipe,
    MetersToKilometersPipe,
    OrderStatusTotalsComponent,
    DashboardComponent,
  ],
  imports: [
    MatCardModule,
    CommonModule,
    MatFormFieldModule,
    MatIconModule,
    FormsModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    MatBadgeModule,
    MatButtonModule,
    RouterModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    SwiperModule,
    NgxStarRatingModule,
    MatSnackBarModule,
    MatStepperModule,
    MatRadioModule,
    NgxChartsModule,
  ],
  exports: [
    AccordionAnchorDirective,
    AccordionLinkDirective,
    AccordionDirective,
    LongPressDirective,
    ImageHandlerDirective,
    CounterComponent,
    StickyHeaderComponent,
    StickyFooterComponent,
    ProductListComponent,
    ProfileComponent,
    ProductViewComponent,
    NgxStarRatingModule,
    OrderListComponent,
    ChatListComponent,
    ChatComponent,
    TimeAgoPipe,
    CountDownPipe,
    CountDown2Pipe,
    ShopVerificationStatusPipe,
    LineClampPipe,
    OrderStatusPipe,
    MetersToKilometersPipe,
    MapComponent,
    VerifyBusinessComponent,
    BlogListComponent,
    ViewBlogComponent,
    HomeListComponent,
    OrderStatusTotalsComponent,
    DashboardComponent,
  ],
  providers: [MenuItems],
})
export class SharedModule {}
