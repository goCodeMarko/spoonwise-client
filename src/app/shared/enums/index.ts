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
