import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import Swal from 'sweetalert2';
import { PayrollDeductionService } from '../../app/Services/payroll-deduction-service';
import { AddEditPayrollDeductionPopupComponent } from '../../app/Popups/add-edit-payroll-deduction-popup/add-edit-payroll-deduction-popup.component';
import { EmployeeService } from '../../app/Services/employee.service';
import { HttpClient } from '@angular/common/http';
import { DeductionDetailDto } from '../../app/models/IPayrollDeduction';

@Component({
  selector: 'app-payroll-deductions',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule, MatCardModule, MatAutocompleteModule, MatCheckboxModule, MatSlideToggleModule, MatDialogModule, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './payroll-deductions-component.html',
  styleUrls: ['./payroll-deductions-component.css']
})
export class PayrollDeductionsComponent implements OnInit {
  private service = inject(PayrollDeductionService);
  private employeeService = inject(EmployeeService);
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);

  items: any[] = [];
  isLoading = false;
  pageNumber = 1;
  pageSize = 20;
  totalCount = 0;

  filters: any = { employeeCode: '', month: null, year: null, fromDate: null, toDate: null, includeDeleted: false };

  employees: any[] = [];
  employeeFilter = '';
  employeesLoading = false;
  _selectedEmployee: any = null;
  pagination = { pageNumber: 1, pageSize: 1000 };

  ngOnInit(): void {
    this.loadEmployees();
    this.load();
  }

  loadEmployees() {
    this.employeesLoading = true;
    this.employeeService.getEmployeesByFilter(this.pagination, {}).subscribe({
      next: (res: any) => { this.employees = (res?.items ?? res?.data ?? res) as any[]; this.employeesLoading = false; },
      error: () => { this.employees = []; this.employeesLoading = false; }
    });
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
      this.filters.employeeCode = value.employeeCode || value.code || '';
    }
  }
  get selectedEmployee() { return this._selectedEmployee; }

  onEmployeeFilterChange(q: string) {
    this.employeeFilter = q;
    if (!q || q.trim().length === 0) { this.selectedEmployee = null; this.filters.employeeCode = ''; }
  }

  onEmployeeSelected(event: any) {
    const selectedValue = event.option.value;
    const emp = this.employees.find((e: any) => (e.employeeCode && e.employeeCode === selectedValue) || (e.code && e.code === selectedValue));
    if (emp) {
      this.selectedEmployee = emp;
      const empName = emp.fullName || emp.name || '';
      const empCode = emp.employeeCode || emp.code || '';
      this.employeeFilter = `${empName} (${empCode})`;
    }
  }

  private normalizeDate(d: any): string | undefined {
    if (!d) return undefined;
    const dt = (d instanceof Date) ? d : new Date(d);
    if (isNaN(dt.getTime())) return undefined;
    return dt.toISOString().split('T')[0];
  }

  load(page: number = 1) {
    this.isLoading = true;
    const dto = {
      employeeCode: this.filters.employeeCode || undefined,
      month: this.filters.month || undefined,
      year: this.filters.year || undefined,
      fromDate: this.normalizeDate(this.filters.fromDate),
      toDate: this.normalizeDate(this.filters.toDate),
      includeDeleted: this.filters.includeDeleted
    };

    this.service.searchPayrollDeductions(dto, page, this.pageSize).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        // Backend returns ApiResponse<PagedResponse<DeductionDetailDto>>
        const pagedData = res?.data ?? res ?? {};
        this.items = (pagedData?.items ?? []) as DeductionDetailDto[];
        this.totalCount = pagedData?.totalCount ?? 0;
      },
      error: (err) => { 
        this.isLoading = false; 
        Swal.fire('خطأ', err?.error?.message ?? 'فشل التحميل', 'error'); 
      }
    });
  }

  applyFilters() { this.pageNumber = 1; this.load(1); }
  clearFilters() { this.filters = { employeeCode: '', month: null, year: null, fromDate: null, toDate: null, includeDeleted: false }; this.employeeFilter = ''; this.selectedEmployee = null; this.load(1); }

  onPageChange(e: PageEvent) { this.pageSize = e.pageSize; this.pageNumber = e.pageIndex + 1; this.load(this.pageNumber); }

  openAdd() {
    const ref = this.dialog.open(AddEditPayrollDeductionPopupComponent, { width: '500px', data: null });
    ref.afterClosed().subscribe((result: any) => { if (result) { this.service.addPayrollDeduction(result).subscribe({ next: (res: any) => { Swal.fire('نجاح', res?.message ?? 'تمت الإضافة بنجاح', 'success'); this.load(this.pageNumber); }, error: (e) => Swal.fire('خطأ', e?.error?.message ?? 'فشل الحفظ', 'error') }); } });
  }

  openEdit(item: DeductionDetailDto) {
    const ref = this.dialog.open(AddEditPayrollDeductionPopupComponent, { width: '500px', data: item });
    ref.afterClosed().subscribe((result: any) => { if (result) { this.service.updatePayrollDeduction(result).subscribe({ next: (res: any) => { Swal.fire('نجاح', res?.message ?? 'تم التحديث بنجاح', 'success'); this.load(this.pageNumber); }, error: (e) => Swal.fire('خطأ', e?.error?.message ?? 'فشل التحديث', 'error') }); } });
  }

  delete(item: DeductionDetailDto) {
    Swal.fire({ title: 'تأكيد الحذف', text: `هل أنت متأكد من حذف خصم الموظف ${item.employeeName}؟`, icon: 'warning', showCancelButton: true, confirmButtonText: 'حذف', cancelButtonText: 'إلغاء' }).then(r => { if (r.isConfirmed) { this.service.softDeletePayrollDeduction(item.id).subscribe({ next: (res: any) => { Swal.fire('نجاح', res?.message ?? 'تم الحذف بنجاح', 'success'); this.load(this.pageNumber); }, error: (e) => Swal.fire('خطأ', e?.error?.message ?? 'فشل الحذف', 'error') }); } });
  }

  restore(item: DeductionDetailDto) {
    Swal.fire({ title: 'تأكيد الاستعادة', text: 'هل تريد استعادة هذا الخصم؟', icon: 'warning', showCancelButton: true, confirmButtonText: 'استعادة', cancelButtonText: 'إلغاء' }).then(r => { if (r.isConfirmed) { this.service.restorePayrollDeduction(item.id).subscribe({ next: (res: any) => { Swal.fire('نجاح', res?.message ?? 'تمت الاستعادة بنجاح', 'success'); this.load(this.pageNumber); }, error: (e) => Swal.fire('خطأ', e?.error?.message ?? 'فشل الاستعادة', 'error') }); } });
  }

  viewSummary(empCode: string) {
    // redirect to details/summary page (handled elsewhere). For now do nothing.
    // Example: this.router.navigate(['/hr/employee-deductions', empCode]);
  }
}
