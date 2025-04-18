export enum TransactionStatus {
  Pending = 1,
  Approved = 2,
  Failed = 3,
  Cancelled = 4,
}
export const TransactionStatusLabels: { [key: number]: string } = {
  [TransactionStatus.Pending]: "Pending",
  [TransactionStatus.Approved]: "Approved",
  [TransactionStatus.Failed]: "Failed",
  [TransactionStatus.Cancelled]: "Cancelled",
};

export enum ProductCategory {
  SNACK_AND_SWEETS = "10000",
  SEASONING_STAPLE_BAKING = "10001",
  PET_CARE = "10002",
  BEVERAGES = "10003",
  HEALTH_PERSONALCARE = "10004",
  FROZEN_FRESHFOODS = "10005",
  BREAKFAST_FOOD = "10006",
  BABIES_KIDS = "10007",
  SUPERFOODS_HEALTHY_FOODS = "10008",
}
export const ProductCategoryLabels: { [key: number]: string } = {
  [ProductCategory.SNACK_AND_SWEETS]: "Snack and Sweets",
  [ProductCategory.SEASONING_STAPLE_BAKING]:
    "Seasoning, Staple Foods and Baking Ingredients",
  [ProductCategory.PET_CARE]: "Pet Care",
  [ProductCategory.BEVERAGES]: "Beverages",
  [ProductCategory.HEALTH_PERSONALCARE]: "Health and Personal Care",
  [ProductCategory.FROZEN_FRESHFOODS]: "Frozen and Fresh foods",
  [ProductCategory.BREAKFAST_FOOD]: "Breakfast Food",
  [ProductCategory.BABIES_KIDS]: "Babies and Kids",
  [ProductCategory.SUPERFOODS_HEALTHY_FOODS]: "Superfoods and Healthy Foods",
};

export enum SpecialOffer {
  BUY1_TAKE1 = "10000",
  DONATED = "10001",
}
export const SpecialOfferLabels: { [key: number]: string } = {
  [SpecialOffer.BUY1_TAKE1]: "Buy 1 Take 1",
  [SpecialOffer.DONATED]: "Donated",
};

export enum OrderStatusValue {
  TO_PAY = "TO_PAY",
  FOR_REVIEW = "FOR_REVIEW",
  TO_PACK = "TO_PACK",
  FOR_PICKUP = "FOR_PICKUP",
  TO_RECEIVE = "TO_RECEIVE",
  BUYER_CANCELED = "BUYER_CANCELED",
  SELLER_CANCELED = "SELLER_CANCELED",
}
export const OrderStatusLabels: { [key: string]: string } = {
  [OrderStatusValue.TO_PAY]: "To Pay",
  [OrderStatusValue.FOR_REVIEW]: "For Review",
  [OrderStatusValue.TO_PACK]: "To Pack",
  [OrderStatusValue.FOR_PICKUP]: "For Pickup",
  [OrderStatusValue.TO_RECEIVE]: "To Receive",
  [OrderStatusValue.BUYER_CANCELED]: "Canceled (Buyer)",
  [OrderStatusValue.SELLER_CANCELED]: "Canceled (Seller)",
};

export enum PaymentValue {
  CASH = "CASH",
  ONLINE = "ONLINE",
}
export const PaymentLabels: { [key: string]: string } = {
  [PaymentValue.CASH]: "Cash Payment",
  [PaymentValue.ONLINE]: "Online Payment",
};

export enum ShippingOptionValue {
  LALAMOVE = "LALAMOVE",
  MEET_UP = "MEET_UP",
  STORE_PICKUP = "STORE_PICKUP",
}
export const ShippingOptionLabels: { [key: string]: string } = {
  [ShippingOptionValue.LALAMOVE]: "Ship by Lalamove",
  [ShippingOptionValue.MEET_UP]: "Meet up",
  [ShippingOptionValue.STORE_PICKUP]: "Store Pickup",
};
