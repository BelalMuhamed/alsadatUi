import { ChangeDetectorRef, Component, inject, ViewChild } from '@angular/core';
import { finalize, Subscription } from 'rxjs';
import { SalesInvoice } from '../../app/Services/sales-invoice';
import { SalesInvoiceFilterations, SalesInvoicesResponse } from '../../app/models/IsalesInvoice';
import Swal from 'sweetalert2';
import { ColumnDef, GenericTableComponent } from '../../Layouts/generic-table-component/generic-table-component';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ApiResponse } from '../../app/models/ApiReponse';
import { MatIconModule } from '@angular/material/icon';
import { getArabicPaginatorIntl } from '../../app/transaltes/paginatortranslate';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { log } from 'console';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-sales-invoices-component',
   providers: [
    { provide: MatPaginatorIntl, useValue: getArabicPaginatorIntl() }
  ],
  imports: [CommonModule,MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
  MatIconModule,
ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
     MatSelectModule,
    MatInputModule,    MatNativeDateModule,HttpClientModule,HttpClientModule],
    standalone:true,
  templateUrl: './sales-invoices-component.html',
  styleUrl: './sales-invoices-component.css'
})
export class SalesInvoicesComponent {
@ViewChild(MatPaginator) paginator!: MatPaginator;

   columns: ColumnDef[] = [
    { key: 'createdAt', label: 'تاريخ الشراء', type: 'date' },
    { key: 'distributorName', label: 'الموزع' },
    { key: 'totalBeforDiscounts', label: 'قبل الخصم', type: 'currency' },
    { key: 'totalAfterDiscounts', label: 'بعد الخصم', type: 'currency' },
    { key: 'paid', label: 'مدفوع', type: 'currency' },
    { key: 'residual', label: 'متبقي', type: 'currency' },
    { key: 'totalCopouns', label: 'الكوبونات المستحقة ', type: 'number' },
    { key: 'createdBy', label: 'منشئ الفاتورة' },
    { key: 'isReturn', label: 'فاتورة مرتجع', type: 'boolean' },
    { key: 'salesInvoiceStatus', label: 'حالة الفاتورة', type: 'number' },
    { key: 'actions', label: 'الإجراءات', type: 'actions' }
  ];

  displayedColumnKeys = this.columns.map(c => c.key);
  dataSource = new MatTableDataSource<SalesInvoicesResponse>([]);
  totalCount = 0;
  isLoading = false;
 range!:FormGroup;

  filters: SalesInvoiceFilterations = {
    page: 1,
    pageSize: 10,
    salesInvoiceType: null,
    craetedBy:null,
    distributorName:null,
    dates:null
  };

  constructor(private invoiceService:SalesInvoice, private cdr: ChangeDetectorRef,private fb:FormBuilder,private router: Router) {}

  ngOnInit(): void {
    this.initDateForm();
  setTimeout(() => this.loadInvoices(), 0);
}

  ngAfterViewInit(): void {
  this.dataSource.paginator = this.paginator;
}

  loadInvoices() {
    this.isLoading = true;
  this.invoiceService.getAllSalesInvoices(this.filters).subscribe({

    next: (res: ApiResponse<SalesInvoicesResponse[]>) => {

      this.dataSource.data = res.data;
      this.totalCount = res.totalCount;
            this.cdr.markForCheck();

      this.isLoading = false;


    },
    error: () => { this.isLoading = false;
            this.cdr.markForCheck();

      Swal.fire({
        icon: 'error',
        title: 'حدث خطأ',
        text: 'فشل في تحميل فواتير المبيعات. حاول مرة أخرى لاحقًا.',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#d33'
      });
    }
  });
  }

  onPageChange(event: PageEvent) {
    this.filters.page = event.pageIndex + 1;
    this.filters.pageSize = event.pageSize;
    this.loadInvoices();
  }

  getStatusText(status: number): string {
    switch (status) {
      case 0: return 'جديد';
      case 1: return 'دفع جزئي';
      case 2: return 'مدفوعة';
      case 3: return 'مرتجع';
      default: return 'غير معروف';
    }
  }
      initDateForm(){
    this.range = this.fb.group({
      start:[''],
      end:[''],
    })
  }
  onFilter() {
    let stringDate = JSON.stringify(this.range.value);
    let dateObj = JSON.parse(stringDate);
    let startDate = dateObj.start.substring(0,10);
    let endDate = dateObj.end.substring(0,10);
  if(startDate !=null && endDate !=null)
  {
    this.filters.dates=[startDate,endDate];
  }
  this.filters.page = 1;

  this.loadInvoices();
}

onReset() {
  this.filters = {
    page: 1,
    pageSize: 10,
    salesInvoiceType: null,
    craetedBy: null,
    distributorName: null,
    dates: null
  };
  this.loadInvoices();
}

goToDetails(invoice: any) {

  this.router.navigate(['/sales-invoices/details', invoice.id]);
}
}
