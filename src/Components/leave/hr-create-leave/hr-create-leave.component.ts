import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MAT_NATIVE_DATE_FORMATS } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { EmployeeService } from '../../../app/Services/employee.service';
import { EmployeeLeaveService } from '../../../app/Services/employee-leave.service';
import { CreateLeaveRequestDto } from '../../../app/models/leave/employee-leave-request.model';
import { PaginationParams } from '../../../app/models/IEmployee';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-hr-create-leave',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule, MatCardModule, MatIconModule, MatAutocompleteModule, MatSelectModule],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS }
  ],
  templateUrl: './hr-create-leave.component.html',
  styleUrls: ['./hr-create-leave.component.css']
})
export class HrCreateLeaveComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private leaveService = inject(EmployeeLeaveService);
  private http = inject(HttpClient);

    dto: CreateLeaveRequestDto = {
    employeeCode: '',
    leaveTypeId: 0,
    fromDate: new Date(),
    toDate: new Date(),
    notes: '',
    employeeEmail: ''
  };
  leaveTypes: Array<{ id: number; name: string; isPaid: boolean }> = [];

  // autocomplete (local list like loan dialog)
  employees: any[] = [];
  employeeFilter = '';
  employeesLoading = false;
  _selectedEmployee: any = null;

  pagination: PaginationParams = { pageNumber: 1, pageSize: 1000 };

  ngOnInit(): void {
    this.initData();
  }

  async initData(): Promise<void> {
    this.loadLeaveTypes();
    await this.loadAllEmployees();
  }

  loadLeaveTypes() {
    this.http.get<any>(`${environment.apiUrl}LeaveType/GetActiveLeaveTypes`).subscribe({
      next: (res) => { this.leaveTypes = res?.data ?? res ?? []; },
      error: () => { this.leaveTypes = []; }
    });
  }
  resetDto(): void {
    this.dto.employeeCode = '';
    this.dto.leaveTypeId = 0;
    this.dto.fromDate = new Date();
    this.dto.toDate = new Date();
    this.dto.notes = '';
    this.dto.employeeEmail = '';
  }

  // Normalize a date to UTC-midnight for the selected calendar date to avoid
  // the ISO string showing the previous day due to local timezone offset.
  private normalizeDate(d: Date | string | null | undefined): Date | null {
    if (!d) return null;
    const dt = new Date(d as any);
    return new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0, 0));
  }

  async loadAllEmployees(): Promise<void> {
    this.employeesLoading = true;
    return new Promise((resolve) => {
      this.employeeService.getEmployeesByFilter(this.pagination, {}).subscribe({
        next: (res: any) => {
          let loaded: any[] = [];
          if (res?.items) loaded = res.items;
          else if (res?.data?.items) loaded = res.data.items;
          else if (Array.isArray(res)) loaded = res;
          else if (res?.data && Array.isArray(res.data)) loaded = res.data;

          this.employees = this.removeDuplicates(loaded);
          this.employeesLoading = false;
          resolve();
        },
        error: () => { this.employees = []; this.employeesLoading = false; resolve(); }
      });
    });
  }

  removeDuplicates(employees: any[]): any[] {
    const unique: any[] = [];
    const map = new Map();
    for (const e of employees) {
      const key = e.employeeCode || e.code || e.id;
      if (key && !map.has(key)) { map.set(key, true); unique.push(e); }
    }
    return unique;
  }

  get filteredEmployees(): any[] {
    if (!this.employeeFilter || this.employeeFilter.trim().length === 0) return this.employees.slice(0,20);
    const q = this.employeeFilter.toLowerCase().trim();
    return this.employees.filter((e: any) => {
      const name = (e.fullName || e.name || '').toLowerCase();
      const code = (e.employeeCode || e.code || '').toString().toLowerCase();
      return name.includes(q) || code.includes(q);
    }).slice(0,20);
  }

  set selectedEmployee(value: any) {
    this._selectedEmployee = value;
    if (value) {
      this.dto.employeeCode = value.employeeCode || value.code || '';
      this.dto.employeeEmail = value.email || value.employeeEmail || this.dto.employeeEmail;
    }
  }
  get selectedEmployee() { return this._selectedEmployee; }

  onEmployeeFilterChange(q: string) {
    this.employeeFilter = q;
    if (!q || q.trim().length === 0) { this.selectedEmployee = null; this.dto.employeeCode = ''; }
  }

  onEmployeeSelected(event: any) {
    const selectedValue = event.option.value;
    const emp = this.employees.find(e => (e.employeeCode && e.employeeCode === selectedValue) || (e.code && e.code === selectedValue));
    if (emp) {
      this.selectedEmployee = emp;
      const empName = emp.fullName || emp.name || '';
      const empCode = emp.employeeCode || emp.code || '';
      this.employeeFilter = `${empName} (${empCode})`;
    }
  }

  submit() {
    if (!this.dto.employeeCode || this.dto.leaveTypeId === 0) {
      Swal.fire('خطأ', 'الرجاء اختيار الموظف ونوع الإجازة', 'error');
      return;
    }

    const payload: CreateLeaveRequestDto = {
      ...this.dto,
      fromDate: this.normalizeDate(this.dto.fromDate) as any,
      toDate: this.normalizeDate(this.dto.toDate) as any
    };

    this.leaveService.createLeaveRequest(payload).subscribe({
      next: () => { Swal.fire('نجح', 'تم إنشاء طلب الإجازة', 'success'); this.dto = { employeeCode: '', leaveTypeId: 0, fromDate: new Date(), toDate: new Date(), notes: '', employeeEmail: '' }; },
      error: (err) => Swal.fire('خطأ', err?.error?.message ?? 'فشل الإنشاء', 'error')
    });
  }
}
