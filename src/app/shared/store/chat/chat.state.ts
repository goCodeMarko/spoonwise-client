export interface IUpdateChatroomsMsgStatusToDelivered {
  chatroomUpdated: {
    chatroomId: string;
    senderId: string;
    receiverId: string;
  };
  from: string;
  to: string;
}

export interface IUpdateChatroomsMsgStatusToSeen {
  chatroomId: string;
  senderId: string;
  receiverId: string;
  modifiedCount: number;
}

export interface User {
  _id: string;
  name: string;
  profile_picture: string;
}

export interface Invoice {
  id: string;
  external_id: string;
  user_id: string;
  payment_method: string;
  status: string;
  merchant_name: string;
  amount: number;
  paid_amount: number;
  paid_at: string;
  description: string;
  ewallet_type: string;
  is_high: string;
  success_redirect_url: string;
  created: string;
  updated: string;
  payment_channel: string;
  payment_id: string;
  payment_method_id: string;
}

export interface Lalamove {
  quotationId: string;
  priceBreakdown: {
    base: string;
    totalExcludePriorityFee: string;
    total: string;
    currency: string;
  };
  driver: [];
  shareLink: string;
  scheduleAt: string;
  market: string;
  driverId: string;
  previousStatus: number;
  status: number;
  distance: {
    value: string;
    unit: string;
  };
  stops: [
    {
      coordinates: [{ lat: string; lng: string; _id: string }];
      address: string;
      name: string;
      phone: string;
      delivery_code: [{ value: string; status: string }];
    }
  ];
  id: string;
  _id: string;
}

export interface Message {
  _id?: string;
  chatroomId: string;
  senderId: string;
  content: {
    message: string;
    order?: {
      lineItems: {
        productId: string;
        name: string;
        orderQty: number;
        images: string[];
        expiryDate: string;
        price: number;
        commission: number;
        points: number;
        description: string;
        category: string[];
        specialOffers: string[];
        status: {
          status: string;
          date: string;
          _id: string;
        }[];
        _id: string;
      };
      shopId: string;
      reviews: {
        rate: number;
        comment: string;
        date: string;
      };
      subtotal: number;
      totalItems: number;
      status: {
        status: string;
        date: string;
        _id: string;
      }[];
      _id: string;
      lalamove: Lalamove[];
      invoice: Invoice;
      totalPayment: number;
      createdAt: string;
      updatedAt: string;
    };
    product?: {
      _id: string;
      shopId: string;
      name: string;
      qty: number;
      images: string[];
      expiryDate: string;
      price: number;
      description: string;
      category: string[];
      specialOffers: string[];
      createdAt: string;
      updatedAt: string;
      isPublish: boolean;
    };
  };
  status: string;
  elementId: string;
  createdAt: string;
}

export interface Chatroom {
  _id: string;
  users: {
    shop: User;
    buyer: User;
  };
  latestMessages: Message[];
  sentMessageCount: number;
}

export interface ChatState {
  chatrooms: Chatroom[];
  allSentMessageCount: number;
  error: any;
}
