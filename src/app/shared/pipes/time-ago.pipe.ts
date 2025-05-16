import {
  Pipe,
  PipeTransform,
  ChangeDetectorRef,
  NgZone,
  OnDestroy,
} from "@angular/core";

@Pipe({
  name: "timeAgo",
  pure: false, // Important: triggers the pipe regularly
})
export class TimeAgoPipe implements PipeTransform, OnDestroy {
  private timer: any;

  constructor(private cdRef: ChangeDetectorRef, private ngZone: NgZone) {}

  transform(value: Date | string | number): string {
    if (!value) return "";

    this.removeTimer();

    const date = new Date(value);
    const now = new Date();
    const seconds = Math.floor((+now - +date) / 1000);
    const oneDay = 86400;
    const sixDays = 6 * oneDay;

    this.setTimer();

    if (seconds > sixDays) {
      return this.formatMonthDay(date, now); // e.g., May 10
    }

    // For messages older than 1 day, show 'Fri 11:00 PM'
    if (seconds >= oneDay) {
      return this.formatDayAndTime(date);
    }

    if (seconds < 60) {
      return "Just now";
    }

    const intervals: { [key: string]: number } = {
      //   year: 31536000,
      //   month: 2592000,
      //   week: 604800,
      //   day: 86400,
      hr: 3600,
      min: 60,
    };

    for (const unit in intervals) {
      const interval = Math.floor(seconds / intervals[unit]);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
      }
    }

    return "Just now";
  }

  private formatMonthDay(date: Date, now: Date): string {
    const includeYear = date.getFullYear() !== now.getFullYear();

    const options: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "2-digit",
      month: "short", // e.g., May
      day: "numeric", // e.g., 10
      ...(includeYear && { year: "numeric" }), // Only add year if different
    };
    return this.removeLastComma(date.toLocaleString(undefined, options));
  }

  private formatDayAndTime(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short", // Mon, Tue, Wed...
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    return date.toLocaleString(undefined, options);
  }

  private setTimer() {
    // Auto-refresh every 60s, or sooner if desired
    this.ngZone.runOutsideAngular(() => {
      this.timer = setTimeout(() => {
        this.ngZone.run(() => this.cdRef.markForCheck());
      }, 60000); // refresh every 60 seconds
    });
  }

  private removeLastComma(str: string): string {
    const lastCommaIndex = str.lastIndexOf(",");
    if (lastCommaIndex === -1) return str; // no comma to remove

    return str.slice(0, lastCommaIndex) + str.slice(lastCommaIndex + 1);
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
