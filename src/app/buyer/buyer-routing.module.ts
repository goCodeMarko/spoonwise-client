import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { BuyerComponent } from "./buyer.component";

import { ProductViewComponent } from "../shared/components/product-view/product-view.component";
import { SecurityGuard } from "../guards/security.guard";
import { CartComponent } from "./pages/cart/cart.component";
import { CheckoutComponent } from "./pages/checkout/checkout.component";
import { ProfileComponent } from "../shared/components/profile/profile.component";
import { DealsPageComponent } from "./pages/deals-page/deals-page.component";
import { ProfilePageComponent } from "./pages/profile-page/profile-page.component";
import { ProductViewPageComponent } from "./pages/product-view-page/product-view-page.component";
import { ChatListPageComponent } from "./pages/chat-list-page/chat-list-page.component";
import { ChatComponent } from "../shared/components/chat/chat.component";
import { HomePageComponent } from "./pages/home-page/home-page.component";
import { ViewBlogPageComponent } from "./pages/view-blog-page/view-blog-page.component";
import { ViewShopPageComponent } from "./pages/view-shop-page/view-shop-page.component";

const BuyerRoutes: Routes = [
  {
    path: "",
    component: BuyerComponent,
    canActivate: [SecurityGuard],
    children: [
      { path: "deals", component: DealsPageComponent },
      {
        path: "home",
        component: HomePageComponent,
      },
      { path: "blog/:blogId", component: ViewBlogPageComponent },
      {
        path: "product/:id",
        component: ProductViewPageComponent,
      },
      {
        path: "cart",
        component: CartComponent,
      },
      {
        path: "checkout",
        component: CheckoutComponent,
      },
      {
        path: "profile",
        component: ProfilePageComponent,
      },
      {
        path: "chats",
        component: ChatListPageComponent,
      },
      {
        path: "chats/:id",
        component: ChatComponent,
      },
      {
        path: "deals/shop/:shopId",
        component: ViewShopPageComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(BuyerRoutes)],
  exports: [RouterModule],
})
export class BuyerRoutingModule {}
