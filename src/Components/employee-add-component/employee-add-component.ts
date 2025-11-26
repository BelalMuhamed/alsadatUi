import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { EmployeeDTo } from '../../app/models/IEmployee';
import { EmployeeService } from '../../app/Services/employee.service';
import { CityServiceService } from '../../app/Services/city-service.service';
import { AuthService } from '../../app/Services/auth-service';
import { ICityDto } from '../../app/models/Icity';
import Swal from 'sweetalert2';
import { EmployeeService as EmpService } from '../../app/Services/employee.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-employee-add',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule
  ],
  templateUrl: './employee-add-component.html',
  styleUrls: ['./employee-add-component.css']
})
export class EmployeeAddComponent {
  private employeeService = inject(EmployeeService);
  private cityService = inject(CityServiceService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Reuse the interface instead of re-declaring every field here.
  // Minimal defaults are set in the constructor so template bindings work.
  model: EmployeeDTo = {} as EmployeeDTo;

  cities: ICityDto[] = [];
  filteredCities: ICityDto[] = [];
  isSaving = false;
  showPassword = false;
  roles: string[] = [];

  constructor() {
    this.loadCities();
    // Ensure a few minimal defaults at runtime so template bindings work
    this.model.birthDate = this.model.birthDate ?? new Date();
    this.model.hireDate = this.model.hireDate ?? new Date();
    this.model.timeIn = this.model.timeIn ?? '09:00:00';
    this.model.timeOut = this.model.timeOut ?? '17:00:00';
    this.model.overtimeRatePerHour = this.model.overtimeRatePerHour ?? 0;
    this.model.deductionRatePerHour = this.model.deductionRatePerHour ?? 0;
    this.model.weekHoliday1 = this.model.weekHoliday1 ?? 1;
    // Ensure some string fields are empty to avoid browser autofill showing unexpected values
    this.model.accountName = this.model.accountName ?? '';
    this.model.password = this.model.password ?? '';
    this.model.employeeCode = this.model.employeeCode ?? '';

    // Load active roles from backend; fallback to common roles
    this.authService.getAllRoles().pipe(
      catchError(() => of({ isSuccess: true, data: [{ roleID: 'default', roleName: 'Employee', createdAt: null, isDeleted: false }] }))
    ).subscribe({
      next: (res: any) => {
        const list = (res?.isSuccess ? res.data : res) || [];
        this.roles = Array.isArray(list) ? list.filter((x: any) => !x.isDeleted).map((x: any) => x.roleName) : ['Employee', 'Admin'];
      },
      error: () => { this.roles = ['Employee', 'Admin']; }
    });
  }

  loadCities() {
    this.cityService.getAllCities({ page: 1, pageSize: 1000, cityName: null, governrateName: null }).subscribe({
      next: (res: any) => {
        const list = res?.data ?? [];
        this.cities = list;
        this.filteredCities = [...this.cities];
      },
      error: (err) => console.error('Failed to load cities', err)
    });
  }

  // helper: map week day options
  weekDays = [
    { id: 0, name: 'الأحد' },
    { id: 1, name: 'الاثنين' },
    { id: 2, name: 'الثلاثاء' },
    { id: 3, name: 'الأربعاء' },
    { id: 4, name: 'الخميس' },
    { id: 5, name: 'الجمعة' },
    { id: 6, name: 'السبت' }
  ];

  filterCities(q: string) {
    const s = (q || '').trim().toLowerCase();
    if (!s) { this.filteredCities = [...this.cities]; return; }
    this.filteredCities = this.cities.filter(c => (c.cityName ?? '').toLowerCase().includes(s) || (c.governrateName ?? '').toLowerCase().includes(s));
  }

  cancel() {
    this.router.navigate(['/hr/employees']);
  }

  save() {
    this.isSaving = true;

    // basic required checks
    if (!this.model.email || !this.model.fullName || !this.model.sno) {
      this.isSaving = false;
      Swal.fire('خطأ', 'الرجاء ملء الحقول المطلوبة: البريد، الاسم، الرقم التأسيسي (SNO).', 'error');
      return;
    }

    // ensure cityName copied for backend
    if (this.model.cityID) {
      const city = this.cities.find(c => c.id === this.model.cityID);
      if (city) this.model.cityName = city.cityName ?? '';
    }

    this.employeeService.addEmployee(this.model).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        const message = typeof res === 'string' ? res : (res?.message ?? 'تم الإنشاء بنجاح');
        Swal.fire('نجاح', message, 'success').then(() => this.router.navigate(['/hr/employees']));
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Add employee error', err);
        const msg = err?.error ?? err?.message ?? 'حدث خطأ أثناء الإضافة';
        Swal.fire('خطأ', msg, 'error');
      }
    });
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

}
