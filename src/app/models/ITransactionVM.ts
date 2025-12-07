

export interface StoreTransactionProductsDto {
    transactionId: number;
    productId: number;
    productName?: string;
    quantity: number;
}

export interface StoreTransactionDto {
    id?: number;
    sourceId?: number;
    destenationId?: number;
    sourceName:string|null;
    destenationName:string|null;
        makeTransactionUser: string;
    transactionProducts?: StoreTransactionProductsDto[];
    createdAt: string;
}

export interface StoreTransactionFilters {
    sourceName?: string|null;
    destenationName?: string|null;
    createdAt: string|null;
    page: number;
    pageSize: number;
}
