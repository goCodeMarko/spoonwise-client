import { Injectable, Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "orderStatusPipe",
})
@Injectable({
  providedIn: "root",
})
export class OrderStatusPipe implements PipeTransform {
  transform(status: string): string {
    switch (status) {
      case "TO_PAY":
        return "To Pay";
      case "FOR_REVIEW":
        return "For Review";
      case "TO_PACK":
        return "To Pack";
      case "FOR_PICKUP":
        return "For Pickup";
      case "TO_RECEIVE":
        return "To Receive";
      default:
        return "Canceled";
    }
  }
}
