import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SellerComponent } from "./seller.component";
import { AddProductComponent } from "./pages/add-product/add-product.component";
import { ProductListPageComponent } from "./pages/product-list-page/product-list-page.component";
import { ProfilePageComponent } from "./pages/profile-page/profile-page.component";
import { ProductViewPageComponent } from "./pages/product-view-page/product-view-page.component";
import { SecurityGuard } from "../guards/security.guard";

const SellerRoutes: Routes = [
  {
    path: "",
    component: SellerComponent,
    canActivate: [SecurityGuard],
    children: [
      {
        path: "",
        component: ProductListPageComponent,
      },
      {
        path: "add-product",
        component: AddProductComponent,
      },
      {
        path: "profile",
        component: ProfilePageComponent,
      },
      {
        path: "product/:id",
        component: ProductViewPageComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(SellerRoutes)],
  exports: [RouterModule],
})
export class SellerRoutingModule {}
