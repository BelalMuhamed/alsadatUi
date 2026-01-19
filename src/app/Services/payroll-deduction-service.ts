import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class PayrollDeductionService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  addPayrollDeduction(dto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}PayrollDeduction/AddPayrollDeduction`, dto, { responseType: 'json' });
  }

  updatePayrollDeduction(dto: any): Observable<any> {
    return this.http.put(`${this.apiUrl}PayrollDeduction/UpdatePayrollDeduction`, dto, { responseType: 'json' });
  }

  softDeletePayrollDeduction(id: number): Observable<any> {
    const params = new HttpParams().set('id', String(id));
    return this.http.delete(`${this.apiUrl}PayrollDeduction/SoftDeletePayrollDeduction`, { params, responseType: 'text' as 'json' });
  }

  restorePayrollDeduction(id: number): Observable<any> {
    const params = new HttpParams().set('id', String(id));
    return this.http.put(`${this.apiUrl}PayrollDeduction/RestorePayrollDeduction`, null, { params, responseType: 'text' as 'json' });
  }

  getPayrollDeductionById(id: number): Observable<any> {
    const params = new HttpParams().set('id', String(id));
    return this.http.get<any>(`${this.apiUrl}PayrollDeduction/GetPayrollDeductionById`, { params });
  }

  getAllPayrollDeductions(pageNumber = 1, pageSize = 20): Observable<any> {
    let params = new HttpParams().set('pageNumber', String(pageNumber)).set('pageSize', String(pageSize));
    return this.http.get<any>(`${this.apiUrl}PayrollDeduction/GetAllPayrollDeductions`, { params });
  }

  searchPayrollDeductions(searchDto: any, pageNumber = 1, pageSize = 20): Observable<any> {
    let params = new HttpParams().set('pageNumber', String(pageNumber)).set('pageSize', String(pageSize));
    return this.http.post<any>(`${this.apiUrl}PayrollDeduction/SearchPayrollDeductions`, searchDto, { params });
  }

  getEmployeeDeductionsWithSummary(empCode: string, month?: number, year?: number): Observable<any> {
    let params = new HttpParams().set('empCode', empCode || '');
    if (month != null) params = params.set('month', String(month));
    if (year != null) params = params.set('year', String(year));
    return this.http.get<any>(`${this.apiUrl}PayrollDeduction/GetEmployeeDeductionsWithSummary`, { params });
  }
}
