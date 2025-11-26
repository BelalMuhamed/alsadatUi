import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Result } from '../models/ApiReponse';
import { EmployeeAttendanceDto, EmployeeAttendanceFilteration } from '../models/IEmployeeAttendance';

// Types for Excel import result returned by backend
export interface ExcelErrorRecord {
  rowNumber: number;
  employeeCode?: string | null;
  errorMessage: string;
}

export interface ExcelImportResultDto {
  successMessages: string[];
  errorRecords: ExcelErrorRecord[];
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeAttendanceService {
  apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getAll(filters: EmployeeAttendanceFilteration): Observable<ApiResponse<EmployeeAttendanceDto[]>> {
    let params = new HttpParams()
      .set('pageSize', String(filters.pageSize))
      .set('pageNumber', String(filters.page));

    if (filters.employeeCode) params = params.set('employeeCode', filters.employeeCode);
    if (filters.employeeId) params = params.set('employeeId', filters.employeeId);
    if (filters.selectedDate) params = params.set('selectedDate', filters.selectedDate);
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);
    if (filters.employeeName) params = params.set('employeeName', filters.employeeName);
    if (filters.departmentName) params = params.set('departmentName', filters.departmentName);
    if (filters.year != null) params = params.set('year', String(filters.year));
    if (filters.month != null) params = params.set('month', String(filters.month));
    if (filters.attendanceStatusID != null) params = params.set('attendanceStatusID', String(filters.attendanceStatusID));

    return this.http.get<ApiResponse<EmployeeAttendanceDto[]>>(`${this.apiUrl}EmployeeAttendance/GetAllEmployeeAttendance`, { params });
  }

  getByFilter(filters: EmployeeAttendanceFilteration): Observable<ApiResponse<EmployeeAttendanceDto[]>> {
    let params = new HttpParams()
      .set('pageSize', String(filters.pageSize))
      .set('pageNumber', String(filters.page));
    if (filters.employeeCode) params = params.set('employeeCode', filters.employeeCode);
    if (filters.employeeId) params = params.set('employeeId', filters.employeeId);
    if (filters.selectedDate) params = params.set('selectedDate', filters.selectedDate);
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);
    if (filters.employeeName) params = params.set('employeeName', filters.employeeName);
    if (filters.departmentName) params = params.set('departmentName', filters.departmentName);
    if (filters.year != null) params = params.set('year', String(filters.year));
    if (filters.month != null) params = params.set('month', String(filters.month));
    if (filters.attendanceStatusID != null) params = params.set('attendanceStatusID', String(filters.attendanceStatusID));

    return this.http.get<ApiResponse<EmployeeAttendanceDto[]>>(`${this.apiUrl}EmployeeAttendance/GetEmployeeAttendanceByFilter`, { params });
  }

  getToday(filters: { page: number; pageSize: number }): Observable<ApiResponse<EmployeeAttendanceDto[]>> {
    let params = new HttpParams().set('pageSize', String(filters.pageSize)).set('page', String(filters.page));
    return this.http.get<ApiResponse<EmployeeAttendanceDto[]>>(`${this.apiUrl}EmployeeAttendance/GetTodayRecord`, { params });
  }

  checkIn(body: { employeeCode: string; date: string; inputTime: string }): Observable<Result<string>> {
    // Backend expects EmpAttendanceHelper with Date and InputTime. We name keys to match expected query body names.
    const payload: any = {
      employeeCode: body.employeeCode,
      date: body.date,
      inputTime: body.inputTime
    };
    return this.http.post<Result<string>>(`${this.apiUrl}EmployeeAttendance/CheckIn`, payload);
  }

  checkOut(body: { employeeCode: string; date: string; inputTime: string }): Observable<Result<string>> {
    const payload: any = {
      employeeCode: body.employeeCode,
      date: body.date,
      inputTime: body.inputTime
    };
    return this.http.post<Result<string>>(`${this.apiUrl}EmployeeAttendance/CheckOut`, payload);
  }

  // NOTE: backend endpoint name assumed. If your backend uses a different path, update accordingly.
  // Upload an Excel file containing attendance records. Sends multipart/form-data with file field name 'file'.
  uploadFromFile(file: File): Observable<Result<ExcelImportResultDto>> {
    const fd = new FormData();
    fd.append('file', file, file.name);
    return this.http.post<Result<ExcelImportResultDto>>(`${this.apiUrl}EmployeeAttendance/ImportFromExcel`, fd);
  }

  // Change attendance status for a record (PUT + query param)
  // Send full DTO in body and status as query param to match backend signature
  changeStatus(dto: EmployeeAttendanceDto, status: number): Observable<Result<string>> {
    return this.http.put<Result<string>>(
      `${this.apiUrl}EmployeeAttendance/UpdateAttendanceStatus?status=${status}`,
      dto
    );
  }
}
