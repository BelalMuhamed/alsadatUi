import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ProductDto } from '../../models/IProductVM';
import { CategoryService } from '../../Services/category-service';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../Services/product.service';
import { CategoryDto, CategoryFilteration } from '../../models/ICategory';
import { MatError, MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect, MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-and-edit-product-popup',
  standalone: true,
  imports: [MatFormField, MatLabel, MatError,
       CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule],
  templateUrl: './add-and-edit-product-popup.component.html',
  styleUrl: './add-and-edit-product-popup.component.css'
})
export class AddAndEditProductPopupComponent {

   private CategoryService = inject(CategoryService);
    private CategorySubscription = new Subscription();
      private ProductService = inject(ProductService);
      private ProductSubscription = new Subscription();
    private fb = inject(FormBuilder);
  categories: CategoryDto[] = [];

    form!: FormGroup;
    isEditMode = false;
constructor(
    private dialogRef: MatDialogRef<AddAndEditProductPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProductDto | null
  ) {}
    ngOnInit(): void {
      this.initForm();
      this.GetCategories();

  }

  ngOnDestroy(): void {
    this.CategorySubscription?.unsubscribe();
    this.ProductSubscription?.unsubscribe();
  }
  initForm() {
      this.form = this.fb.group({
        name: [this.data?.name || '', Validators.required],
         sellingPrice: [this.data?.sellingPrice || '', Validators.required],
        pointPerUnit:[this.data?.pointPerUnit || '', Validators.required],
        categoryId:[this.data?.categoryId || '', Validators.required],
        theHighestPossibleQuantity:[this.data?.theHighestPossibleQuantity||'',Validators.required],
        theSmallestPossibleQuantity:[this.data?.theSmallestPossibleQuantity||'',Validators.required]
      });

      this.isEditMode = !!this.data;
    }
    GetCategories()
    {
      const categoriesFilter:CategoryFilteration={
        categoryName:null,
        isDeleted:false,
        page:null,
        pageSize:null
      }
      this.CategorySubscription.add(this.CategoryService.getAllCategories(categoriesFilter).subscribe({
        next:(res)=>{
          this.categories=res.data;
        }
        ,error:(err)=>{
          console.log(err);

        }
      }))
    }
      close() {
    this.dialogRef.close(null);
  }
//   save()
//   {
//       if (this.form.valid) {

//     const product:ProductDto={
//       id:null, // existing product id or null for new product
//       name: this.form.get('name')?.value ?? null,
//        sellingPrice: Number(this.form.get('sellingPrice')?.value ?? 0), // convert to number
//       pointPerUnit: Number(this.form.get('pointPerUnit')?.value ?? 0), // convert to number
//       categoryId: Number(this.form.get('categoryId')?.value ?? 0),
//       categoryName: null,
//       createBy: this.data?.createBy ?? localStorage.getItem('userName') + '|' + localStorage.getItem('userEmail'),
//       createAt: this.data?.createAt ?? new Date().toISOString(),
//       updateBy: null,
//       updateAt: null,
//       isDeleted: false,
//       deleteBy:  null,
//       deleteAt:  null
//     }
//     console.log(product);

//     this.ProductSubscription.add(this.ProductService.addProduct(product).subscribe({
//       next:()=>{
//   Swal.fire({
//               icon: 'success',
//               title: 'تم التحديث',
//               text: 'تم  الاضافة بنجاح',
//               timer: 1200,
//               showConfirmButton: false
//             });
//             this.dialogRef.close(true);
//       },
//       error:(err)=>{
//  Swal.fire({
//               icon: 'error',
//               title: 'خطأ',
//               text: err.error?.message || 'حدثت مشكلة أثناء الحفظ!',
//             });
//       }
//     }))

//   } else {
//      Swal.fire({
//               icon: 'error',
//               title: 'خطأ',
//               text: 'النموذج غير صالح',
//             });
//   }
//   }
save() {
      console.log(this.data);

  if (!this.form.valid) {
    Swal.fire({
      icon: 'error',
      title: 'خطأ',
      text: 'النموذج غير صالح',
    });
    return;
  }

  let product: ProductDto;

  if (this.isEditMode) {
    // حالة التعديل: لا نغير createBy/createAt
    product = {
      id: this.data!.id,
      name: this.form.get('name')?.value ?? null,
      sellingPrice: Number(this.form.get('sellingPrice')?.value ?? 0),
      pointPerUnit: Number(this.form.get('pointPerUnit')?.value ?? 0),
      categoryId: Number(this.form.get('categoryId')?.value ?? 0),
      categoryName: this.categories.find(c => c.id === this.form.get('categoryId')?.value)?.name ?? null,
      createBy: this.data!.createBy,
      createAt: this.data!.createAt,
      updateBy: localStorage.getItem('userName') + '|' + localStorage.getItem('userEmail'),
      updateAt: new Date().toISOString(),
      isDeleted: this.data!.isDeleted,
      deleteBy: this.data!.deleteBy,
      deleteAt: this.data!.deleteAt,
      theHighestPossibleQuantity:Number(this.form.get('theHighestPossibleQuantity')?.value ?? 0),
      theSmallestPossibleQuantity:Number(this.form.get('theSmallestPossibleQuantity')?.value ?? 0),
    };

    this.ProductSubscription.add(
      this.ProductService.editProduct(product).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: 'تم التعديل بنجاح', timer: 1200, showConfirmButton: false });
          this.dialogRef.close(true);
        },
        error: (err) => {
          Swal.fire({ icon: 'error', title: 'خطأ', text: err.error?.message || 'حدثت مشكلة أثناء الحفظ!' });
        }
      })
    );
  } else {
    // حالة الإضافة: لا نرسل updateBy/updateAt
    product = {
      id: null,
      name: this.form.get('name')?.value ?? null,
      sellingPrice: Number(this.form.get('sellingPrice')?.value ?? 0),
      pointPerUnit: Number(this.form.get('pointPerUnit')?.value ?? 0),
      categoryId: Number(this.form.get('categoryId')?.value ?? 0),
      categoryName: this.categories.find(c => c.id === this.form.get('categoryId')?.value)?.name ?? null,
      createBy: localStorage.getItem('userName') + '|' + localStorage.getItem('userEmail'),
      createAt: new Date().toISOString(),
      updateBy: null,
      updateAt: null,
      isDeleted: false,
      deleteBy: null,
      deleteAt: null,
      theHighestPossibleQuantity:Number(this.form.get('theHighestPossibleQuantity')?.value ?? 0),
      theSmallestPossibleQuantity:Number(this.form.get('theSmallestPossibleQuantity')?.value ?? 0),


    };

    this.ProductSubscription.add(
      this.ProductService.addProduct(product).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: 'تمت الإضافة بنجاح', timer: 1200, showConfirmButton: false });
          this.dialogRef.close(true);
        },
        error: (err) => {
          Swal.fire({ icon: 'error', title: 'خطأ', text: err.error?.message || 'حدثت مشكلة أثناء الحفظ!' });
        }
      })
    );
  }
}


}
