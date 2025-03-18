import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { BuyerComponent } from "./buyer.component";
import { ProductListComponent } from "./pages/product-list/product-list.component";
import { ProductViewComponent } from "./pages/product-view/product-view.component";
import { SecurityGuard } from "../guards/security.guard";

const routes: Routes = [
  {
    path: "",
    component: BuyerComponent,
    children: [
      { path: "", component: ProductListComponent },
      {
        path: "product/:id",
        component: ProductViewComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BuyerRoutingModule {}
