import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SellerComponent } from "./seller.component";
import { AddProductComponent } from "./pages/add-product/add-product.component";

const routes: Routes = [
  {
    path: "",
    component: SellerComponent,
    children: [
      {
        path: "add-product",
        component: AddProductComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SellerRoutingModule {}
