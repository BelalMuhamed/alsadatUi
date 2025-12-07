import { Component, inject, ViewChild } from '@angular/core';
import { CategoryService } from '../../app/Services/category-service';
import { Subscription } from 'rxjs';
import { ProductService } from '../../app/Services/product.service';
import { ProductDto, ProductFilterationDto } from '../../app/models/IProductVM';
import Swal from 'sweetalert2';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ColumnDef } from '../../Layouts/generic-table-component/generic-table-component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, CurrencyPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { AddAndEditProductPopupComponent } from '../../app/Popups/add-and-edit-product-popup/add-and-edit-product-popup.component';
import { log } from 'console';
import { CategoryDto, CategoryFilteration } from '../../app/models/ICategory';
import { MatOption } from "@angular/material/core";
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    MatTableModule,
    MatIconModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    FormsModule,
    HttpClientModule, DatePipe, CurrencyPipe,
    MatPaginator,
    ReactiveFormsModule,
    MatOption,MatSelectModule,  CommonModule  // ← مهم لـ *ngFor و *ngIf

],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent {

  private ProductService = inject(ProductService);
  private ProductSubscription = new Subscription();
  filters:ProductFilterationDto={
    categoryName:null,
    isDeleted:null,
    name:null,
    page:1,
    pageSize:10
  }
  @ViewChild(MatPaginator) paginator!: MatPaginator;
    isLoaded:boolean=false;
      columns: ColumnDef[] = [
        { key: 'name', label: 'اسم المنتج ' },
        { key: 'sellingPrice', label: 'سعر البيع', type: 'currency' },
        { key: 'pointPerUnit', label: 'عدد النقاط مقابل الوحدة' },
        { key: 'theHighestPossibleQuantity', label: 'أعلي كمية ممكنة ' },
        { key: 'theSmallestPossibleQuantity', label: 'أقل كمية ممكنة ' },
        { key: 'createAt', label: 'وقت الإنشاء ',type:'date' },
        { key: 'createBy', label: 'المنشئ' },
        { key: 'isDeleted', label: 'فعال', type: 'boolean' },
        { key: 'updateAt', label: ' وقت التحديث',type:'date' },
        { key: 'updateBy', label: 'اخر مستخدم قام بالتعديل ' },
        { key: 'deleteAt', label: ' وقت إيقاف التفعيل/التفعيل',type:'date' },
        { key: 'deleteBy', label: 'أخر مستخدم قام بإيقاف التفعيل/التفعيل' },
        { key: 'categoryName', label: 'الفئه' },
        { key: 'actions', label: 'الإجراءات', type: 'actions' },


      ];
    displayedColumnKeys = this.columns.map(c => c.key);
    totalCount = 0;
    dataSource = new MatTableDataSource<ProductDto>([]);
    private dialog =inject(MatDialog);
 private CategoryService = inject(CategoryService);
    private CategorySubscription = new Subscription();
     private fb = inject(FormBuilder);
      form!: FormGroup;
  categories: CategoryDto[] = [];

    ngOnInit():void
    {
      this.GetAllProducts();
      this.GetCategories();
      this.initForm();

    }
    ngOnDestroy():void
    {
      this.ProductSubscription?.unsubscribe();
    }
    GetAllProducts()
    {
      this.ProductSubscription.add(this.ProductService.getAllProducts(this.filters).subscribe({
        next:(res)=>{
          console.log(res);

           this.isLoaded=true;
         this.dataSource.data = res.data;
            this.totalCount = res.totalCount;

        },
        error:(err)=>{
            Swal.fire({
                          icon: 'error',
                          title: 'حدث خطأ',
                          text: `${err.message}`,
                          confirmButtonText: 'موافق',
                          confirmButtonColor: '#d33'
                        });
           this.isLoaded=true;

        }
      }))
    }
     ToggleCategoryStatus(dto: ProductDto, checked: boolean) {
    console.log(dto);

      dto.isDeleted = !checked;
      dto.deleteAt=new Date().toISOString();
      dto.deleteBy=localStorage.getItem('userName') + "|" + localStorage.getItem('userEmail'),
      this.ProductService.toggleStatus(dto).subscribe({
        next: () => {
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'حدث خطأ',
            text: `${err.message}`,
            confirmButtonText: 'موافق',
            confirmButtonColor: '#d33'
          });
        }
      });
    }
    onPageChange(event: PageEvent) {
        this.filters.page = event.pageIndex + 1;
        this.filters.pageSize = event.pageSize;
        this.GetAllProducts();
      }
 openAddEditPopup(product?: ProductDto) {
  const dialogRef = this.dialog.open(AddAndEditProductPopupComponent, {
    width: '600px',
    panelClass: 'custom-popup-panel',
    data: product ?? null // لو موجود بيانات يبقى تعديل، لو null يبقى إضافة
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.GetAllProducts(); // إعادة تحميل الجدول بعد الإضافة أو التعديل
    }
  });
}
  initForm() {

      this.form = this.fb.group({
        name: [ '', Validators.required],
         isDeleted: ['', Validators.required],
        categoryName:[ '', Validators.required],

      });

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
applyFilters() {
  // Get values from the form
  const formValues = this.form.value;

  // Assign them to the filters object
  this.filters = {
    ...this.filters, // keep existing pagination values
    name: formValues.name,
    isDeleted: formValues.isDeleted,
    categoryName: formValues.categoryName
  };

  console.log(this.filters);
  this.GetAllProducts();
}
ReAsign()
{
  this.filters={
    categoryName:null,
    isDeleted:null,
    name:null,
    page:1,
    pageSize:10
  }
this.initForm();
    this.GetAllProducts();
}
}
