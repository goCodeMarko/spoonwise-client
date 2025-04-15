import { NgModule } from "@angular/core";

import { MenuItems } from "./menu-items/menu-items";
import {
  AccordionAnchorDirective,
  AccordionLinkDirective,
  AccordionDirective,
} from "./accordion";
import { MatCardModule } from "@angular/material/card";
import { CommonModule } from "@angular/common";
import { LongPressDirective } from "./directives/long-press/long-press.directive";
import { ImageHandlerDirective } from "./directives/image-handler/image-handler.directive";
import { CounterComponent } from "./components/counter/counter.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { FormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatChipsModule } from "@angular/material/chips";
import { StickyHeaderComponent } from "./components/sticky-header/sticky-header.component";
import { MatBadgeModule } from "@angular/material/badge";
import { MatButtonModule } from "@angular/material/button";
import { RouterModule } from "@angular/router";
import { StickyFooterComponent } from "./components/sticky-footer/sticky-footer.component";
import { ImageCachePipe } from "./pipes/image-cache.pipe";

@NgModule({
  declarations: [
    AccordionAnchorDirective,
    AccordionLinkDirective,
    AccordionDirective,
    LongPressDirective,
    ImageHandlerDirective,
    CounterComponent,
    StickyHeaderComponent,
    StickyFooterComponent,
  ],
  imports: [
    MatCardModule,
    CommonModule,
    MatFormFieldModule,
    MatIconModule,
    FormsModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    MatBadgeModule,
    MatButtonModule,
    RouterModule,
  ],
  exports: [
    AccordionAnchorDirective,
    AccordionLinkDirective,
    AccordionDirective,
    LongPressDirective,
    ImageHandlerDirective,
    CounterComponent,
    StickyHeaderComponent,
    StickyFooterComponent,
  ],
  providers: [MenuItems],
})
export class SharedModule {}
