import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ProductDto, ProductFilterationDto } from '../models/IProductVM';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/ApiReponse';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
   apiUrl = environment.apiUrl;
 constructor(private http: HttpClient) {}
 getAllProducts(filters: ProductFilterationDto): Observable<ApiResponse<ProductDto[]>> {
    let params = new HttpParams()
      .set('pageSize', filters.pageSize)
      .set('page', filters.page);

    if (filters.name) params = params.set('name', filters.name);
    if (filters.categoryName) params = params.set('categoryName', filters.categoryName);
    if (filters.isDeleted !== null && filters.isDeleted !== undefined)
      params = params.set('isDeleted', filters.isDeleted);

    return this.http.get<ApiResponse<ProductDto[]>>(`${this.apiUrl}Product`, { params });
  }

  addProduct(product: ProductDto): Observable<any> {
    return this.http.post(`${this.apiUrl}Product`, product);
  }
   editProduct(product: ProductDto): Observable<any> {
    return this.http.put(`${this.apiUrl}Product`, product);
  }
  getProductByName(productName: string): Observable<ProductDto> {
    const params = new HttpParams().set('productName', productName);
    return this.http.get<ProductDto>(`${this.apiUrl}Product/Products/Details`, { params });
  }
   toggleStatus(product: ProductDto): Observable<any> {
    return this.http.put(`${this.apiUrl}Product/toggle-status`, product);
  }
}
