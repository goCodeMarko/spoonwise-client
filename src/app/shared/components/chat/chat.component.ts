import {
  Component,
  OnDestroy,
  OnInit,
  NgZone,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { Store } from "@ngrx/store";
import { selectSortedChatroomMessages } from "../../store/chat/chat.selectors";
import { Message } from "../../store/chat/chat.state";
import { Observable, Subject, Subscription } from "rxjs";
import { ActivatedRoute, Route, Router } from "@angular/router";
import { takeUntil } from "rxjs/operators";
import { AuthService, IUserData } from "src/app/authorization/auth.service";
import {
  chunksReceivedFromAI,
  sendingToSentMessage,
  sendMessage,
  sendMessageFailure,
  setPastChatroomsFailure,
  setPastMessages,
  setPastMessagesSuccess,
  setSendingMessage,
  setTotalCountSentDeliveredMessages,
  updateChatroomsMsgStatusToSeen,
} from "../../store/chat/chat.actions";
import _, { random, size } from "lodash";
import { ObjectId } from "bson";
import { Actions, ofType } from "@ngrx/effects";
import { sendMessageSuccess } from "../../../shared/store/chat/chat.actions";
import { HttpRequestService } from "src/app/http-request/http-request.service";
import { SocketService } from "../../socket/socket.service";
import { take } from "rxjs/operators";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"],
})
export class ChatComponent implements OnInit, OnDestroy {
  static componentName = "ChatComponent";
  chatroomMessages$: Observable<Message[] | []>;
  chatroomMessages: Message[] | [] = [];
  chatroomId: string;
  isSpoonwiseAI: string;
  authUser!: IUserData;
  private destroy$ = new Subject<void>();
  text = "";
  onNewChatMessage: Subscription;
  onAIStreamComplete: Subscription;

  fromAI = "";
  @ViewChild("chatContainer", { static: false }) chatContainer!: ElementRef;
  @ViewChild("openCameraInput") openCameraInput!: ElementRef;
  @ViewChild("openGalleryInput") openGalleryInput!: ElementRef;

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private auth: AuthService,
    private actions$: Actions,
    private hrs: HttpRequestService,
    private socket: SocketService,
    private ngZone: NgZone
  ) {
    this.chatroomId = this.route.snapshot.paramMap.get("id")!;
    this.isSpoonwiseAI =
      this.route.snapshot.queryParamMap.get("isSpoonwiseAI")!;
    this.auth.getUserData$().subscribe((user) => {
      this.authUser = user;
      console.log(this.authUser);
    });
    this.chatroomMessages$ = this.store
      .select(
        selectSortedChatroomMessages(
          this.chatroomId,
          this.isSpoonwiseAI === "true"
        )
      )
      .pipe(takeUntil(this.destroy$));
    this.chatroomMessages$.subscribe((data) => {
      console.log("=====================messages", data);
      this.chatroomMessages = data;
    });

    this.onNewChatMessage = this.socket
      .onNewChatMessage()
      .pipe(takeUntil(this.destroy$))
      .subscribe((message: any) => {
        console.log("------------this.isSpoonwiseAI", this.isSpoonwiseAI);
        this.markSenderMessagesAsSeen();
      });

    this.onAIStreamComplete = this.socket
      .onAIStreamComplete()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.markSenderMessagesAsSeen();
      });
  }

  ngOnInit(): void {
    this.actions$
      .pipe(ofType(sendMessageSuccess), takeUntil(this.destroy$))
      .subscribe(({ message, isSpoonwiseAI = false }) => {
        console.log("---sendMessageSuccess", message);
        this.store.dispatch(
          sendingToSentMessage({
            chatroomId: message.chatroomId!,
            elementId: message.elementId,
            isSpoonwiseAI,
          })
        );
      });

    this.actions$
      .pipe(ofType(setPastMessagesSuccess), takeUntil(this.destroy$))
      .subscribe(({ chatroomId, messages }) => {
        if (size(messages) === 0) this.allMessageHasBeenDisplayed = true;
        this.onLoad = false;
      });

    this.actions$
      .pipe(ofType(setPastMessagesSuccess), takeUntil(this.destroy$))
      .subscribe(() => {
        this.onLoad = false;
      });

    this.markSenderMessagesAsSeen();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.onNewChatMessage.unsubscribe();
  }

  trackByMessageId(index: number, message: any): string {
    return message._id;
  }

  allMessageHasBeenDisplayed = false;
  onLoad = false;
  onScroll(): void {
    const container = this.chatContainer.nativeElement as HTMLElement;
    const isAtTop =
      Math.ceil(Math.abs(container.scrollTop) + container.clientHeight) ===
      container.scrollHeight - 1;

    console.log(
      "-----------  Math.ceil(Math.abs(container.scrollTop) + container.clientHeight)",
      Math.ceil(Math.abs(container.scrollTop) + container.clientHeight)
    );

    console.log("----------- container.scrollHeight", container.scrollHeight);

    console.log("-----------isAtTop", isAtTop);
    if (isAtTop && !this.onLoad && !this.allMessageHasBeenDisplayed) {
      console.log("chatroomMessages", this.chatroomMessages);
      this.onLoad = true;

      this.store.dispatch(
        setPastMessages({
          chatroomId: this.chatroomId,
          lastMessageDate:
            this.chatroomMessages[this.chatroomMessages.length - 1].createdAt,
        })
      );
    }
  }

  sendMessage() {
    const { role } = this.authUser;
    const elementId = new ObjectId().toHexString();
    const senderId =
      role === "seller" ? this.authUser.shop?._id : this.authUser._id;

    if (!senderId) {
      console.error("Sender ID is undefined!");
      return;
    }

    let message: Message = {
      elementId,
      chatroomId: this.chatroomId,
      senderId,
      content: {
        message: this.text,
      },
      status: "SENDING",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (this.forUploadImage) {
      message.content.attachments = [{ url: this.forUploadImage }];
    }

    if (this.isSpoonwiseAI === "true") {
      // when query param is true
      message.isAIAgent = false; //  all message sent via this component is from the user
    }

    this.store.dispatch(
      setSendingMessage({
        message,
        isSpoonwiseAI: this.isSpoonwiseAI === "true",
        forUploadImage: this.forUploadImage,
      })
    );
    this.store.dispatch(
      sendMessage({
        message,
        forUploadImage: this.forUploadImage,
      })
    );
    this.forUploadImage = "";
    this.text = "";
    console.log("sending message", message);
  }

  markSenderMessagesAsSeen() {
    this.hrs.request(
      "put",
      `message/updateChatroomsMsgStatusToSeen/${this.chatroomId}?isSpoonwiseAI=${this.isSpoonwiseAI}`,
      {},
      (response: any) => {
        console.log("======response", response);
        if (response.success) {
          this.store.dispatch(
            updateChatroomsMsgStatusToSeen({ updatedChatroom: response.data })
          );
        }
      }
    );
  }

  forUploadImage: string = "";
  removeForUpload() {
    this.forUploadImage = "";
  }
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement; // Cast the event target to HTMLInputElement to access the files
    if (input.files && input.files[0]) {
      if (_.size(input.files) == 1) {
        // Ensure a file was selected (non-null and at least one file)
        const file = input.files[0]; // Get the first selected file
        const reader = new FileReader(); // Create a FileReader to read the file

        reader.readAsDataURL(file); // Read the file as a Base64 data URL

        reader.onload = (e: ProgressEvent<FileReader>) => {
          // Define what to do when file reading is complete
          const imgSrc = e.target!.result as string; // Get the Base64 image string
          const image = new Image();

          image.src = imgSrc;
          image.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d")!;

            // Example: force smaller size for extra compression
            const targetWidth = 800;
            const targetHeight = (image.height / image.width) * targetWidth;

            canvas.width = targetWidth;
            canvas.height = targetHeight;

            ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

            // Step 3: Get lower quality Base64
            const finalBase64 = canvas.toDataURL("image/jpeg", 0.2); // 0.2 = 20% quality
            console.log(finalBase64);
            this.forUploadImage = finalBase64;
          };
        };
      }
    }
  }

  public openCamera(): void {
    this.openCameraInput.nativeElement.click();
  }

  public openGallery(): void {
    this.openGalleryInput.nativeElement.click();
  }
}
