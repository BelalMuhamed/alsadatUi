import { PurchaseInvoiceService } from './../../app/Services/purchase-invoice.service';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { PurchaseInvoiceDtos } from '../../app/models/IPurchaseInvoiceVMs';
import Swal from 'sweetalert2';
import { MatCard, MatCardTitle, MatCardSubtitle } from "@angular/material/card";
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-purchase-invoice-details',
  standalone: true,
  imports: [MatCard, MatCardTitle,CommonModule, MatCardTitle, MatCard,MatTableModule],
  templateUrl: './purchase-invoice-details.component.html',
  styleUrl: './purchase-invoice-details.component.css'
})
export class PurchaseInvoiceDetailsComponent {
  displayedColumns: string[] = ['product', 'quantity', 'price', 'discount','total'];
 private _PurchaseInvoiceService = inject(PurchaseInvoiceService);
  private _PurchaseInvoiceSubscription = new Subscription();
  constructor(  private route: ActivatedRoute) {}
invoiceId: number | null = null;
invoice!:PurchaseInvoiceDtos;

  ngOnInit(): void
  {

  this.route.paramMap.subscribe(params => {
    const id = params.get('id');
    if (id) {

      this.invoiceId = +id;

    }
  });
  this.GetCurrentInvoiceDetails();
  }

  ngOnDestroy():void
  {
this._PurchaseInvoiceSubscription?.unsubscribe();
  }
GetCurrentInvoiceDetails()
  {
    if(this.invoiceId != null && this.invoiceId != undefined)
    {
this._PurchaseInvoiceSubscription.add(this._PurchaseInvoiceService.getPurchaseInvoiceById(this.invoiceId).subscribe({
next: (res) => {
  if (res.data) {
    console.log(res.data);

    this.invoice = res.data;
    console.log(res);
  } else {
    Swal.fire({
      icon: 'error',
      title: 'خطأ',
      text: 'الفاتورة غير موجودة',
      confirmButtonText: 'موافق',
      confirmButtonColor: '#d33'
    });
  }
},
error:(err)=>{
console.log(err);


}

}))
    }
    else
    {
        Swal.fire({
                      icon: "error",
                      title: "حدث خطأ",
                      text: `لا يمكن تحميل بيانات فاتورة بدون معرف `,
                      confirmButtonText: "موافق",
                      confirmButtonColor: "#d33",
                    })
    }

  }
}
