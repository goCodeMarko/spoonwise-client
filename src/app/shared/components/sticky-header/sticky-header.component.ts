import { Location } from "@angular/common";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { BottomSheetComponent } from "./../bottom-sheet/bottom-sheet.component";
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { Observable } from "rxjs";
import { Store } from "@ngrx/store";
import {
  selectLineItemCount,
  selectOrderQtyCount,
} from "./../../../shared/store/cart/cart.selectors";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-sticky-header",
  templateUrl: "./sticky-header.component.html",
  styleUrls: ["./sticky-header.component.scss"],
})
export class StickyHeaderComponent implements OnInit, OnChanges {
  searchInput: string | null = null;
  lineItemCount$: Observable<number>;
  lineItemCount: number = 0;
  orderQtyCount$: Observable<number>;
  orderQtyCount: number = 0;
  @Input() routerOutletComponent = "";
  @Input() showCart = true;
  @Output() onSearch = new EventEmitter<string | null>();

  constructor(
    private location: Location,
    private store: Store,
    private router: ActivatedRoute,
    private bottomSheet: MatBottomSheet
  ) {
    this.lineItemCount$ = this.store.select(selectLineItemCount);
    this.lineItemCount$.subscribe((data) => {
      this.lineItemCount = data;
    });

    this.orderQtyCount$ = this.store.select(selectOrderQtyCount);
    this.orderQtyCount$.subscribe((data) => {
      this.orderQtyCount = data;
    });
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.routerOutletComponent)
      this.routerOutletComponent = changes.routerOutletComponent.currentValue;

    if (changes.showCart) this.showCart = !!changes.showCart.currentValue;
    0;
    console.log("xxxxxxxx", this.showCart);
  }

  emitSearch() {
    this.onSearch.emit(this.searchInput);
  }

  goBack() {
    this.location.back();
  }

  openBottomSheet(): void {
    this.bottomSheet.open(BottomSheetComponent);
  }
}
