import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  Renderer2,
} from "@angular/core";

@Directive({
  selector: "[imageHandler]",
})
export class ImageHandlerDirective implements OnInit {
  @Input("loaderImage") loaderImage!: string;
  public img!: string;
  constructor(private element: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.img = this.element.nativeElement.src;
    // Check if image is loaded, otherwise set default image
    this.setDefaultImage();
  }

  @HostListener("error", ["$event"])
  onError(event: Event) {
    console.error("Image load error:", event);

    // this.setDefaultImage();
  }

  @HostListener("load")
  onLoad() {
    if (this.element.nativeElement.src !== this.img) {
      this.renderer.removeClass(this.element.nativeElement, "gs-image-loader");
    }
  }

  private setDefaultImage() {
    if (
      !this.element.nativeElement.complete ||
      this.element.nativeElement.naturalHeight === 0
    ) {
      this.renderer.addClass(this.element.nativeElement, "gs-image-loader");
      this.element.nativeElement.src = this.loaderImage;
    }
  }
}
