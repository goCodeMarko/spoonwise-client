import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { BuyerComponent } from "./buyer.component";
import { ProductListComponent } from "./pages/product-list/product-list.component";
import { ProductViewComponent } from "./pages/product-view/product-view.component";
import { SecurityGuard } from "../guards/security.guard";
import { CartComponent } from "./pages/cart/cart.component";
import { CheckoutComponent } from "./pages/checkout/checkout.component";
import { ProfileComponent } from "./pages/profile/profile.component";

const routes: Routes = [
  {
    path: "",
    component: BuyerComponent,
    canActivate: [SecurityGuard],
    children: [
      { path: "", component: ProductListComponent },
      {
        path: "product/:id",
        component: ProductViewComponent,
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
        component: ProfileComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BuyerRoutingModule {}
