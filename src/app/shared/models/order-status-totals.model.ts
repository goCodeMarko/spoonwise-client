export interface IOrderStatus {
  status:
    | "TO_PAY"
    | "FOR_REVIEW"
    | "TO_RECEIVE"
    | "TO_PACK"
    | "FOR_PICKUP"
    | "CANCELED";
  count: number;
}

export interface IOrderStatusTotals {
  data: IOrderStatus[] | null;
}
