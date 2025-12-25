export interface StockDto {
  storeID: number;
  storeName: string;
  isDeleted: boolean;
  storeStocks: StockProducts[]|null;
}

export interface StockProducts {
  productId: number;
  productName: string;
  quantity: number;
  isDeleted: boolean;
  lowQuantity: number;
  highQuantity: number;
}

export interface StockFilterations {
  page: number;
  pageSize: number;
  storeName: string | null;
}
