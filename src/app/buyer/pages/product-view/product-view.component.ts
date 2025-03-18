import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { HttpRequestService } from "src/app/http-request/http-request.service";
import * as _ from "lodash";

interface IProduct {
  _id: string;
  shopId: string;
  name: string;
  category: string[];
  images: string[];
  expiryDate: string;
  qty: number;
  price: number;
  specialOffers: string[];
  createdAt: string;
  updatedAt: string;
  description: string;
  shop: {
    _id: string;
    businessName: string;
    logo: string;
    documents: {
      bir: string;
      businessPermit: string;
    };
    address1: string;
    address2: string;
    coordinates: {
      lat: number;
      lon: number;
    };
    createdAt: string;
    updatedAt: string;
  };
  rating: number;
}

// import Swiper core and required components
import SwiperCore, {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Virtual,
  Zoom,
  Autoplay,
  Thumbs,
  Controller,
} from "swiper";

// install Swiper components
SwiperCore.use([
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Virtual,
  Zoom,
  Autoplay,
  Thumbs,
  Controller,
]);

@Component({
  selector: "app-product-view",
  templateUrl: "./product-view.component.html",
  styleUrls: ["./product-view.component.scss"],
})
export class ProductViewComponent implements OnInit {
  product!: IProduct;
  images = [];
  productId: string | null;
  productOnLoad = true;

  constructor(private hrs: HttpRequestService, private route: ActivatedRoute) {
    this.productId = this.route.snapshot.paramMap.get("id");
    console.log(this.productId);
  }

  ngOnInit(): void {
    this.getProduct();
  }

  getProduct() {
    this.productOnLoad = true;

    this.hrs.request(
      "get",
      `product/getProduct/${this.productId}`,
      {},
      async (res: any) => {
        if (res.success && _.has(res, "data")) {
          this.product = res.data;
          this.images = res.data.images;
        } else {
        }
        this.productOnLoad = false;
      }
    );
  }
}
