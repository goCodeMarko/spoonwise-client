import {
  Pipe,
  PipeTransform,
  ChangeDetectorRef,
  NgZone,
  OnDestroy,
} from "@angular/core";

@Pipe({
  name: "countdown2",
  pure: false,
})
export class CountDown2Pipe implements PipeTransform, OnDestroy {
  private timer: any;

  constructor(private cdRef: ChangeDetectorRef, private ngZone: NgZone) {}

  transform(expiration: Date | string | number): string {
    if (!expiration) return "";

    this.removeTimer();

    const expiryDate = new Date(expiration).getTime();
    const now = Date.now();
    let diff = expiryDate - now;

    if (diff <= 0) return "Expired";

    const oneDay = 24 * 60 * 60 * 1000;
    const twoDays = 2 * oneDay;
    const fiftyNineMinutes = 59 * 60 * 1000;

    // Set refresh rate based on time remaining
    let refreshInterval = 60_000; // 1 minute default
    if (diff <= fiftyNineMinutes) {
      refreshInterval = 1_000; // update every second
    } else if (diff <= twoDays) {
      refreshInterval = 60_000; // update every minute
    } else {
      refreshInterval = oneDay; // update daily
    }
    this.setTimer(refreshInterval);

    // 2 days and above left
    if (diff > twoDays) {
      const days = Math.ceil(diff / oneDay);
      return `${days} day${days > 1 ? "s" : ""} left`;
    }

    //if below two days left
    if (diff <= twoDays && diff > fiftyNineMinutes) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
      return `${this.pad(hours)} hour${hours > 1 ? "s" : ""} ${this.pad(
        minutes
      )} minute${minutes > 1 ? "s" : ""} left`;
    }

    // Less than or equal to 1 hour
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((diff % (60 * 1000)) / 1000);
    return `${this.pad(minutes)} minute${minutes > 1 ? "s" : ""} ${this.pad(
      seconds
    )} second${seconds > 1 ? "s" : ""} left`;
  }

  private pad(num: number): string {
    return num.toString().padStart(2, "0");
  }

  private setTimer(interval: number) {
    this.ngZone.runOutsideAngular(() => {
      this.timer = setTimeout(() => {
        this.ngZone.run(() => this.cdRef.markForCheck());
      }, interval);
    });
  }

  private removeTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  ngOnDestroy(): void {
    this.removeTimer();
  }
}
