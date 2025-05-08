import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { BuyerComponent } from "./buyer.component";

import { ProductViewComponent } from "../shared/components/product-view/product-view.component";
import { SecurityGuard } from "../guards/security.guard";
import { CartComponent } from "./pages/cart/cart.component";
import { CheckoutComponent } from "./pages/checkout/checkout.component";
import { ProfileComponent } from "../shared/components/profile/profile.component";
import { ProductListPageComponent } from "./pages/product-list-page/product-list-page.component";
import { ProfilePageComponent } from "./pages/profile-page/profile-page.component";
import { ProductViewPageComponent } from "./pages/product-view-page/product-view-page.component";

const BuyerRoutes: Routes = [
  {
    path: "",
    component: BuyerComponent,
    canActivate: [SecurityGuard],
    children: [
      { path: "", component: ProductListPageComponent },
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
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(BuyerRoutes)],
  exports: [RouterModule],
})
export class BuyerRoutingModule {}
