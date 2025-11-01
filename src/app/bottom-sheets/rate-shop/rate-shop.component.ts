import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BottomSheetContext } from "swipe-bottom-sheet/angular";
import { Store } from "@ngrx/store";
import { setReviews } from "src/app/shared/store/order/order.actions";

@Component({
  selector: "app-rate-shop",
  templateUrl: "./rate-shop.component.html",
  styleUrls: ["./rate-shop.component.scss"],
})
export class RateShopComponent implements OnInit {
  public storeRateBtnOnLoad = false;
  public shopId = "";
  public orderId = "";
  public storeRating = 5;
  public ratingForm: FormGroup;
  public storeComment = "";
  constructor(
    private fb: FormBuilder,
    private store: Store,
    private context: BottomSheetContext<RateShopComponent>
  ) {
    this.ratingForm = this.fb.group({
      rating: [this.storeRating, Validators.required],
      comment: [this.storeComment],
    });
  }

  ngOnInit(): void {}

  storeRate() {
    const rating = this.ratingForm.get("rating")?.value;
    const comment = this.ratingForm.get("comment")?.value;
    this.storeRateBtnOnLoad = false;
    this.store.dispatch(
      setReviews({
        orderId: this.orderId,
        shopId: this.shopId,
        rating,
        comment,
      })
    );

    this.context.dismiss();
  }
}
