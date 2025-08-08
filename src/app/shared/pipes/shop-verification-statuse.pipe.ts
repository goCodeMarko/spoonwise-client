import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "shopVerificationStatus",
})
export class ShopVerificationStatusPipe implements PipeTransform {
  transform(status: string): string {
    switch (status) {
      case "NOT_STARTED":
        return "Unverified";
      case "IN_PROGRESS":
        return "Pending";
      case "DECLINED":
        return "Declined";
      case "APPROVED":
        return "Verified";
      default:
        return "Unknown Status";
    }
  }
}
