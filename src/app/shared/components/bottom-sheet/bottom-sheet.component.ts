import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import * as _ from "lodash";

@Component({
  selector: "app-bottom-sheet",
  templateUrl: "./bottom-sheet.component.html",
  styleUrls: ["./bottom-sheet.component.scss"],
})
export class BottomSheetComponent implements OnInit {
  categoriesFG: FormGroup;
  categoriesFromLS: any[];
  specialOffersFromLS: any[];
  categoryKeys: string[] = [];
  selectedCategories: any[] = [];
  storeRating = 3;
  ratingForm: FormGroup;
  selectedOffer: string = "";

  constructor(
    fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.extractQueryParam();

    this.categoriesFromLS = JSON.parse(
      localStorage.getItem("categories") ?? "[]"
    );
    this.categoriesFG = fb.group(
      this.createFormControls(this.categoriesFromLS)
    );

    this.categoryKeys = Object.keys(this.categoriesFG.controls);

    this.specialOffersFromLS = JSON.parse(
      localStorage.getItem("specialOffers") ?? "[]"
    );

    this.ratingForm = fb.group({
      rating: [this.storeRating, Validators.required],
    });
  }

  ngOnInit(): void {}

  private createFormControls(data: any) {
    const controls: { [key: string]: any } = {};

    data.forEach((element: any) => {
      let val = false;
      if (this.selectedCategories.includes(element.id)) val = true;
      console.log("element.id", element.id);
      controls[element.id] = val;
    });

    return controls;
  }

  apply() {
    let selectedCategories: any[] = [];
    //for  categories
    Object.keys(this.categoriesFG.controls).forEach((key: any) => {
      if (this.categoriesFG.get(key)?.value) {
        selectedCategories.push(key);
      }
    });

    const categoryQueryValue = selectedCategories.join(" ");
    console.log("selectedCategories", selectedCategories);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        categories: _.size(selectedCategories) ? categoryQueryValue : null,
        page: 1,
        storeRating: this.ratingForm.get("rating")?.value,
        specialOffer: this.selectedOffer,
      },
      queryParamsHandling: "merge",
    });
  }

  private extractQueryParam() {
    this.route.queryParams.subscribe((params) => {
      if (params["categories"]) {
        this.selectedCategories = params["categories"].split(" ");
      }

      if (params["storeRating"]) {
        this.storeRating = params["storeRating"];
      }

      if (params["specialOffer"]) {
        this.selectedOffer = params["specialOffer"];
      }
    });
  }
}
