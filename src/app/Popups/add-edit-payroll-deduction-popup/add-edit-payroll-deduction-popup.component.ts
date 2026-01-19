import { Component, inject, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import Swal from 'sweetalert2';
import { EmployeeService } from '../../Services/employee.service';

@Component({
  selector: 'app-add-edit-payroll-deduction-popup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule, MatAutocompleteModule],
  templateUrl:'./add-edit-payroll-deduction-popup.component.html',
  styleUrls: ['./add-edit-payroll-deduction-popup.component.css']
})
export class AddEditPayrollDeductionPopupComponent {
  private fb = inject(FormBuilder);
  private empService = inject(EmployeeService);
  constructor(private dialogRef: MatDialogRef<AddEditPayrollDeductionPopupComponent>, @Inject(MAT_DIALOG_DATA) public data: any | null) {}

  form!: FormGroup;
  employees: any[] = [];
  employeeFilter = '';
  employeesLoading = false;
  @ViewChild(MatAutocompleteTrigger) autoTrigger?: MatAutocompleteTrigger;

  ngOnInit(): void {
    this.initForm();
    this.loadEmployees();
  }

  initForm() {
    this.form = this.fb.group({
      id: [this.data?.id ?? null],
      employeeCode: [this.data?.employeeCode || '', Validators.required],
      deductionDate: [this.data?.deductionDate ? new Date(this.data.deductionDate) : new Date(), Validators.required],
      deductionAmount: [this.data?.deductionAmount ?? 0, [Validators.required, Validators.min(0.01)]],
      deductionReason: [this.data?.deductionReason || '']
    });
  }

  loadEmployees() {
    this.employeesLoading = true;
    this.empService.getEmployeesByFilter({ pageNumber: 1, pageSize: 1000 }, {}).subscribe({
      next: (res: any) => {
        this.employees = res?.items ?? res?.data ?? res ?? [];
        // if editing, set visible filter text to employee name
        if (this.data?.employeeCode) {
          const found = this.employees.find((e: any) => (e.employeeCode && e.employeeCode === this.data.employeeCode) || (e.code && e.code === this.data.employeeCode));
          if (found) this.employeeFilter = found.fullName || found.name || found.employeeCode || '';
        }
        this.employeesLoading = false;
      },
      error: () => { this.employees = []; this.employeesLoading = false; }
    });
  }

  close() { this.dialogRef.close(null); }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.value;
    const dto: any = {
      EmployeeCode: v.employeeCode,
      DeductionDate: (v.deductionDate instanceof Date) ? v.deductionDate.toISOString() : v.deductionDate,
      DeductionAmount: Number(v.deductionAmount),
      DeductionReason: v.deductionReason
    };
    if (v.id) dto.id = v.id;
    this.dialogRef.close(dto);
  }

  onEmployeeFilterChange(q: string) {
    this.employeeFilter = q;
    if (!q || q.trim().length === 0) { this.form.patchValue({ employeeCode: '' }); }
  }

  onEmployeeSelected(event: any) {
    const selectedValue = event.option.value;
    this.form.patchValue({ employeeCode: selectedValue });
  }

  onEmployeeInputFocus() {
    // prevent opening the panel automatically unless user typed something
    try {
      if (!this.employeeFilter || this.employeeFilter.trim().length === 0) {
        this.autoTrigger?.closePanel();
      } else {
        this.autoTrigger?.openPanel();
      }
    } catch { }
  }
}
