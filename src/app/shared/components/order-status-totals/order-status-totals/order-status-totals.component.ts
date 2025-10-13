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
  x = [
    {
      name: "Sales",
      series: [
        { name: "Oct 1", value: 150 },
        { name: "Oct 2", value: 250 },
        { name: "Oct 3", value: 180 },
        { name: "Oct 4", value: 300 },
        { name: "Oct 5", value: 400 },
      ],
    },
    {
      name: "Incoming",
      series: [
        { name: "Oct 1", value: 300 },
        { name: "Oct 2", value: 12 },
        { name: "Oct 3", value: 500 },
        { name: "Oct 4", value: 345 },
        { name: "Oct 5", value: 120 },
      ],
    },
  ];

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

  ngOnInit(): void {
    console.log("-----------data", this.data);
  }
}
