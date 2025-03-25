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

@NgModule({
  declarations: [
    AccordionAnchorDirective,
    AccordionLinkDirective,
    AccordionDirective,
    LongPressDirective,
    ImageHandlerDirective,
    CounterComponent,
  ],
  imports: [
    MatCardModule,
    CommonModule,
    MatFormFieldModule,
    MatIconModule,
    FormsModule,
    MatInputModule,
  ],
  exports: [
    AccordionAnchorDirective,
    AccordionLinkDirective,
    AccordionDirective,
    LongPressDirective,
    ImageHandlerDirective,
    CounterComponent,
  ],
  providers: [MenuItems],
})
export class SharedModule {}
