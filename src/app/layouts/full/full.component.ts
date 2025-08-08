import { MediaMatcher } from "@angular/cdk/layout";
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  AfterViewInit,
} from "@angular/core";
import { MenuItems } from "../../shared/menu-items/menu-items";
import { AuthService } from "src/app/authorization/auth.service";

/** @title Responsive sidenav */
@Component({
  selector: "app-full-layout",
  templateUrl: "full.component.html",
  styleUrls: [],
})
export class FullComponent implements OnDestroy, AfterViewInit {
  mobileQuery: MediaQueryList;
  account;

  private _mobileQueryListener: () => void;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    public menuItems: MenuItems,
    private auth: AuthService
  ) {
    this.account = JSON.parse(this.auth.getUserData());
    this.mobileQuery = media.matchMedia("(min-width: 768px)");
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
  ngAfterViewInit() {}
}
