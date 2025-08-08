import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Audience, AudienceUI } from "src/app/shared/store/blog/blog.state";

@Component({
  selector: "app-select-audience-modal",
  templateUrl: "./select-audience-modal.component.html",
  styleUrls: ["./select-audience-modal.component.scss"],
})
export class SelectAudienceModalComponent implements OnInit {
  AudienceUI = AudienceUI;

  selectedAudience: Audience = Audience.Public;
  audiences: Audience[] = [Audience.Public, Audience.Seller, Audience.Buyer];

  constructor(
    private dialog: MatDialogRef<SelectAudienceModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.selectedAudience = this.data.audience;
  }

  ngOnInit(): void {}

  cancel() {
    this.dialog.close();
  }

  done() {
    this.dialog.close({ selected: this.selectedAudience });
  }

  setAudience(audience: Audience) {
    this.selectedAudience = audience;
  }
}
