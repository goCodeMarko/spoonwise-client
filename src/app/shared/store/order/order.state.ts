export interface LineItem {
  productId: string;
  name: string;
  orderQty: number;
  images: string[];
  expiryDate: string;
  price: number;
  description: string;
  category: string[];
  latestStatus: { status: string };
  specialOffers: string[];
  commission: number;
  points: number;
  _id: string;
}

export interface Shop {
  _id: string;
  businessName: string;
  logo: string;
  coordinates: {
    lat: number;
    lon: number;
  };
}
export interface Status {
  _id: string;
  status: string;
  date: string;
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

export interface Order {
  orderId: string;
  buyer: string;
  paymentMethod: string;
  shippingOption: string;
  reviews: { rate: number; comment: string };
  shop: Shop;
  cart: LineItem[];
  latestStatus: Status;
  invoice: Invoice;
  subtotal: number;
  totalItems: number;
}

export interface OrderState {
  order: {
    toPay: Order[];
    forReview: Order[];
    toPack: Order[];
    forPickup: Order[];
    toReview: Order[];
    toReceive: Order[];
    cancelled: Order[];
  };

  error: any;
}
