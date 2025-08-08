import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { AdminComponent } from "./admin.component";
import { ViewUsersComponent } from "./components/view-users/view-users.component";
import { ShopListComponent } from "./components/shop-list/shop-list.component";
import { SecurityGuard } from "../guards/security.guard";
import { ShopListPageComponent } from "./pages/shop-list-page/shop-list-page.component";
import { BlogListPageComponent } from "./pages/blog-list-page/blog-list-page.component";
import { ViewBlogPageComponent } from "./pages/view-blog-page/view-blog-page.component";

export const AdminRoutes: Routes = [
  {
    path: "",
    component: AdminComponent,
    canActivate: [SecurityGuard],
    children: [
      { path: "shops", component: ShopListPageComponent },
      { path: "blogs", component: BlogListPageComponent },
      { path: "blog/:blogId", component: ViewBlogPageComponent },
    ],
  },
  { path: "**", redirectTo: "" },
];

@NgModule({
  imports: [RouterModule.forChild(AdminRoutes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
