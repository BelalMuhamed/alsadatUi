export interface StoreDto {
  id: number|null;
  storeName: string;
}

export interface StoreDeleteDto {
  id: number;
  storeName: string|null;
  transferedToStoreDto: number;
}

export interface StoreFilteration {
  storeName: string|null;
  page: number|null;
  pageSize: number|null;
}
