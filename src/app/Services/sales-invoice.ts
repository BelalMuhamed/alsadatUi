import { SalesInvoiceItemsResp } from './../models/IsalesInvoice';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SalesInvoiceFilterations, SalesInvoicesResponse } from '../models/IsalesInvoice';
import { ApiResponse } from '../models/ApiReponse';

@Injectable({
  providedIn: 'root'
})
export class SalesInvoice {
   apiUrl = environment.apiUrl;
 constructor(private http: HttpClient) {}

 getAllSalesInvoices(filters: SalesInvoiceFilterations | null): Observable<ApiResponse<SalesInvoicesResponse[]>> {
  let params = new HttpParams();

  if (filters != null) {

    if (filters.dates && filters.dates.length === 2) {
      params = params.set('dates', filters.dates[0])
                     .append('dates', filters.dates[1]);
    }
    if (filters.distributorName)
      params = params.set('distributorName', filters.distributorName);

    if (filters.craetedBy)
      params = params.set('craetedBy', filters.craetedBy);

    if (filters.salesInvoiceType !== null && filters.salesInvoiceType !== undefined)
      params = params.set('salesInvoiceType', filters.salesInvoiceType);

    if (filters.page)
      params = params.set('page', filters.page);

    if (filters.pageSize)
      params = params.set('pageSize', filters.pageSize);
  }

  return this.http.get<ApiResponse<SalesInvoicesResponse[]>>(
    `${this.apiUrl}SalesInvoices`,
    { params }
  );
}
GetSalesInvoiceItems(id:number):Observable<ApiResponse<SalesInvoiceItemsResp[]>>
{
return this.http.get<ApiResponse<SalesInvoiceItemsResp[]>>(`${this.apiUrl}SalesInvoiceItems/get-sales-invoice-items?id=${id}`)
}
GetSalesInvoiceById(id:number):Observable<SalesInvoicesResponse>
{
 return this.http.get<SalesInvoicesResponse>(`${this.apiUrl}SalesInvoices/get-salesInvoice-by-id?id=${id}`)
}
}
