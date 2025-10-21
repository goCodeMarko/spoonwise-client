import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { BottomSheetContext } from "swipe-bottom-sheet/angular";

import { Store } from "@ngrx/store";
import { setLanguage } from "src/app/shared/store/chat/chat.actions";
import {
  Language,
  LanguageUI,
  SpoonwiseAI,
} from "src/app/shared/store/chat/chat.state";
import { Observable, Subject, takeUntil } from "rxjs";
import { selectSpoonwiseAI } from "src/app/shared/store/chat/chat.selectors";
@Component({
  selector: "app-chat-settings",
  templateUrl: "./chat-settings.component.html",
  styleUrls: ["./chat-settings.component.scss"],
})
export class ChatSettingsComponent implements OnInit, OnDestroy {
  chatroomId!: string;
  LanguageUI = LanguageUI;
  selectedLanguage: Language = Language.English;
  spoonwise!: SpoonwiseAI;
  spoonwise$!: Observable<SpoonwiseAI>;
  languages: Language[] = [
    Language.English,
    Language.Cebuano,
    Language.Hiligaynon,
    Language.Ilocano,
    Language.Kapampangan,
    Language.Tagalog,
    Language.Waray,
  ];
  private destroy$ = new Subject<void>();

  constructor(public context: BottomSheetContext<any>, private store: Store) {
    this.spoonwise$ = this.store
      .select(selectSpoonwiseAI)
      .pipe(takeUntil(this.destroy$));
  }

  ngOnInit(): void {
    this.spoonwise$.subscribe((data: SpoonwiseAI) => {
      this.selectedLanguage = data.settings!.language;
      this.spoonwise = data;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setLanguage(language: Language) {
    this.store.dispatch(
      setLanguage({
        language: language,
        chatroomId: this.spoonwise._id,
      })
    );

    this.selectedLanguage = language;
  }
}
