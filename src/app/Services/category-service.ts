import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CategoryDto, CategoryFilteration } from '../models/ICategory';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/ApiReponse';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
   apiUrl = environment.apiUrl;
 constructor(private http: HttpClient) {}
getAllCategories(filters: CategoryFilteration): Observable<ApiResponse<CategoryDto[]>> {
  let params = new HttpParams()
    
  if (filters.pageSize != null && filters.pageSize > 0) {
    params = params.set('pageSize', filters.pageSize);
  }

  // ✅ Only add page if it has a value
  if (filters.page != null && filters.page > 0) {
    params = params.set('page', filters.page);
  }
  if (filters.categoryName) {
    params = params.set('categoryName', filters.categoryName);
  }

  if (filters.isDeleted !== null && filters.isDeleted !== undefined) {
    params = params.set('isDeleted', filters.isDeleted);
  }

  return this.http.get<ApiResponse<CategoryDto[]>>(`${this.apiUrl}Category`, { params });
}
  editCategory(dto: CategoryDto) {
    return this.http.put(`${this.apiUrl}Category`, dto);
  }
  addCategory(dto: CategoryDto): Observable<any> {
    return this.http.post(`${this.apiUrl}Category`, dto);
  }
   ToggleStatus(dto: CategoryDto) {
    return this.http.put(`${this.apiUrl}Category/toggle-status`, dto);
  }
}
