import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Route, Router } from "@angular/router";
import { FormControl } from "@angular/forms";
import { HttpRequestService } from "../http-request/http-request.service";
import * as _ from "lodash";
import { AuthService } from "../authorization/auth.service";
import { Location } from "@angular/common";
import { Store } from "@ngrx/store";
import { Observable, Subject, Subscription, takeUntil } from "rxjs";

import {
  selectLineItemCount,
  selectOrderQtyCount,
} from "./../shared/store/cart/cart.selectors";
import { SocketService } from "../shared/socket/socket.service";
import { setCart } from "../shared/store/cart/cart.actions";
import { setToPay } from "../shared/store/order/order.actions";
import {
  chatroomSort,
  checkChatroomExistsInStore,
  chunksReceivedFromAI,
  plusOneToSentDeliveredCounter,
  setChatrooms,
  setSendingMessage,
  setTotalCountSentDeliveredMessages,
  updateChatroomsMsgStatusToDelivered,
  updateChatroomsMsgStatusToSeen,
} from "../shared/store/chat/chat.actions";
import { GeolocationService } from "../shared/services/geolocation/geolocation.service";
import { getSavedBlogs } from "../shared/store/blog/blog.actions";

@Component({
  selector: "app-buyer",
  templateUrl: "./buyer.component.html",
  styleUrls: ["./buyer.component.scss"],
})
export class BuyerComponent implements OnInit, OnDestroy {
  selectControl = new FormControl("latest"); // Default value
  routerOutletComponent: any;
  shops: any[] = [];
  subject: object = {};
  radius: number = 3000;
  isMapLoading: boolean = true;
  orderQtyCount$: Observable<number>;
  orderQtyCount: number = 0;
  onNewChatMessage: Subscription;
  onUpdateChatroomsMsgStatusToDelivered: Subscription;
  onUpdateChatroomsMsgStatusToSeen: Subscription;
  onReceivedChunksFromAI: Subscription;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private hrs: HttpRequestService,
    private auth: AuthService,
    private store: Store,
    private socket: SocketService,
    private geolocationService: GeolocationService
  ) {
    this.socket.connect();

    this.onNewChatMessage = this.socket
      .onNewChatMessage()
      .subscribe((data: any) => {
        console.log("Message Received", data);

        this.markSenderMessagesAsDelivered();

        this.store.dispatch(
          setSendingMessage({
            message: data.message,
            isSpoonwiseAI: data.isAIAgent,
          })
        );
        this.store.dispatch(
          plusOneToSentDeliveredCounter({
            message: data.message,
            isSpoonwiseAI: data.isAIAgent,
          })
        );

        if (!data.isAIAgent) {
          this.store.dispatch(
            checkChatroomExistsInStore({ chatroom: data.chatroom })
          );
          this.store.dispatch(chatroomSort({ message: data.message }));
        }
      });

    this.orderQtyCount$ = this.store.select(selectOrderQtyCount);

    this.orderQtyCount$.subscribe((data) => {
      this.orderQtyCount = data;
    });

    this.onUpdateChatroomsMsgStatusToDelivered = this.socket
      .onUpdateChatroomsMsgStatusToDelivered()
      .subscribe((updatedChatrooms: any) => {
        console.log("Buyer onUpdateChatroomsMsgStatusToDelivered");
        this.store.dispatch(
          updateChatroomsMsgStatusToDelivered({
            updatedchatroomsMsg: updatedChatrooms,
          })
        );
      });

    this.onUpdateChatroomsMsgStatusToSeen = this.socket
      .onUpdateChatroomsMsgStatusToSeen()
      .subscribe((updatedChatroom: any) => {
        console.log(" Buyer onUpdateChatroomsMsgStatusToSeen", updatedChatroom);
        this.store.dispatch(
          updateChatroomsMsgStatusToSeen({
            updatedChatroom,
          })
        );
      });

    this.onReceivedChunksFromAI = this.socket
      .onReceivedChunksFromAI()
      .subscribe((data) => {
        this.store.dispatch(
          chunksReceivedFromAI({
            chunks: data.chunks,
            tempMessageId: data.temporaryMessageId,
          })
        );
      });
  }
  isShopViewing = false;
  ngOnInit(): void {
    this.markSenderMessagesAsDelivered();

    // this.subject = JSON.parse(this.auth.getUserData());
    this.getShops();
    this.getCategories();
    this.getSpecialOffers();

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        console.log("params", params);
        if (params.radius) this.radius = params.radius;
      });

    this.route.queryParams.subscribe((params) => {
      console.log("params------", params.shop);
      if (params["shop"]) {
        this.isShopViewing = true;
      } else {
        this.isShopViewing = false;
      }
    });

    this.store.dispatch(setCart());
    this.store.dispatch(setToPay());
    this.store.dispatch(setTotalCountSentDeliveredMessages());
    this.store.dispatch(setChatrooms());
    this.store.dispatch(getSavedBlogs());
  }

  ngOnDestroy(): void {
    this.socket.disconnect();
    this.onUpdateChatroomsMsgStatusToDelivered.unsubscribe();
    this.onNewChatMessage.unsubscribe();
    this.onUpdateChatroomsMsgStatusToSeen.unsubscribe();
    this.onReceivedChunksFromAI.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  getCategories() {
    this.hrs.request("get", "category/getCategories", {}, async (res: any) => {
      if (res.success && _.has(res, "data")) {
        localStorage.setItem("categories", JSON.stringify(res.data));
      }
    });
  }

  async onMapDragend(e: any) {
    console.log("Buyer::onMapDragend", e);
    try {
      await this.updatedCoordinates(e);
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          lat: e.lat,
          lng: e.lng,
        },
        queryParamsHandling: "merge",
      });
    } catch (error) {
      console.log("error", error);
    }
  }

  updatedCoordinates(coordinates: { lat: string; lng: string }) {
    return new Promise((resolve, reject) => {
      this.hrs.request(
        "put",
        `user/updateBuyerLocation`,
        {
          coordinates,
        },
        async (res: any) => {
          if (res.success) resolve(res);
          else reject(res);
        }
      );
    });
  }

  getShops() {
    this.hrs.request("get", "shop/getShops", {}, async (res: any) => {
      console.log("----shop/getShops", res);
      if (res.success && _.has(res, "data")) {
        this.shops = res.data;
      }

      this.isMapLoading = false;
    });
  }

  getSpecialOffers() {
    this.hrs.request(
      "get",
      "specialOffer/getSpecialOffers",
      {},
      async (res: any) => {
        if (res.success && _.has(res, "data")) {
          localStorage.setItem("specialOffers", JSON.stringify(res.data));
        }
      }
    );
  }

  fromRouterOutlet(component: any) {
    console.log("=====================================", component.constructor);
    const name = component.constructor["componentName"] || "unknown";
    console.log("&&&&&&&&&&&&&&&&&&&&&", name);
    this.routerOutletComponent = name;
  }

  search(searchInput?: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: searchInput ? searchInput : null,
        page: 1,
      },
      queryParamsHandling: "merge",
    });
  }

  markSenderMessagesAsDelivered() {
    this.hrs.request(
      "put",
      `message/updateChatroomsMsgStatusToDelivered`,
      {},
      (response: any) => {
        console.log("======updateChatroomsMsgStatusToDelivered", response);
      }
    );
  }
}
