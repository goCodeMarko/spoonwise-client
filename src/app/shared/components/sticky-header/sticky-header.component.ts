import { Location } from "@angular/common";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { BottomSheetComponent } from "./../bottom-sheet/bottom-sheet.component";
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewContainerRef,
} from "@angular/core";
import { Observable, Subject, takeUntil } from "rxjs";
import { Store } from "@ngrx/store";
import {
  selectLineItemCount,
  selectOrderQtyCount,
} from "./../../../shared/store/cart/cart.selectors";
import { ActivatedRoute, Router } from "@angular/router";
import {
  BottomSheetProvider,
  BottomSheetContent,
} from "swipe-bottom-sheet/angular";
import { Language, SpoonwiseAI } from "../../store/chat/chat.state";
import { selectSpoonwiseAI } from "../../store/chat/chat.selectors";
import { setSendingMessage, setLanguage } from "../../store/chat/chat.actions";
import { ChatSettingsComponent } from "src/app/bottom-sheets/chat-settings/chat-settings.component";

@Component({
  selector: "app-sticky-header",
  templateUrl: "./sticky-header.component.html",
  styleUrls: ["./sticky-header.component.scss"],
})
export class StickyHeaderComponent implements OnInit, OnChanges, OnDestroy {
  searchInput: string | null = null;
  isShopViewing = false;
  orderQtyCount$: Observable<number>;
  orderQtyCount: number = 0;
  chatroomId: string;

  @Input() routerOutletComponent = "";
  @Input() showCart = true;
  @Output() onSearch = new EventEmitter<string | null>();

  private destroy$ = new Subject<void>();

  constructor(
    private location: Location,
    private store: Store,
    private router: ActivatedRoute,
    private bottomSheet: MatBottomSheet,
    private swipeSheet: BottomSheetProvider
  ) {
    this.chatroomId = this.router.snapshot.paramMap.get("id")!;
    this.orderQtyCount$ = this.store.select(selectOrderQtyCount);
    this.orderQtyCount$.subscribe((data) => {
      this.orderQtyCount = data;
    });
  }
  isSpoonwiseAI: boolean = false;
  ngOnInit(): void {
    this.router.queryParams.subscribe((params) => {
      this.isSpoonwiseAI = params.isSpoonwiseAI === "true";
      if (params["shop"]) {
        this.isShopViewing = true;
      } else {
        this.isShopViewing = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log("changes.routerOutletComponent", changes.routerOutletComponent);
    if (changes.routerOutletComponent)
      this.routerOutletComponent = changes.routerOutletComponent.currentValue;

    if (changes.showCart) this.showCart = !!changes.showCart.currentValue;
  }

  emitSearch() {
    this.onSearch.emit(this.searchInput);
  }

  goBack() {
    this.location.back();
  }

  openBottomSheet(): void {
    this.bottomSheet.open(BottomSheetComponent);
  }

  async openSettingSheet() {
    const value = await this.swipeSheet.show(ChatSettingsComponent, {
      title: "",
      props: {
        chatroomId: "XXX",
      },
      stops: [3500, 500],
    });
  }
}
