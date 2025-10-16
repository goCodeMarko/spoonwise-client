import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import {
  CommonModule,
  LocationStrategy,
  PathLocationStrategy,
} from "@angular/common";
import { AppRoutes } from "./app.routing";
import { AppComponent } from "./app.component";

import { FlexLayoutModule } from "@angular/flex-layout";
import { FullComponent } from "./layouts/full/full.component";
import { AppHeaderComponent } from "./layouts/full/header/header.component";
import { AppSidebarComponent } from "./layouts/full/sidebar/sidebar.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { DemoMaterialModule } from "./demo-material-module";
import { SharedModule } from "./shared/shared.module";
import { SpinnerComponent } from "./shared/spinner.component";
import { HttpRequestService } from "./http-request/http-request.service";
import { PopUpModalComponent } from "./modals/pop-up-modal/pop-up-modal.component";
import { MatInputModule } from "@angular/material/input";
import { AuthService } from "./authorization/auth.service";
import { TokenInterceptorServiceService } from "./token-interceptor/token-interceptor-service.service";
import { LoginComponent } from "./login/login.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { TransactionModule } from "./transaction/transaction.module";
import { SocketService } from "./shared/socket/socket.service";
import { AudioService } from "./shared/audio/audio.service";
import { InternetConnectionService } from "./shared/internet-connection/internet-connection.service";
import { ViewNoteModalComponent } from "./modals/view-note-modal/view-note-modal.component";
import { ViewSnapshotModalComponent } from "./modals/view-snapshot-modal/view-snapshot-modal.component";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { CameraModalComponent } from "./modals/camera-modal/camera-modal.component";
import { ImagePreloadService } from "./shared/services/image-preload.service";
import { ServiceWorkerModule } from "@angular/service-worker";
import { environment } from "../environments/environment";
import { BuyerModule } from "./buyer/buyer.module";
// import { WebcamModule } from "ngx-webcam";
import { StoreModule } from "@ngrx/store";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { cartReducer } from "./shared/store/cart/cart.reducers";
import { orderReducer } from "./shared/store/order/order.reducers";
import { EffectsModule } from "@ngrx/effects";
import { CartEffects } from "./shared/store/cart/cart.effects";
import { OrderEffects } from "./shared/store/order/order.effects";
import { MatFormFieldModule } from "@angular/material/form-field";
import { SellerModule } from "./seller/seller.module";
import { ChatroomEffects } from "./shared/store/chat/chat.effects";
import { chatroomReducer } from "./shared/store/chat/chat.reducer";
import { RegisterComponent } from "./register/register/register.component";
import { MapComponent } from "./shared/components/map/map.component";
import { ViewShopModalComponent } from "./modals/view-shop-modal/view-shop-modal.component";
import { SelectAudienceModalComponent } from "./modals/select-audience-modal/select-audience-modal.component";
import { blogReducer } from "./shared/store/blog/blog.reducer";
import { BlogEffects } from "./shared/store/blog/blog.effects";
import { PipesPipe } from "./line-clamp/shared/pipes.pipe";
import { SwiperModule } from "swiper/angular";

@NgModule({
  declarations: [
    AppComponent,
    FullComponent,
    AppHeaderComponent,
    SpinnerComponent,
    AppSidebarComponent,
    PopUpModalComponent,
    LoginComponent,
    ViewNoteModalComponent,
    ViewSnapshotModalComponent,
    CameraModalComponent,
    RegisterComponent,
    ViewShopModalComponent,
    SelectAudienceModalComponent,
    PipesPipe,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    DemoMaterialModule,
    FormsModule,
    FlexLayoutModule,
    HttpClientModule,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    MatInputModule,
    MatTooltipModule,
    TransactionModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    BuyerModule,
    SellerModule,
    SwiperModule,
    // WebcamModule,
    RouterModule.forRoot(AppRoutes),
    ServiceWorkerModule.register("ngsw-worker.js", {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: "registerWhenStable:30000",
    }),
    StoreModule.forRoot({
      cart: cartReducer,
      order: orderReducer,
      chat: chatroomReducer,
      blog: blogReducer,
    }),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Keeps the last 25 states
    }),
    EffectsModule.forRoot([
      CartEffects,
      OrderEffects,
      ChatroomEffects,
      BlogEffects,
    ]),
  ],
  providers: [
    HttpRequestService,
    SocketService,
    AudioService,
    AuthService,
    InternetConnectionService,
    ImagePreloadService,
    {
      provide: LocationStrategy,
      useClass: PathLocationStrategy,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorServiceService,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
