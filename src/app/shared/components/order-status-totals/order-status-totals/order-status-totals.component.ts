import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { IOrderStatusTotals } from "src/app/shared/models/order-status-totals.model";

@Component({
  selector: "app-order-status-totals",
  templateUrl: "./order-status-totals.component.html",
  styleUrls: ["./order-status-totals.component.scss"],
})
export class OrderStatusTotalsComponent implements OnInit, OnChanges {
  @Input() data!: IOrderStatusTotals;
  @Input() onload: boolean = true;

  colorScheme = {
    domain: ["#f8da50"],
  };

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["data"]) {
      this.data = changes["data"].currentValue;
    }

    if (changes["onload"]) {
      this.onload = changes["onload"].currentValue;
    }
  }

  ngOnInit(): void {}
}
