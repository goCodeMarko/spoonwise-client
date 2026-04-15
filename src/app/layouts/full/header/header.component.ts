import { Component } from "@angular/core";
import { AuthService } from "../../../authorization/auth.service";
import { Store } from "@ngrx/store";
import { clearCart } from "../../../shared/store/cart/cart.actions";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: [],
})
export class AppHeaderComponent {
  account;
  constructor(
    private auth: AuthService,
    private store: Store,
  ) {
    this.account = JSON.parse(this.auth.getUserData());
  }

  logout() {
    this.store.dispatch(clearCart());
    this.auth.logout();
  }
}
