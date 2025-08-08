import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "lineClamp",
})
export class LineClampPipe implements PipeTransform {
  transform(value: string, limit: number = 150): string {
    if (!value) return "";
    return value.length > limit ? value.slice(0, limit) + "..." : value;
  }
}
