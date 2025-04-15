import { Pipe, PipeTransform } from "@angular/core";

const imageCache = new Map<string, string>();

@Pipe({ name: "imageCache" })
export class ImageCachePipe implements PipeTransform {
  transform(url: string): string {
    if (!imageCache.has(url)) {
      imageCache.set(url, url);
    }
    return imageCache.get(url)!;
  }
}
