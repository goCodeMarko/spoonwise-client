import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SellerComponent } from "./seller.component";
import { AddProductComponent } from "./pages/add-product/add-product.component";
import { ProductListPageComponent } from "./pages/product-list-page/product-list-page.component";
import { ProfilePageComponent } from "./pages/profile-page/profile-page.component";
import { ProductViewPageComponent } from "./pages/product-view-page/product-view-page.component";
import { SecurityGuard } from "../guards/security.guard";
import { ChatListPageComponent } from "./pages/chat-list-page/chat-list-page.component";
import { ChatComponent } from "../shared/components/chat/chat.component";
import { VerifyBusinessPageComponent } from "./pages/verify-business-page/verify-business-page.component";
import { HomePageComponent } from "./pages/home-page/home-page.component";
import { ViewBlogPageComponent } from "./pages/view-blog-page/view-blog-page.component";

const SellerRoutes: Routes = [
  {
    path: "",
    component: SellerComponent,
    canActivate: [SecurityGuard],
    children: [
      {
        path: "deals",
        component: ProductListPageComponent,
      },
      {
        path: "home",
        component: HomePageComponent,
      },
      { path: "blog/:blogId", component: ViewBlogPageComponent },
      {
        path: "add-product",
        component: AddProductComponent,
      },
      {
        path: "profile",
        component: ProfilePageComponent,
      },
      {
        path: "profile/verify-business",
        component: VerifyBusinessPageComponent,
      },
      {
        path: "product/:id",
        component: ProductViewPageComponent,
      },
      {
        path: "chats",
        component: ChatListPageComponent,
      },
      {
        path: "chats/:id",
        component: ChatComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(SellerRoutes)],
  exports: [RouterModule],
})
export class SellerRoutingModule {}
