import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../app/Services/auth-service';
import { EmployeeDTo } from '../../app/models/IEmployee';
import { EmployeeService } from '../../app/Services/employee.service';
import { CityServiceService } from '../../app/Services/city-service.service';
import { ICityDto } from '../../app/models/Icity';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-employee-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule
  ],
  templateUrl: './employee-edit-dialog.html',
  styleUrls: ['./employee-edit-dialog.css']
})
export class EmployeeEditDialog implements OnInit {
  private employeeService = inject(EmployeeService);
  private cityService = inject(CityServiceService);
  private authService = inject(AuthService);

  model: EmployeeDTo = {} as EmployeeDTo;
  cities: ICityDto[] = [];
  filteredCities: ICityDto[] = [];
  roles: string[] = [];
  cityFilter: string = '';
  saving = false;

  constructor(
    public dialogRef: MatDialogRef<EmployeeEditDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { employee: EmployeeDTo }
  ) {}

  ngOnInit(): void {
    // make a shallow copy so editing doesn't immediately mutate parent object
    this.model = { ...this.data.employee } as EmployeeDTo;

    // convert ISO strings to Date for datepickers if needed
    try {
      if (this.model.birthDate && typeof this.model.birthDate === 'string') {
        this.model.birthDate = new Date(this.model.birthDate as any) as any;
      }
      if (this.model.hireDate && typeof this.model.hireDate === 'string') {
        this.model.hireDate = new Date(this.model.hireDate as any) as any;
      }
    } catch (e) {
      // ignore parse errors
    }

    this.loadCities();
    // load roles (active only)
    this.authService.getAllRoles().subscribe({ next: (res: any) => {
      const list = (res?.isSuccess ? res.data : res) || [];
      this.roles = Array.isArray(list) ? list.filter((x: any) => !x.isDeleted).map((x: any) => x.roleName) : [];
    }, error: (e) => { console.warn('Failed to load roles', e); } });
  }

  loadCities(): void {
    // call city service with an empty filter (page/pageSize not important for search)
    this.cityService.getAllCities({ page: 1, pageSize: 1000, cityName: null, governrateName: null }).subscribe({
      next: (res: any) => {
        // ApiResponse wraps data
        const list = res?.data ?? [];
        this.cities = list;
        this.filteredCities = [...this.cities];
        // ensure current cityID maps to available list; if model has cityName but not cityID try to find id
        if ((this.model.cityID == null || this.model.cityID === 0) && this.model.cityName) {
          const found = this.cities.find(c => c.cityName === this.model.cityName);
          if (found) this.model.cityID = found.id ?? undefined;
        }
      },
      error: (err) => {
        console.error('Failed to load cities', err);
      }
    });
  }

  filterCities(value: string) {
    const q = (value || '').trim().toLowerCase();
    if (!q) {
      this.filteredCities = [...this.cities];
      return;
    }
    this.filteredCities = this.cities.filter(c => (c.cityName ?? '').toLowerCase().includes(q) || (c.governrateName ?? '').toLowerCase().includes(q));
  }

  save(): void {
    this.saving = true;

    // make sure cityName is set for backend convenience
    if (this.model.cityID) {
      const city = this.cities.find(c => c.id === this.model.cityID);
      if (city) this.model.cityName = city.cityName ?? '';
    }

    // client-side validation: SNO is required by backend
    if (!this.model.sno || (typeof this.model.sno === 'string' && !this.model.sno.trim())) {
      this.saving = false;
      Swal.fire('خطأ', 'الرجاء إدخال الرقم التأسيسي (SNO) قبل الحفظ', 'error');
      return;
    }

    this.employeeService.updateEmployee(this.model).subscribe({
      next: (res: any) => {
        this.saving = false;
        const message = typeof res === 'string' ? res : (res?.message ?? 'تم التحديث بنجاح');
        Swal.fire('نجاح', message, 'success').then(() => {
          this.dialogRef.close({ success: true, message });
        });
      },
      error: (err) => {
        this.saving = false;
        console.error('Update error', err);
        const msg = err?.error ?? err?.message ?? 'حدث خطأ أثناء الحفظ';
        Swal.fire('خطأ', msg, 'error');
      }
    });
  }

  cancel(): void {
    this.dialogRef.close({ success: false });
  }
}
