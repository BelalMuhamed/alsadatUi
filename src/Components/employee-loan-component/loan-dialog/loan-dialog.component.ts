import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmployeeLoanService } from '../../../app/Services/employee-loan.service';
import { EmployeeService } from '../../../app/Services/employee.service';
import Swal from 'sweetalert2';
import { MatCard } from "@angular/material/card";

@Component({
  selector: 'app-loan-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatCard
],
  templateUrl: './loan-dialog.component.html',
  styleUrls: ['./loan-dialog.component.css']
})
export class LoanDialogComponent implements OnInit {
  dialogRef = inject(MatDialogRef<boolean>);
  private loanService = inject(EmployeeLoanService);
  private employeeService = inject(EmployeeService);
  data: any = inject(MAT_DIALOG_DATA) || {};

  model: any = {
    employeeCode: '',
    loanAmount: 0,
    installmentsCount: 1,
    firstInstallmentDate: new Date().toISOString().substring(0,10),
    purpose: ''
  };

  employees: any[] = [];
  employeeFilter = '';
  employeesLoading = false;
  isViewMode = false;
  isSaving = false;
  _selectedEmployee: any = null;

  ngOnInit(): void {
    this.initData();
  }

  async initData(): Promise<void> {
    this.data = this.data || {};
    this.isViewMode = this.data.mode === 'view';

    // تحميل الموظفين أولاً
    await this.loadAllEmployees();
    
    // ثم معالجة بيانات القرض
    this.processLoanData();
  }

  async loadAllEmployees(): Promise<void> {
    // إذا كانت البيانات مرسلة مع الديالوج، استخدمها
    if (this.data.employees && this.data.employees.length > 0) {
      this.employees = this.removeDuplicates(this.data.employees);
      return;
    }
    
    // وإلا قم بتحميلهم من السيرفر
    return new Promise((resolve) => {
      this.employeesLoading = true;
      const params = { pageNumber: 1, pageSize: 1000 };
      
      this.employeeService.getEmployeesByFilter(params as any, {}).subscribe({
        next: (res: any) => {
          let loadedEmployees: any[] = [];
          
          if (res?.items) {
            loadedEmployees = res.items;
          } else if (res?.data?.items) {
            loadedEmployees = res.data.items;
          } else if (Array.isArray(res)) {
            loadedEmployees = res;
          } else if (res?.data && Array.isArray(res.data)) {
            loadedEmployees = res.data;
          }
          
          // إزالة التكرارات
          this.employees = this.removeDuplicates(loadedEmployees);
          
          this.employeesLoading = false;
          resolve();
        },
        error: (err) => {
          this.employees = [];
          this.employeesLoading = false;
          resolve();
        }
      });
    });
  }

  // دالة لإزالة التكرارات من قائمة الموظفين
  removeDuplicates(employees: any[]): any[] {
    const uniqueEmployees = [];
    const employeeMap = new Map();
    
    for (const employee of employees) {
      // استخدام الرقم الوظيفي كمعرف فريد
      const key = employee.employeeCode || employee.code || employee.id;
      
      if (key && !employeeMap.has(key)) {
        employeeMap.set(key, true);
        uniqueEmployees.push(employee);
      }
    }
    
    return uniqueEmployees;
  }

  processLoanData(): void {
    const loanData = this.data.loan ?? this.data;
    
    if (loanData) {
      this.model.employeeCode = loanData.employeeCode ?? loanData.employee?.code ?? this.model.employeeCode;
      this.model.loanAmount = loanData.loanAmount ?? loanData.amount ?? this.model.loanAmount;
      this.model.installmentsCount = loanData.installmentsCount ?? loanData.installmentCount ?? this.model.installmentsCount;
      const rawDate = loanData.firstInstallmentDate ?? loanData.startDate ?? this.model.firstInstallmentDate;
      this.model.firstInstallmentDate = rawDate ? (new Date(rawDate).toISOString().substring(0,10)) : this.model.firstInstallmentDate;
      this.model.purpose = loanData.purpose ?? loanData.note ?? this.model.purpose;
      
      if (loanData.id) { 
        this.model.id = loanData.id; 
      }
      
      // البحث عن الموظف المحدد
      if (loanData.employee) {
        this.selectedEmployee = loanData.employee;
        this.model.employeeCode = loanData.employee.code ?? loanData.employee.employeeCode ?? this.model.employeeCode;
      } else if (this.model.employeeCode) {
        const foundEmp = this.employees.find((e: any) => 
          e.code === this.model.employeeCode || e.employeeCode === this.model.employeeCode
        );
        if (foundEmp) {
          this.selectedEmployee = foundEmp;
        }
      }
      
      // تعيين قيمة حقل البحث للعرض
      if (this.selectedEmployee) {
        const empName = this.selectedEmployee.fullName || this.selectedEmployee.name || '';
        const empCode = this.selectedEmployee.employeeCode || this.selectedEmployee.code || '';
        this.employeeFilter = `${empName} (${empCode})`;
      } else if (this.model.employeeCode) {
        this.employeeFilter = this.model.employeeCode;
      }
    }
  }

  get filteredEmployees(): any[] {
    if (!this.employeeFilter || this.employeeFilter.trim().length === 0) {
      return this.employees.slice(0, 20);
    }
    
    const q = this.employeeFilter.toLowerCase().trim();
    
    return this.employees.filter((e: any) => {
      const name = (e.fullName || e.name || '').toLowerCase();
      const code = (e.employeeCode || e.code || '').toString().toLowerCase();
      
      return name.includes(q) || code.includes(q);
    }).slice(0, 20);
  }

  set selectedEmployee(value: any) {
    this._selectedEmployee = value;
    if (value) {
      this.model.employeeCode = value.employeeCode || value.code || this.model.employeeCode;
      this.model.employee = value;
    }
  }
  
  get selectedEmployee() { 
    return this._selectedEmployee; 
  }

  onEmployeeFilterChange(q: string): void {
    this.employeeFilter = q;
    
    // لا نستدعي API هنا - فقط نستخدم البحث المحلي
    // إذا كان الحقل فارغاً، نعيد تعيين القيم
    if (!q || q.trim().length === 0) {
      this.selectedEmployee = null;
      this.model.employeeCode = '';
    }
  }

  onEmployeeSelected(event: any): void {
    const selectedValue = event.option.value;
    
    
    // البحث عن الموظف في القائمة
    const emp = this.employees.find(e => 
      (e.employeeCode && e.employeeCode === selectedValue) || 
      (e.code && e.code === selectedValue)
    );
    
    if (emp) {
      this.selectedEmployee = emp;
      const empName = emp.fullName || emp.name || '';
      const empCode = emp.employeeCode || emp.code || '';
      this.employeeFilter = `${empName} (${empCode})`;
      this.model.employeeCode = emp.employeeCode || emp.code || '';
      
      
    } else {
      
    }
  }

  save(): void {
    
    
    // التحقق من وجود كود الموظف
    if (!this.model.employeeCode) {
      Swal.fire('تحذير', 'يرجى اختيار الموظف أو إدخال كود الموظف', 'warning');
      return;
    }
    
    // التحقق من صحة البيانات الأخرى
    if (!this.model.loanAmount || this.model.loanAmount <= 0) {
      Swal.fire('تحذير', 'يرجى إدخال مبلغ القرض', 'warning');
      return;
    }
    
    if (!this.model.installmentsCount || this.model.installmentsCount <= 0) {
      Swal.fire('تحذير', 'يرجى إدخال عدد الأقساط', 'warning');
      return;
    }
    
    if (!this.model.firstInstallmentDate) {
      Swal.fire('تحذير', 'يرجى إدخال تاريخ أول قسط', 'warning');
      return;
    }
    
    this.isSaving = true;
    const svc: any = this.loanService;
    const op = this.model.id && typeof svc.update === 'function' 
      ? svc.update(this.model) 
      : svc.create(this.model);
      
    op.subscribe({
      next: (res: any) => {
        Swal.fire('تم', res?.message ?? (this.model.id ? 'تم تعديل القرض' : 'تم إنشاء القرض'), 'success');
        this.isSaving = false;
        this.dialogRef.close(true);
      },
      error: (e: any) => {
        this.isSaving = false;
        const msg = e?.error?.message || e?.error?.Message || e?.message || 'فشل';
        Swal.fire('خطأ', msg, 'error');
      }
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }
}