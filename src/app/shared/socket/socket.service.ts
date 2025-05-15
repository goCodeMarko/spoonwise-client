import { Injectable, OnDestroy } from "@angular/core";
import { Observable, Subscribable, Subscriber, Subscription } from "rxjs";
import { Socket, io } from "socket.io-client";
import { AuthService } from "src/app/authorization/auth.service";
import { environment } from "src/environments/environment";

type strings =
  | "updateTransactionStatus"
  | "newCashout"
  | "updateCashout"
  | "newCashin"
  | "updateCashin"
  | "updateTransactionDetails";
@Injectable({
  providedIn: "root",
})
export class SocketService implements OnDestroy {
  private socket!: Socket;
  private data: any;
  private getUserDataSubscriber: Subscription;

  constructor(private auth: AuthService) {
    this.getUserDataSubscriber = this.auth.getUserData$().subscribe((user) => {
      this.data = user;
    });
  }

  ngOnDestroy(): void {
    this.getUserDataSubscriber.unsubscribe();
  }

  connect(): void {
    console.log("this.data.role", this.data.role);
    this.socket = io(environment.WEBSOCKET_MAIN, {
      auth: {
        role: this.data.role,
        userId: this.data._id,
        shopId: this.data.shop,
      },
    });

    this.socket.on("connect", () => {
      console.log("Connected socket ID:", this.socket.id);
    });
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  disconnect(): void {
    if (this.socket) this.socket.disconnect();
  }

  public sendMessage(message: { type: strings; data: any }): void {
    this.socket.emit("message", message);
  }

  public onMessage(): Observable<{ type: strings; data: any }> {
    return new Observable<{ type: strings; data: any }>((observer) => {
      this.socket.on("message", (message: { type: strings; data: any }) => {
        observer.next(message);
      });
    });
  }

  public onOrderListSocketUpdate(): Observable<{ data: any }> {
    console.log("listening On onOrderListSocketUpdate Socket");
    return new Observable<{ data: any }>((observer) => {
      this.socket.on("onOrderListSocketUpdate", (message: any) => {
        observer.next(message);
      });
    });
  }

  public onNewOrder(): Observable<{ data: any }> {
    console.log("listening On onNewOrder Socket");
    return new Observable<{ data: any }>((observer) => {
      this.socket.on("onNewOrder", (message: any) => {
        observer.next(message);
      });
    });
  }

  public onPaidOrder(): Observable<{ data: any }> {
    console.log("listening On onPaidOrder Socket");
    return new Observable<{ data: any }>((observer) => {
      this.socket.on("onPaidOrder", (message: any) => {
        observer.next(message);
      });
    });
  }

  public onExpirePaymentOrder(): Observable<{ data: any }> {
    console.log("listening On onExpirePaymentOrder Socket");
    return new Observable<{ data: any }>((observer) => {
      this.socket.on("onExpirePaymentOrder", (message: any) => {
        observer.next(message);
      });
    });
  }

  public onLalamoveStatusChange(): Observable<{ data: any }> {
    console.log("listening On onLalamoveStatusChange Socket");
    return new Observable<{ data: any }>((observer) => {
      this.socket.on("onLalamoveStatusChange", (message: any) => {
        observer.next(message);
      });
    });
  }

  public onNewChatMessage(): Observable<{ data: any }> {
    console.log("listening On onNewChatMessage Socket");
    return new Observable<{ data: any }>((observer) => {
      this.socket.on("onNewChatMessage", (message: any) => {
        observer.next(message);
      });
    });
  }

  public onUpdateChatroomsMsgStatusToDelivered(): Observable<{ data: any }> {
    console.log("listening On onUpdateChatroomsMsgStatusToDelivered Socket");
    return new Observable<{ data: any }>((observer) => {
      this.socket.on(
        "onUpdateChatroomsMsgStatusToDelivered",
        (updatedChatrooms: any) => {
          observer.next(updatedChatrooms);
        }
      );
    });
  }

  public onUpdateChatroomsMsgStatusToSeen(): Observable<{ data: any }> {
    console.log("listening On onUpdateChatroomsMsgStatusToSeen Socket");
    return new Observable<{ data: any }>((observer) => {
      this.socket.on(
        "onUpdateChatroomsMsgStatusToSeen",
        (updatedChatroom: any) => {
          observer.next(updatedChatroom);
        }
      );
    });
  }
}
