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
import { BottomSheetComponent } from "./components/bottom-sheet/bottom-sheet.component";
import { MatListModule } from "@angular/material/list";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatSelectModule } from "@angular/material/select";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { NgxStarRatingModule } from "ngx-star-rating";
import { MatRadioModule } from "@angular/material/radio";
import { NgxUsefulSwiperModule } from "ngx-useful-swiper";
import { SwiperModule } from "swiper/angular";

@NgModule({
  declarations: [
    BuyerComponent,
    ProductListComponent,
    ProductViewComponent,
    MapComponent,
    BottomSheetComponent,
  ],
  imports: [
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
    MatFormFieldModule,
    MatCheckboxModule,
    NgxStarRatingModule,
    MatRadioModule,
    SwiperModule,
  ],
})
export class BuyerModule {}
