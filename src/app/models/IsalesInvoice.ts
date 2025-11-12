  export interface SalesInvoicesResponse {
    id:number;
  firstDiscount: number|null;
  secondDiscount:number|null;
  thirdDiscount:number|null;
  totalBeforDiscounts: number;
  totalAfterDiscounts: number;
  paid:number|null;
  residual:number|null;
  totalPoints: number;
  createdAt: Date;
  relatedReturnInvoiceID:number|null;
  distributorID: string;
    totalCopouns: number;
    createdBy: string;
    isReturn?: boolean;
    salesInvoiceStatus: number|null;
    distributorName: string;
  }

export interface SalesInvoiceFilterations {
  dates: string[]|null;
  distributorName: string|null;
  craetedBy: string|null;
  salesInvoiceType: number|null;
  pageSize:number;
  page:number;
}
export interface SalesInvoiceItemsResp
{
sellingPrice:number;
quantity:number;
pointEarned:number;
productId:number|null;
productName:string;
discountPerItem:number;

}
 