import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { AdminComponent } from "./admin.component";
import { ViewUsersComponent } from "./components/view-users/view-users.component";
import { ShopListComponent } from "./components/shop-list/shop-list.component";
import { SecurityGuard } from "../guards/security.guard";
import { ShopListPageComponent } from "./pages/shop-list-page/shop-list-page.component";

export const AdminRoutes: Routes = [
  {
    path: "",
    component: AdminComponent,
    canActivate: [SecurityGuard],
    children: [{ path: "shops", component: ShopListPageComponent }],
  },
  { path: "**", redirectTo: "" },
];

@NgModule({
  imports: [RouterModule.forChild(AdminRoutes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
