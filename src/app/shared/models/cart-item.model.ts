export interface CartItem {
  storeId: string;
  lineItems: [
    {
      productId: string;
      orderQty: number;
    }
  ];
}
