import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import * as _ from "lodash";
import {
  ProductCategory,
  ProductCategoryLabels,
  SpecialOffer,
  SpecialOfferLabels,
} from "./../../../shared/enums/index";

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

  categoryIds = Object.values(ProductCategory);
  categoryLabels = ProductCategoryLabels;
  categoryList: { id: string; label: string }[] = [];

  specialOfferIds = Object.values(SpecialOffer);
  specialOfferLabels = SpecialOfferLabels;
  specialOfferList: { id: string; label: string }[] = [];

  constructor(
    fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.categoryList = Object.keys(this.categoryLabels).map((key: any) => ({
      id: key,
      label: this.categoryLabels[key],
    }));
    this.specialOfferList = Object.keys(this.specialOfferLabels).map(
      (key: any) => ({
        id: key,
        label: this.categoryLabels[key],
      })
    );

    this.extractQueryParam();

    this.categoriesFromLS = JSON.parse(
      localStorage.getItem("categories") ?? "[]"
    );
    this.categoriesFG = fb.group(this.createFormControls(this.categoryLabels));

    this.categoryKeys = Object.keys(this.categoriesFG.controls);

    this.specialOffersFromLS = JSON.parse(
      localStorage.getItem("specialOffers") ?? "[]"
    );

    this.ratingForm = fb.group({
      rating: [this.storeRating, Validators.required],
    });
  }

  ngOnInit(): void {}

  private createFormControls(data: { [key: string]: string }) {
    const controls: { [key: string]: any } = {};

    Object.keys(data).forEach((key) => {
      let val = false;
      if (this.selectedCategories.includes(key)) val = true;

      controls[key] = val;
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
