import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PayrollService } from '../../app/Services/payroll.service';
import { EmployeeService } from '../../app/Services/employee.service';
import {
  PayrollFilterDto,
  PayrollResponseDto,
  BulkPayrollResultDto,
  PayrollSummaryDto,
  GeneratePayrollRequestDto,
  GenerateBulkPayrollRequestDto,
  MarkPayrollPaidDto
} from '../../app/models/IPayroll';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatCardModule,
    MatTabsModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatTableModule,
    MatDividerModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './payroll-component.html',
  styleUrls: ['./payroll-component.css']
})
export class PayrollComponent implements OnInit {
  private payrollService = inject(PayrollService);
  private employeeService = inject(EmployeeService);
  private router = inject(Router);

  // UI State
  isLoading = false;
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();

  // Employee Filter State
  generateEmployeeFilter = '';
  employees: any[] = [];
  employeesLoading = false;

  // Generate Payroll State
  generateEmployeeCode = '';
  generateMonth: number = new Date().getMonth() + 1;
  generateYear: number = new Date().getFullYear();

  // Bulk Payroll State
  bulkMonth: number = new Date().getMonth() + 1;
  bulkYear: number = new Date().getFullYear();
  bulkIncludeActiveOnly = true;
  bulkAutoPost = false;
  bulkPaymentMethod = 'BankTransfer';
  selectedEmployeeCodes: string[] = [];

  // Filter State
  filterMonth?: number;
  filterYear?: number;
  filterStatus: string = '';
  filterFromDate?: Date;
  filterToDate?: Date;
  filterMinSalary?: number;
  filterMaxSalary?: number;
  filterDepartments: string[] = [];

  // Data Objects
  payrolls: PayrollResponseDto[] = [];
  bulkResult: BulkPayrollResultDto | null = null;
  summary: PayrollSummaryDto | null = null;
  selectedPayroll: PayrollResponseDto | null = null;

  // Selection State
  selectedPayrollIds: number[] = [];

  // List State
  allPayrolls: PayrollResponseDto[] = [];
  paginatedPayrolls: PayrollResponseDto[] = [];
  pageSize = 10;
  currentPage = 1;
  totalPages = 1;

  months = [
    { id: 1, name: 'يناير' },
    { id: 2, name: 'فبراير' },
    { id: 3, name: 'مارس' },
    { id: 4, name: 'أبريل' },
    { id: 5, name: 'مايو' },
    { id: 6, name: 'يونيو' },
    { id: 7, name: 'يوليو' },
    { id: 8, name: 'أغسطس' },
    { id: 9, name: 'سبتمبر' },
    { id: 10, name: 'أكتوبر' },
    { id: 11, name: 'نوفمبر' },
    { id: 12, name: 'ديسمبر' }
  ];

  statusOptions = [
    { value: '', name: 'الكل' },
    { value: 'Generated', name: 'تم الإنشاء' },
    { value: 'Posted', name: 'تم التسجيل المحاسبي' },
    { value: 'Paid', name: 'تم الدفع' }
  ];

  paymentMethods = [
    { value: 'BankTransfer', name: 'تحويل بنكي' },
    { value: 'Cash', name: 'نقداً' },
    { value: 'Check', name: 'شيك' }
  ];

  years: number[] = [];

  ngOnInit(): void {
    // Generate years list
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      this.years.push(i);
    }

    this.loadAllEmployees();
    this.loadSummary();
  }

  // ==================== Employee Autocomplete ====================
  loadAllEmployees(): void {
    this.employeesLoading = true;
    const params = { pageNumber: 1, pageSize: 1000 };
    this.employeeService.getEmployeesByFilter(params as any, {}).subscribe({
      next: (res: any) => {
        const payload = res?.data ?? res ?? [];
        const list = payload?.items ?? payload ?? [];
        // إزالة التكرارات حسب الكود
        const map = new Map<string, any>();
        for (const e of list) {
          const key = (e.employeeCode || e.code || e.id || '').toString();
          if (key && !map.has(key)) map.set(key, e);
        }
        this.employees = Array.from(map.values());
        this.employeesLoading = false;
      },
      error: () => { this.employees = []; this.employeesLoading = false; }
    });
  }

  get filteredEmployees(): any[] {
    const q = (this.generateEmployeeFilter || '').toString().trim().toLowerCase();
    if (!q) return this.employees.slice(0, 30);
    return this.employees.filter((e: any) => {
      const name = (e.fullName || e.name || '').toString().toLowerCase();
      const code = (e.employeeCode || e.code || '').toString().toLowerCase();
      return name.includes(q) || code.includes(q);
    }).slice(0, 30);
  }

  onEmployeeFilterChange(q: string): void {
    this.generateEmployeeFilter = q;
  }

  onEmployeeSelected(event: any): void {
    const emp = event.option.value;
    this.selectEmployee(emp);
  }

  selectEmployee(emp: any): void {
    if (!emp) return;
    this.generateEmployeeCode = emp.employeeCode ?? emp.code ?? emp.id;
  }

  // ==================== Generate Payroll ====================
  generateSinglePayroll(): void {
    if (!this.generateEmployeeCode) {
      Swal.fire('خطأ', 'يرجى إدخال كود الموظف', 'error');
      return;
    }

    if (!this.generateMonth || !this.generateYear) {
      Swal.fire('خطأ', 'يرجى اختيار الشهر والسنة', 'error');
      return;
    }

    this.isLoading = true;

    const request: GeneratePayrollRequestDto = {
      employeeCode: this.generateEmployeeCode,
      month: this.generateMonth,
      year: this.generateYear
    };

    this.payrollService.generatePayroll(request).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        // التعامل مع البيانات سواء كانت wrapped أو مباشرة
        const isSuccess = res?.isSuccess ?? res?.success ?? res?.id !== undefined;
        if (isSuccess) {
          Swal.fire('نجاح', 'تم إنشاء كشف الراتب بنجاح', 'success');
          this.generateEmployeeCode = '';
          this.generateEmployeeFilter = '';
          this.loadSummary();
        } else {
          Swal.fire('خطأ', res?.message ?? 'فشل في إنشاء كشف الراتب', 'error');
        }
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire('خطأ', err?.error?.message ?? 'حدث خطأ', 'error');
      }
    });
  }

  // ==================== Bulk Payroll ====================
  generateBulkPayroll(): void {
    if (!this.bulkMonth || !this.bulkYear) {
      Swal.fire('خطأ', 'يرجى اختيار الشهر والسنة', 'error');
      return;
    }

    this.isLoading = true;

    const request: GenerateBulkPayrollRequestDto = {
      month: this.bulkMonth,
      year: this.bulkYear,
      employeeCodes: this.selectedEmployeeCodes.length > 0 ? this.selectedEmployeeCodes : undefined,
      includeActiveOnly: this.bulkIncludeActiveOnly,
      autoPostToAccounting: this.bulkAutoPost,
      paymentMethod: this.bulkPaymentMethod
    };

    this.payrollService.generateBulkPayroll(request).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        // التعامل مع البيانات سواء كانت wrapped أو مباشرة
        const isSuccess = res?.isSuccess ?? res?.success ?? res?.totalEmployees !== undefined;
        const bulkData = res?.data ?? res;
        
        if (isSuccess && bulkData?.totalEmployees !== undefined) {
          this.bulkResult = bulkData;
          Swal.fire('نجاح', `تم إنشاء ${bulkData.processedSuccessfully} كشف مرتب بنجاح`, 'success');
          this.loadSummary();
        } else {
          Swal.fire('خطأ', res?.message ?? 'فشل في الإنشاء الجماعي', 'error');
        }
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire('خطأ', err?.error?.message ?? 'حدث خطأ', 'error');
      }
    });
  }

  // ==================== Payroll List ====================
  loadPayrolls(): void {
    this.isLoading = true;

    const filter: PayrollFilterDto = {
      month: this.filterMonth,
      year: this.filterYear,
      status: this.filterStatus || undefined,
      fromDate: this.filterFromDate,
      toDate: this.filterToDate,
      minNetSalary: this.filterMinSalary,
      maxNetSalary: this.filterMaxSalary,
      departments: this.filterDepartments.length > 0 ? this.filterDepartments : undefined
    };

    this.payrollService.getPayrolls(filter).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        try {
          // التعامل مع البيانات سواء كانت wrapped في Result أو مباشرة
          let payrolls: PayrollResponseDto[] = [];
          
          if (Array.isArray(res)) {
            // البيانات مباشرة كـ array
            payrolls = res;
          } else if (res?.isSuccess && res?.data && Array.isArray(res.data)) {
            // البيانات wrapped في Result
            payrolls = res.data;
          } else if (res?.success && res?.data && Array.isArray(res.data)) {
            // صيغة alternative للـ Result
            payrolls = res.data;
          } else if (res?.message && !Array.isArray(res)) {
            // رسالة خطأ
            Swal.fire('خطأ', res.message, 'error');
            return;
          }

          if (payrolls && payrolls.length > 0) {
            this.allPayrolls = payrolls;
            this.totalPages = Math.ceil(this.allPayrolls.length / this.pageSize);
            this.currentPage = 1;
            this.updatePaginatedList();
          } else {
            Swal.fire('تنبيه', 'لم يتم العثور على بيانات', 'info');
          }
        } catch (error) {
          Swal.fire('خطأ', 'حدث خطأ في معالجة البيانات', 'error');
        }
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire('خطأ', err?.error?.message ?? 'حدث خطأ', 'error');
      }
    });
  }

  updatePaginatedList(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedPayrolls = this.allPayrolls.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedList();
    }
  }

  resetFilters(): void {
    this.filterMonth = undefined;
    this.filterYear = undefined;
    this.filterStatus = '';
    this.filterFromDate = undefined;
    this.filterToDate = undefined;
    this.filterMinSalary = undefined;
    this.filterMaxSalary = undefined;
    this.filterDepartments = [];
    this.selectedPayrollIds = [];
    this.loadPayrolls();
  }

  exportToExcel(): void {
    if (this.allPayrolls.length === 0) {
      Swal.fire('تنبيه', 'لا توجد بيانات للتصدير', 'warning');
      return;
    }

    this.isLoading = true;

    const filter: PayrollFilterDto = {
      month: this.filterMonth,
      year: this.filterYear,
      status: this.filterStatus || undefined,
      departments: this.filterDepartments.length > 0 ? this.filterDepartments : undefined
    };

    this.payrollService.exportToExcel(filter).subscribe({
      next: (blob: Blob) => {
        this.isLoading = false;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `كشوف_المرتبات_${new Date().getTime()}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire('خطأ', 'فشل في تصدير البيانات', 'error');
      }
    });
  }

  // ==================== Payroll Management ====================
  selectPayroll(payroll: PayrollResponseDto): void {
    this.selectedPayroll = payroll;
  }

  togglePayrollSelection(payrollId: number): void {
    const index = this.selectedPayrollIds.indexOf(payrollId);
    if (index > -1) {
      this.selectedPayrollIds.splice(index, 1);
    } else {
      this.selectedPayrollIds.push(payrollId);
    }
  }

  isPayrollSelected(payrollId: number): boolean {
    return this.selectedPayrollIds.includes(payrollId);
  }

  selectAllPayrolls(): void {
    this.paginatedPayrolls.forEach(payroll => {
      if (!this.selectedPayrollIds.includes(payroll.id)) {
        this.selectedPayrollIds.push(payroll.id);
      }
    });
  }

  deselectAllPayrolls(): void {
    this.selectedPayrollIds = [];
  }

  // ==================== Accounting Operations ====================
  postToAccounting(payrollId: number): void {
    Swal.fire({
      title: 'تأكيد',
      text: 'هل تريد تسجيل هذا الكشف في المحاسبة؟',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'نعم',
      cancelButtonText: 'إلغاء'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.payrollService.postToAccounting(payrollId).subscribe({
          next: (res: any) => {
            this.isLoading = false;
            if (res?.isSuccess) {
              Swal.fire('نجاح', res.data ?? 'تم التسجيل بنجاح', 'success');
              this.loadPayrolls();
              this.loadSummary();
            } else {
              Swal.fire('خطأ', res?.message ?? 'فشل التسجيل', 'error');
            }
          },
          error: (err) => {
            this.isLoading = false;
            Swal.fire('خطأ', err?.error?.message ?? 'حدث خطأ', 'error');
          }
        });
      }
    });
  }

  postBulkToAccounting(): void {
    if (this.selectedPayrollIds.length === 0) {
      Swal.fire('تنبيه', 'يرجى تحديد كشوف للتسجيل', 'warning');
      return;
    }

    Swal.fire({
      title: 'تأكيد',
      text: `هل تريد تسجيل ${this.selectedPayrollIds.length} كشف في المحاسبة؟`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'نعم',
      cancelButtonText: 'إلغاء'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.payrollService.postBulkToAccounting(this.selectedPayrollIds).subscribe({
          next: (res: any) => {
            this.isLoading = false;
            if (res?.isSuccess) {
              Swal.fire('نجاح', res.data ?? 'تم التسجيل الجماعي بنجاح', 'success');
              this.selectedPayrollIds = [];
              this.loadPayrolls();
              this.loadSummary();
            } else {
              Swal.fire('خطأ', res?.message ?? 'فشل التسجيل', 'error');
            }
          },
          error: (err) => {
            this.isLoading = false;
            Swal.fire('خطأ', err?.error?.message ?? 'حدث خطأ', 'error');
          }
        });
      }
    });
  }

  // ==================== Payment Operations ====================
  markAsPaid(payrollId: number, paymentMethod: string): void {
    Swal.fire({
      title: 'تأكيد الدفع',
      text: 'هل تريد تعيين هذا الكشف كمدفوع؟',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'نعم',
      cancelButtonText: 'إلغاء'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.payrollService.markAsPaid(payrollId, paymentMethod).subscribe({
          next: (res: any) => {
            this.isLoading = false;
            if (res?.isSuccess) {
              Swal.fire('نجاح', res.data ?? 'تم تعيين الكشف كمدفوع', 'success');
              this.loadPayrolls();
              this.loadSummary();
            } else {
              Swal.fire('خطأ', res?.message ?? 'فشل التحديث', 'error');
            }
          },
          error: (err) => {
            this.isLoading = false;
            Swal.fire('خطأ', err?.error?.message ?? 'حدث خطأ', 'error');
          }
        });
      }
    });
  }

  markBulkAsPaid(): void {
    if (this.selectedPayrollIds.length === 0) {
      Swal.fire('تنبيه', 'يرجى تحديد كشوف للدفع', 'warning');
      return;
    }

    const paymentMethod = this.bulkPaymentMethod || 'BankTransfer';

    Swal.fire({
      title: 'تأكيد الدفع',
      text: `هل تريد تعيين ${this.selectedPayrollIds.length} كشف كمدفوع؟`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'نعم',
      cancelButtonText: 'إلغاء'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        const dto: MarkPayrollPaidDto = {
          payrollIds: this.selectedPayrollIds,
          paymentMethod: paymentMethod
        };

        this.payrollService.markBulkAsPaid(dto).subscribe({
          next: (res: any) => {
            this.isLoading = false;
            if (res?.isSuccess) {
              Swal.fire('نجاح', res.data ?? 'تم تعيين الكشوف كمدفوع', 'success');
              this.selectedPayrollIds = [];
              this.loadPayrolls();
              this.loadSummary();
            } else {
              Swal.fire('خطأ', res?.message ?? 'فشل التحديث', 'error');
            }
          },
          error: (err) => {
            this.isLoading = false;
            Swal.fire('خطأ', err?.error?.message ?? 'حدث خطأ', 'error');
          }
        });
      }
    });
  }

  // ==================== Summary ====================
  loadSummary(): void {
    this.payrollService.getSummary(this.selectedMonth, this.selectedYear).subscribe({
      next: (res: any) => {
        // التعامل مع البيانات سواء كانت wrapped أو مباشرة
        const isSuccess = res?.isSuccess ?? res?.success ?? res?.month !== undefined;
        const summaryData = res?.data ?? res;
        
        if (isSuccess && summaryData?.month !== undefined) {
          this.summary = summaryData;
        }
      },
      error: (err) => console.error('Summary error:', err)
    });
  }

  onMonthChange(): void {
    this.loadSummary();
  }

  onYearChange(): void {
    this.loadSummary();
  }

  // ==================== Formatting Utilities ====================
  formatCurrency(value: number | null | undefined): string {
    if (!value && value !== 0) {
      return '0 ج.م';
    }
    return value.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' });
  }

  formatDate(date: Date | string | null | undefined): string {
    if (!date) return 'لم يتم الدفع';
    const d = new Date(date);
    return d.toLocaleDateString('ar-EG');
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'generated':
        return '#2196f3';
      case 'posted':
        return '#ff9800';
      case 'paid':
        return '#4caf50';
      default:
        return '#666';
    }
  }

  getStatusText(status: string): string {
    switch (status?.toLowerCase()) {
      case 'generated':
        return 'تم الإنشاء';
      case 'posted':
        return 'تم التسجيل';
      case 'paid':
        return 'تم الدفع';
      default:
        return status;
    }
  }

  getMonthName(month: number): string {
    const monthNames = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return monthNames[month - 1] || 'غير معروف';
  }

  goBack(): void {
    this.router.navigate(['/hr']);
  }

  printPayroll(): void {
    window.print();
  }
}
