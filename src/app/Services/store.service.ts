import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { StoreDto, StoreFilteration } from '../models/IstoreVM';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/ApiReponse';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

   apiUrl = environment.apiUrl;
   constructor(private http: HttpClient) {}
 getAllStores(filter: StoreFilteration): Observable<ApiResponse<StoreDto[]>> {

  let params = new HttpParams();

  if (filter.storeName !== null && filter.storeName !== undefined) {
    params = params.set('storeName', filter.storeName);
  }

  if (filter.page !== null && filter.page !== undefined) {
    params = params.set('page', filter.page.toString());
  }

  if (filter.pageSize !== null && filter.pageSize !== undefined) {
    params = params.set('pageSize', filter.pageSize.toString());
  }

  return this.http.get<ApiResponse<StoreDto[]>>(
    `${this.apiUrl}Store`,
    { params }
  );
}
}
