import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';
import { EmployeeService } from '../../../app/Services/employee.service';
import { EmployeeLeaveService } from '../../../app/Services/employee-leave.service';
import { environment } from '../../../environments/environment.development';
import { LeaveBalanceSummaryDto } from '../../../app/models/leave/leave-balance.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-leave-wallets',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatAutocompleteModule, MatButtonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, MatTableModule],
  templateUrl: './leave-wallets.component.html',
  styleUrls: ['./leave-wallets.component.css']
})
export class LeaveWalletsComponent implements OnInit {
  private http = inject(HttpClient);
  private employeeService = inject(EmployeeService);
  private leaveService = inject(EmployeeLeaveService);

  employees: any[] = [];
  employeeFilter = '';
  _selectedEmployee: any = null;
  years: number[] = [];
  year = new Date().getFullYear();
  isLoading = false;

  leaveTypes: any[] = [];
  selectedLeaveType: any = null; // single
  selectedLeaveTypes: number[] = []; // multi for bulk

  balances: LeaveBalanceSummaryDto | null = null;

  pagination = { pageNumber: 1, pageSize: 1000 };

  ngOnInit(): void { this.init(); }

  constructor() {
    const cur = new Date().getFullYear();
    for (let y = cur - 5; y <= cur + 1; y++) this.years.push(y);
  }

  async init(): Promise<void> {
    this.loadLeaveTypes();
    await this.loadAllEmployees();
  }

  private normalizeToArray(res: any): any[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.items)) return res.items;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data?.items)) return res.data.items;
    return [];
  }

  loadLeaveTypes() {
    this.http.get<any>(`${environment.apiUrl}LeaveType/GetAllLeaveTypes`).subscribe({ next: r => this.leaveTypes = this.normalizeToArray(r), error: () => this.leaveTypes = [] });
  }

  async loadAllEmployees(): Promise<void> {
    return new Promise((resolve) => {
      this.employeeService.getEmployeesByFilter(this.pagination, {}).subscribe({ next: (res: any) => { const loaded = this.normalizeToArray(res); this.employees = this.removeDuplicates(loaded); resolve(); }, error: () => { this.employees = []; resolve(); } });
    });
  }

  removeDuplicates(items: any[]) { const map = new Map(); const out: any[] = []; for (const e of items) { const key = e.employeeCode || e.code || e.id; if (key && !map.has(key)) { map.set(key, true); out.push(e); } } return out; }

  get filteredEmployees() {
    if (!this.employeeFilter || this.employeeFilter.trim().length === 0) return this.employees.slice(0,20);
    const q = this.employeeFilter.toLowerCase().trim();
    return this.employees.filter((e:any) => { const name = (e.fullName || e.name || '').toLowerCase(); const code = (e.employeeCode || e.code || '').toString().toLowerCase(); return name.includes(q) || code.includes(q); }).slice(0,20);
  }

  set selectedEmployee(v: any) { this._selectedEmployee = v; if (v) { this.employeeFilter = `${v.fullName || v.name} (${v.employeeCode || v.code})`; } }
  get selectedEmployee() { return this._selectedEmployee; }

  onEmployeeSelected(event: any) {
    const val = event.option.value;
    const emp = this.employees.find((e:any) => (e.employeeCode && e.employeeCode === val) || (e.code && e.code === val));
    if (emp) this.selectedEmployee = emp;
  }

  async fetchBalances() {
    if (!this.selectedEmployee) { Swal.fire('تنبيه','اختر موظفاً أولاً','warning'); return; }
    const code = this.selectedEmployee.employeeCode || this.selectedEmployee.code || '';
    try {
      if (this.selectedLeaveType) {
        const res = await firstValueFrom(this.leaveService.getLeaveBalanceByType(code, Number(this.selectedLeaveType), this.year));
        // convert single balance to summary for display
        this.balances = { employeeCode: res.employeeCode, employeeName: res.employeeName ?? '', year: res.year, balances: [{ leaveTypeId: res.leaveTypeId, leaveTypeName: res.leaveTypeName ?? '', isPaid: false, openingBalance: res.openingBalance, accrued: res.accrued, used: res.used, remaining: res.remaining, pending: res.pendingRequests ?? 0 }] };
      } else {
        const res = await firstValueFrom(this.leaveService.getEmployeeLeaveBalance(code, this.year));
        this.balances = res;
      }
    } catch (err: any) {
      Swal.fire('خطأ', err?.error?.message ?? 'فشل جلب البيانات', 'error');
    }
  }

  async initializeAll() {
    if (!this.selectedEmployee) { Swal.fire('تنبيه','اختر موظفاً أولاً','warning'); return; }
    const code = this.selectedEmployee.employeeCode || this.selectedEmployee.code || '';
    const confirmed = await Swal.fire({ title: 'تأكيد', text: 'هل تريد تهيئة جميع المحافظ بصفر؟', icon: 'question', showCancelButton: true });
    if (!confirmed.isConfirmed) return;
    this.leaveService.initializeLeaveBalance({ employeeCode: code, year: this.year }).subscribe({ next: () => Swal.fire('نجح','تم التهيئة','success'), error: (e:any) => Swal.fire('خطأ', e?.error?.message ?? 'فشل العملية','error') });
  }

  async openSetCustom() {
    if (!this.selectedEmployee) { Swal.fire('تنبيه','اختر موظفاً أولاً','warning'); return; }
    const leaveOptions = this.leaveTypes.map(lt => `<option value="${lt.id}">${lt.name}</option>`).join('');
    const { value: formValues } = await Swal.fire({
      title: 'تعيين رصيد مخصص',
      html: `<div dir="rtl"><label>اختر النوع</label><select id="selType" class="swal2-select">${leaveOptions}</select><label style="margin-top:8px">قيمة الرصيد الافتتاحي</label><input id="inpVal" class="swal2-input" type="number" value="0"/></div>`,
      focusConfirm: false,
      preConfirm: () => {
        const t = (document.getElementById('selType') as HTMLSelectElement).value;
        const v = (document.getElementById('inpVal') as HTMLInputElement).value;
        return { typeId: Number(t), opening: Number(v) };
      }
    });
    if (!formValues) return;
    const code = this.selectedEmployee.employeeCode || this.selectedEmployee.code || '';
    this.leaveService.setCustomLeaveBalance(code, formValues.typeId, formValues.opening).subscribe({ next: (r:any) => Swal.fire('نجح','تم الإنشاء','success'), error: (e:any) => Swal.fire('خطأ', e?.error?.message ?? 'فشل العملية','error') });
  }

  async openCreateMultiple() {
    if (!this.selectedEmployee) { Swal.fire('تنبيه','اختر موظفاً أولاً','warning'); return; }
    if (!this.selectedLeaveTypes || this.selectedLeaveTypes.length === 0) { Swal.fire('تنبيه','اختر على الأقل نوع واحد','warning'); return; }
    // build html inputs for each selected type
    const rows = this.selectedLeaveTypes.map((id: number) => { const t = this.leaveTypes.find(l => l.id == id); return `<div style="margin:6px 0"><label>${t?.name}</label><input id="b_${id}" class="swal2-input" type="number" value="0"/></div>`; }).join('');
    const { value: values } = await Swal.fire({ title: 'إنشاء محافظ متعددة', html: `<div dir="rtl">${rows}</div>`, focusConfirm: false, preConfirm: () => { const out: any[] = []; for (const id of this.selectedLeaveTypes) { const v = (document.getElementById('b_'+id) as HTMLInputElement).value; out.push({ leaveTypeId: Number(id), openingBalance: Number(v) }); } return out; } });
    if (!values) return;
    const code = this.selectedEmployee.employeeCode || this.selectedEmployee.code || '';
    this.leaveService.createMultipleLeaveBalances({ employeeCode: code, year: this.year, balances: values }).subscribe({ next: (res:any) => Swal.fire('نجح','تم إنشاء المحافظ','success'), error: (e:any) => Swal.fire('خطأ', e?.error?.message ?? 'فشل العملية','error') });
  }
}
