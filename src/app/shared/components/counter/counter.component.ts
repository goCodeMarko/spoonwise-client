import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";

@Component({
  selector: "app-counter",
  templateUrl: "./counter.component.html",
  styleUrls: ["./counter.component.scss"],
})
export class CounterComponent implements OnInit {
  myFormGroup = new FormGroup({
    formField: new FormControl(),
  });

  _value: number = 0;
  _step: number = 1;
  _min: number = 0;
  _max: number = Infinity;
  _wrap: boolean = false;
  color: string = "default";

  @Input("value")
  set inputValue(_value: number) {
    this._value = this.parseNumber(_value);
  }

  @Input()
  set step(_step: number) {
    this._step = this.parseNumber(_step);
  }

  @Input()
  set min(_min: number) {
    this._min = this.parseNumber(_min);
  }

  @Input()
  set max(_max: number) {
    this._max = this.parseNumber(_max);
  }

  @Input()
  set wrap(_wrap: boolean) {
    this._wrap = this.parseBoolean(_wrap);
  }

  @Output() onQtyChange = new EventEmitter<number>();
  constructor() {}

  ngOnInit(): void {}

  private parseNumber(num: any): number {
    return +num;
  }

  private parseBoolean(bool: any): boolean {
    return !!bool;
  }

  setColor(color: string): void {
    this.color = color;
  }

  getColor(): string {
    return this.color;
  }

  updateQty(step: number = 1): void {
    let inputValue = this._value + step;

    if (this._wrap) {
      inputValue = this.wrappedValue(inputValue);
    }

    this._value = inputValue;

    this.onQtyChange.emit(this._value); // Emit updated value
  }

  private wrappedValue(inputValue: number): number {
    if (inputValue > this._max) {
      return this._min;
    }

    if (inputValue < this._min) {
      if (this._max === Infinity) {
        return this._min;
      }

      return this._max + inputValue;
    }

    return inputValue;
  }

  shouldDisableDecrement(inputValue: number): boolean {
    return !this._wrap && inputValue <= this._min;
  }

  shouldDisableIncrement(inputValue: number): boolean {
    return !this._wrap && inputValue >= this._max;
  }
}
