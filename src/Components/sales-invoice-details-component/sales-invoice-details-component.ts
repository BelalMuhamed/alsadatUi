import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject, ViewChild } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SalesInvoiceFilterations, SalesInvoiceItemsResp, SalesInvoicesResponse } from '../../app/models/IsalesInvoice';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ColumnDef } from '../../Layouts/generic-table-component/generic-table-component';
import { Subscription } from 'rxjs';
import { SalesInvoice } from '../../app/Services/sales-invoice';
import Swal from 'sweetalert2';
import { log } from 'console';
import { MatSortModule } from '@angular/material/sort';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-sales-invoice-details-component',
  imports: [MatIconModule, MatCard, DatePipe, CurrencyPipe,MatTableModule,MatPaginatorModule,MatSortModule,HttpClientModule],
  standalone:true,
  templateUrl: './sales-invoice-details-component.html',
  styleUrl: './sales-invoice-details-component.css'
})
export class SalesInvoiceDetailsComponent {
 constructor(private route: ActivatedRoute , private cdr: ChangeDetectorRef) {

  }
  private SalesInvoiceUnSubscription = new Subscription();
  private SalesInvoiceService = inject(SalesInvoice);
 invoice: any;
 invoiceId!: number;

 salesInvoiceItems:SalesInvoiceItemsResp[]=[];

ngOnInit(): void {
  this.route.paramMap.subscribe(params => {
    setTimeout(() => { // 👈 هنا التأجيل
      this.invoiceId = Number(params.get('id'));
      if (this.invoiceId) {
        this.GetInvoiceDetails();
        this.GetInvoice();
      }
    });
  });
}

  columns: ColumnDef[] = [
  { key: 'productName', label: 'المنتج' },
  { key: 'sellingPrice', label: 'سعر البيع', type: 'currency' },
  { key: 'quantity', label: 'الكمية', type: 'number' },
  { key: 'discountPerItem', label: 'الخصم لكل قطعة', type: 'number' },
  { key: 'pointEarned', label: 'النقاط المكتسبة', type: 'number' },
   { key: 'total', label: 'الإجمالي', type: 'calculated' },
  // محتاج ازود الاجمال
];


  displayedColumnKeys = this.columns.map(c => c.key);
dataSource = new MatTableDataSource<SalesInvoiceItemsResp>();
  totalCount = 0;
  isLoading = false;

  getStatusText(status: number): string {
    switch (status) {
      case 0: return 'جديد';
      case 1: return 'دفع جزئي';
      case 2: return 'مدفوعة';
      case 3: return 'مرتجع';
      default: return 'غير معروف';
    }
  }


    printInvoice() {


  // 1) حوّل كل الـ canvas لصور
  document.querySelectorAll('canvas').forEach((canvas: any) => {
    const img = document.createElement('img');
    img.src = canvas.toDataURL();   // يحول الـ chart لصورة
    img.style.maxWidth = "100%";
    img.style.display = "block";
    img.classList.add("chart-print-img");

    // أخلي الصورة قبل الـ canvas
    canvas.parentNode?.insertBefore(img, canvas);
    canvas.style.display = 'none';
  });

  // 2) استنى شوية علشان الصور تلحق تظهر
  setTimeout(() => {
    window.print();

    // 3) بعد الطباعة رجّع الـ canvas
    document.querySelectorAll('canvas').forEach((canvas: any) => {
      canvas.style.display = 'block';
      if (canvas.previousSibling instanceof HTMLImageElement &&
          canvas.previousSibling.classList.contains("chart-print-img")) {
        canvas.previousSibling.remove();
      }
    });
  }, 300); // 300ms كفاية، تقدر تزود لو لسه في مشكلة


  }



  GetInvoiceDetails()
  {
    this.SalesInvoiceUnSubscription.add(this.SalesInvoiceService.GetSalesInvoiceItems(this.invoiceId).subscribe(
      {
        next:(res)=>{
          this.salesInvoiceItems=res.data;
            this.isLoading=false
this.dataSource = new MatTableDataSource(res.data);
            this.cdr.detectChanges();

        },error:(err)=>{
            this.isLoading=false

           Swal.fire({
                  icon: 'error',
                  title: 'حدث خطأ',
                  text: 'فشل في تحميل بيانات منتجات الفاتورة المبيعات. حاول مرة أخرى لاحقًا.',
                  confirmButtonText: 'موافق',
                  confirmButtonColor: '#d33'
                });
                this.cdr.detectChanges();
        }
      }
    ))
  }
  GetInvoice()
  {
    this.SalesInvoiceUnSubscription.add(this.SalesInvoiceService.GetSalesInvoiceById(this.invoiceId).subscribe(
      {
        next:(res)=>{
          this.invoice=res;
            this.isLoading=false
this.cdr.detectChanges();

        },error:(err)=>{

           Swal.fire({
                  icon: 'error',
                  title: 'حدث خطأ',
                  text: 'فشل في تحميل بيانات فاتورة المبيعات. حاول مرة أخرى لاحقًا.',
                  confirmButtonText: 'موافق',
                  confirmButtonColor: '#d33'


                });
                this.cdr.detectChanges();
        }
      }
    ))
  }

}
