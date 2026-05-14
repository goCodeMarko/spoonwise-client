import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "metersToKilometers",
})
export class MetersToKilometersPipe implements PipeTransform {
  transform(value: number | string | null | undefined): number | null {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    const meters = typeof value === "string" ? Number(value) : value;

    if (Number.isNaN(meters)) {
      return null;
    }

    return meters / 1000;
  }
}
