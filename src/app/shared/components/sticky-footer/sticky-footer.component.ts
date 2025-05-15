import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { Observable } from "rxjs";
import { Store } from "@ngrx/store";
import {
  selectLineItemCount,
  selectOrderQtyCount,
} from "./../../../shared/store/cart/cart.selectors";
import { ActivatedRoute, Router } from "@angular/router";
import { Location } from "@angular/common";
import { selectAllSentMessageCount } from "../../store/chat/chat.selectors";

@Component({
  selector: "app-sticky-footer",
  templateUrl: "./sticky-footer.component.html",
  styleUrls: ["./sticky-footer.component.scss"],
})
export class StickyFooterComponent implements OnInit {
  lineItemCount$: Observable<number>;
  lineItemCount: number = 0;
  totalCountSentDeliveredMessages$: Observable<number>;
  totalCountSentDeliveredMessages: number = 0;
  @Input() showCart = true;
  @Input() isShop = false;

  constructor(
    private location: Location,
    private store: Store,
    private router: ActivatedRoute
  ) {
    this.lineItemCount$ = this.store.select(selectLineItemCount);
    this.lineItemCount$.subscribe((data) => {
      this.lineItemCount = data;
    });

    this.totalCountSentDeliveredMessages$ = this.store.select(
      selectAllSentMessageCount
    );
    this.totalCountSentDeliveredMessages$.subscribe((data) => {
      this.totalCountSentDeliveredMessages = data;
    });
  }

  ngOnInit(): void {}
}
