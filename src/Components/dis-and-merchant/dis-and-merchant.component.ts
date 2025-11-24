import { DistributorsAndMerchantsFilters, DistributorsAndMerchantsDto } from './../../app/models/IDisAndMercDto';
import { HttpClientModule } from '@angular/common/http';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCellDef, MatColumnDef, MatHeaderCellDef, MatHeaderRowDef, MatRowDef, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DisAndMerchantService } from '../../app/Services/dis-and-merchant.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { ColumnDef } from '../../Layouts/generic-table-component/generic-table-component';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dis-and-merchant',
  standalone: true,
  imports: [MatProgressSpinner, MatColumnDef, MatHeaderCellDef, MatCellDef, MatIcon, MatHeaderRowDef, MatRowDef,
    MatTableModule,
    MatProgressSpinner,
    MatColumnDef,
    MatHeaderCellDef,
    MatCellDef,
    MatIcon,
    MatHeaderRowDef,
    MatRowDef,
    MatSlideToggleModule, MatFormField, MatLabel, FormsModule, MatTableModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule, HttpClientModule, MatPaginator,    DatePipe],
  templateUrl: './dis-and-merchant.component.html',
  styleUrl: './dis-and-merchant.component.css'
})
export class DisAndMerchantComponent {
  private _DisAndMerchantService = inject(DisAndMerchantService);
  private _DisAndMerchantSubscription = new Subscription();
  filters:DistributorsAndMerchantsFilters={
    page:1,
    pageSize:10,
    cityName:null,
    fullName:null,
    phoneNumber:null,
    type:null
  }
 columns: ColumnDef[] = [
  { key: 'fullName', label: 'الاسم بالكامل', type: 'text' },
  { key: 'address', label: 'العنوان', type: 'text' },
  { key: 'type', label: 'النوع (موزع/تاجر)', type: 'DisOrMecrhant' },

  { key: 'pointsBalance', label: 'رصيد النقاط', type: 'number' },
  { key: 'cashBalance', label: 'الرصيد النقدي', type: 'currency' },
  { key: 'indebtedness', label: 'المديونية', type: 'currency' },

  { key: 'createdAt', label: 'تاريخ الإنشاء', type: 'date' },
  { key: 'createdBy', label: 'أنشئ بواسطة', type: 'text' },
  { key: 'updatedAt', label: 'تاريخ التعديل', type: 'date' },
  { key: 'updatedBy', label: 'عُدّل بواسطة', type: 'text' },

  // Soft Delete toggle
  { key: 'isDelted', label: 'حالة الحذف', type: 'boolean' },

  { key: 'deletedAt', label: 'تاريخ الحذف', type: 'date' },
  { key: 'deletedBy', label: 'حُذف بواسطة', type: 'text' },

  { key: 'cityName', label: 'المدينة', type: 'text' },
  { key: 'phoneNumber', label: 'رقم الهاتف', type: 'text' },
{ key: 'actions', label: 'الإجراءات', type: 'actions' },

];
  displayedColumnKeys = this.columns.map(c => c.key);
       dataSource = new MatTableDataSource<DistributorsAndMerchantsDto>([]);
       totalCount = 0;
        @ViewChild(MatPaginator) paginator!: MatPaginator;
       isLoading = true;
    ngOnInit(): void {
      this.GetAllDisAdnMerchants();
    }
    ngOnDestroy():void{
      this._DisAndMerchantSubscription?.unsubscribe();
    }
    GetAllDisAdnMerchants()
    {
      this._DisAndMerchantSubscription.add(this._DisAndMerchantService.getAllDisAndMerch(this.filters).subscribe({
        next:(res)=>{
  this.dataSource.data = res.data;
            this.totalCount=res.totalCount;
            this.isLoading = false;
            console.log(res.data);

        },
        error:(err)=>{
            this.isLoading = false;

           Swal.fire({
                  icon: 'error',
                  title: 'خطأ',
                  text: `${err.error.message}`||'حدثت مشكلة أثناء تغيير الحالة!',
                });
        }
      }))
    }
    onPageChange(event: PageEvent) {
      this.filters.page = event.pageIndex + 1;
      this.filters.pageSize = event.pageSize;
      this.GetAllDisAdnMerchants();
    }
    ToggleCategoryStatus(dto: DistributorsAndMerchantsDto, checked: boolean) {
    console.log(dto);

      dto.isDelted = !checked;
      dto.deletedAt=new Date().toISOString();
      dto.deletedBy=localStorage.getItem('userName') + "|" + localStorage.getItem('userEmail')
      this._DisAndMerchantService.EditDisOrMerchant(dto).subscribe({
          next: (res) => {

            console.log(res);

      Swal.fire({
        icon: res.isSuccess ? 'success' : 'error',
        title: res.message ?? res.data,
      });
       this.GetAllDisAdnMerchants();
    },
    error: (err) => {
      console.error(err);
      Swal.fire('Error', 'Something went wrong', 'error');
       this.GetAllDisAdnMerchants();
    }
      })
    }

}
