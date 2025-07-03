import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AdminRoutes } from "./admin-routing";
import { SharedModule } from "../shared/shared.module";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { AdminComponent } from "./admin.component";
import { ViewUsersComponent } from "./components/view-users/view-users.component";
import { ShopListComponent } from "./components/shop-list/shop-list.component";
import { TableUsersComponent } from "./components/table-users/table-users.component";
import { ShopListPageComponent } from "./pages/shop-list-page/shop-list-page.component";
import { FormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";

@NgModule({
  declarations: [
    AdminComponent,
    ViewUsersComponent,
    TableUsersComponent,
    ShopListComponent,
    ShopListPageComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatInputModule,
    RouterModule.forChild(AdminRoutes),
  ],
})
export class AdminModule {}
