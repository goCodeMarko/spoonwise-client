import { Routes } from "@angular/router";
import { FullComponent } from "./layouts/full/full.component";
import { SecurityGuard } from "./guards/security.guard";
import { LoginComponent } from "./login/login.component";

export const AppRoutes: Routes = [
  // { path: "", redirectTo: "login", pathMatch: "full" }, // Redirect root URL to login
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "",
    component: FullComponent,
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./buyer/buyer.module").then((m) => m.BuyerModule),
        canActivate: [SecurityGuard],
      },
    ],
  },
  {
    path: "shop",
    component: FullComponent,
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./seller/seller.module").then((m) => m.SellerModule),
        canActivate: [SecurityGuard],
      },
    ],
  },
  { path: "**", redirectTo: "login", pathMatch: "full" }, // Wildcard route for unknown routes
];
