import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CategoryDto } from '../../models/ICategory';
import { CategoryService } from '../../Services/category-service';
import { Subscription } from 'rxjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-category-coponent-popup',
 imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule
  ],
standalone:true,
  templateUrl: './add-category-coponent-popup.html',
  styleUrl: './add-category-coponent-popup.css'
})
export class AddCategoryCoponentPopup {

 private CategoryService = inject(CategoryService);
  private CategorySubscription = new Subscription();
  private fb = inject(FormBuilder);

  form!: FormGroup;
  isEditMode = false;

  constructor(
    private dialogRef: MatDialogRef<AddCategoryCoponentPopup>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: CategoryDto | null
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    this.CategorySubscription?.unsubscribe();
  }

  initForm() {
    this.form = this.fb.group({
      name: [this.data?.name || '', Validators.required],
    });

    this.isEditMode = !!this.data;
  }

  save() {
    if (this.form.invalid) return;

    const nameValue = this.form.get('name')?.value;

    if (this.isEditMode && this.data) {
      // ✅ تعديل
      const updatedCategory: CategoryDto = {
        ...this.data,
        name: nameValue,
        updateAt: new Date().toISOString(),
        updateBy: localStorage.getItem('userName') + "|" + localStorage.getItem('userEmail'),
      };

      this.CategorySubscription.add(
        this.CategoryService.editCategory(updatedCategory).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'تم التحديث',
              text: 'تم تعديل الفئة بنجاح',
              timer: 1200,
              showConfirmButton: false
            });
            this.dialogRef.close(true);
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'خطأ',
              text: err.error?.message || 'حدثت مشكلة أثناء التحديث!',
            });
          }
        })
      );
    } else {
      // 🟢 إضافة
      const newCategory: CategoryDto = {
        id:null,
        name: nameValue,
        createAt: new Date().toISOString(),
        createBy: localStorage.getItem('userName') + "|" + localStorage.getItem('userEmail'),
        deleteAt: null,
        deleteBy: null,
        isDeleted: false,
        updateAt: null,
        updateBy: null
      };

      this.CategorySubscription.add(
        this.CategoryService.addCategory(newCategory).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'تمت الإضافة',
              text: 'تم إضافة الفئة بنجاح',
              timer: 1200,
              showConfirmButton: false
            });
            this.dialogRef.close(true);
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'خطأ',
              text: err.error?.message || 'حدثت مشكلة أثناء الإضافة!',
            });
          }
        })
      );
    }
  }

  close() {
    this.dialogRef.close(null);
  }
}
