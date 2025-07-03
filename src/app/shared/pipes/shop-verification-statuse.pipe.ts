import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "shopVerificationStatus",
})
export class ShopVerificationStatusPipe implements PipeTransform {
  transform(status: string): string {
    switch (status) {
      case "NOT_STARTED":
        return "Not Yet Submitted";
      case "IN_PROGRESS":
        return "Pending Admin Review";
      case "DECLINED":
        return "Declined by Admin";
      case "APPROVED":
        return "Approved";
      default:
        return "Unknown Status";
    }
  }
}
