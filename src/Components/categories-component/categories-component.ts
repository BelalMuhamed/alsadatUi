import { ChangeDetectorRef, Component, inject, ViewChild } from '@angular/core';
import { CategoryService } from '../../app/Services/category-service';
import { Subscription } from 'rxjs';
import { CategoryDto, CategoryFilteration } from '../../app/models/ICategory';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {  MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import {  MatIconModule } from "@angular/material/icon";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import {  MatInputModule } from "@angular/material/input";
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { AddCategoryCoponentPopup } from '../../app/Popups/add-category-coponent-popup/add-category-coponent-popup';
import { ColumnDef } from '../../Layouts/generic-table-component/generic-table-component';
import Swal from 'sweetalert2';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-categories-component',
 imports: [
    MatTableModule,
    MatIconModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    FormsModule,
    MatPaginator,
    HttpClientModule
]
,
standalone:true,
  templateUrl: './categories-component.html',
  styleUrl: './categories-component.css'
})
export class CategoriesComponent {
  /**
   *
   */
  constructor(private router: Router) {


  }
 private CategoryService = inject(CategoryService);
  private  CategorySubscription = new Subscription();
private dialog =inject(MatDialog);

@ViewChild(MatPaginator) paginator!: MatPaginator;
SearchName:string='';
  isLoaded:boolean=false;
    columns: ColumnDef[] = [
      { key: 'name', label: 'الفئه ' },
      { key: 'createAt', label: 'وقت الإنشاء ' },
      { key: 'createBy', label: 'المنشئ' },
      { key: 'isDeleted', label: 'فعال', type: 'boolean' },
      { key: 'updateAt', label: ' وقت التحديث' },
      { key: 'updateBy', label: 'اخر مستخدم قام بالتعديل ' },
      { key: 'deleteAt', label: 'وقت إيقاف التفعيل' },
      { key: 'deleteBy', label: 'أخر مستخدم قام بإيقاف التفعيل' },
      { key: 'actions', label: 'الإجراءات', type: 'actions' },


    ];
  displayedColumnKeys = this.columns.map(c => c.key);
  totalCount = 0;
  dataSource = new MatTableDataSource<CategoryDto>([]);
private cdr=inject(ChangeDetectorRef)

  Filteration:CategoryFilteration={
     categoryName:null,
  isDeleted: null,
  pageSize: 10,
  page: 1
  }
  ngOnInit(): void {
 setTimeout(() =>    this.GetAllCategories(), 0);
    }
    ngOnDestroy():void{
     this.CategorySubscription?.unsubscribe();
    }
    GetAllCategories()
    {
this.CategorySubscription.add(this.CategoryService.getAllCategories(this.Filteration).subscribe({
      next:(res)=>{

        this.isLoaded=true;
         this.dataSource.data = res.data;
            this.totalCount = res.totalCount;
      this.cdr.markForCheck();

        console.log(res);

      },error:(err)=>{
        Swal.fire({
                          icon: 'error',
                          title: 'حدث خطأ',
                          text: `${err.message}`,
                          confirmButtonText: 'موافق',
                          confirmButtonColor: '#d33'
                        });
        this.isLoaded=true;
      this.cdr.markForCheck();

      }
    }))
    }
   ToggleCategoryStatus(dto: CategoryDto, checked: boolean) {
console.log(dto);

  dto.isDeleted = !checked;
  dto.deleteAt=new Date().toISOString();
  dto.deleteBy=localStorage.getItem('userName') + "|" + localStorage.getItem('userEmail'),
  this.CategoryService.ToggleStatus(dto).subscribe({
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
    this.Filteration.page = event.pageIndex + 1;
    this.Filteration.pageSize = event.pageSize;
    this.GetAllCategories();
  }
  openAddCouponPopup() {
    const dialogRef =  this.dialog.open(AddCategoryCoponentPopup, {
        width: '600px',
        panelClass: 'custom-popup-panel'
      });
dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // Navigate بعد إغلاق الـ popup
      this.GetAllCategories();
    }
  });
    }
    Search()
    {
      this.Filteration={
     categoryName:this.SearchName,
  isDeleted: null,
  pageSize: 10,
  page: 1
  }
  this.GetAllCategories();
    }
    openEditCategoryPopup(category: CategoryDto) {
  const dialogRef = this.dialog.open(AddCategoryCoponentPopup, {
    width: '600px',
    panelClass: 'custom-popup-panel',
    data: category
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.GetAllCategories();
    }
  });
}

}
