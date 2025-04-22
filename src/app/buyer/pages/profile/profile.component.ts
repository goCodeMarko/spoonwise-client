import { Component, OnDestroy, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import {
  setCancelled,
  setForPickup,
  setForReview,
  setToPack,
  setToPay,
  setToReceive,
} from "./../../../shared/store/order/order.actions";
import { selectPoints } from "./../../../shared/store/order/order.selectors";
import { AuthService } from "src/app/authorization/auth.service";
import { takeUntil } from "rxjs/operators";
import { Observable, Subject } from "rxjs";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
})
export class ProfileComponent implements OnInit, OnDestroy {
  static componentName = "ProfileComponent";
  selectedTab = "to_pay";
  points: number = 0;
  points$: Observable<number>;
  authUser: any;
  private destroy$ = new Subject<void>();

  constructor(private store: Store, private auth: AuthService) {
    this.authUser = JSON.parse(this.auth.getUserData());

    this.points$ = this.store
      .select(selectPoints)
      .pipe(takeUntil(this.destroy$));
  }

  ngOnInit(): void {
    this.points$.subscribe((data) => {
      this.points = data;
    });

    this.store.dispatch(setToPay());
    this.store.dispatch(setForReview());
    this.store.dispatch(setToPack());
    this.store.dispatch(setForPickup());
    this.store.dispatch(setToReceive());
    this.store.dispatch(setCancelled());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    this.auth.logout();
  }

  onTabChange(event: any) {
    switch (event.index) {
      case 0:
        this.selectedTab = "to_pay";
        break;
      case 1:
        this.selectedTab = "for_review";
        break;
      case 2:
        this.selectedTab = "to_pack";
        break;
      case 3:
        this.selectedTab = "for_pickup";
        break;
      case 4:
        this.selectedTab = "to_receive";
        break;
      case 5:
        this.selectedTab = "cancelled";
        break;
    }
  }
}
