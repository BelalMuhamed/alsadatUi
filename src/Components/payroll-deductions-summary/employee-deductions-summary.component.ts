import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { PayrollDeductionService } from '../../app/Services/payroll-deduction-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-employee-deductions-summary',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule],
  templateUrl: './employee-deductions-summary.component.html',
  styleUrls: ['./employee-deductions-summary.component.css']
})
export class EmployeeDeductionsSummaryComponent implements OnInit {
  private service = inject(PayrollDeductionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  empCode = '';
  items: any[] = [];
  totals: any = {};
  isLoading = false;
  pageNumber = 1;
  pageSize = 20;
  totalCount = 0;

  ngOnInit(): void {
    this.empCode = this.route.snapshot.params['empCode'] || this.route.snapshot.queryParams['empCode'] || '';
    if (!this.empCode) { Swal.fire('خطأ', 'لم يتم تمرير كود الموظف', 'error'); this.router.navigate(['/']); return; }
    this.loadSummary();
  }

  loadSummary() {
    this.isLoading = true;
    this.service.getEmployeeDeductionsWithSummary(this.empCode, undefined, undefined).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        // backend wraps in Result<T> => may be res.data or res?.data
        const payload = res?.data ?? res?.items ?? res ?? {};
        this.items = payload?.deductions ?? payload?.Deductions ?? [];
        this.totals = payload?.totals ?? payload?.Totals ?? {};
        // fallback: if res has Deductions and Totals directly
        if (res?.data?.deductions) this.items = res.data.deductions;
        if (res?.data?.totals) this.totals = res.data.totals;
        this.totalCount = (this.items || []).length;
      },
      error: (e) => { this.isLoading = false; Swal.fire('خطأ', e?.error?.message ?? 'فشل التحميل', 'error'); }
    });
  }

  restore(item: any) {
    Swal.fire({ title: 'تأكيد الاستعادة', showCancelButton: true }).then(r => { if (r.isConfirmed) {
      this.service.restorePayrollDeduction(item.id).subscribe({ next: () => { Swal.fire('تم', 'تمت الاستعادة', 'success'); this.loadSummary(); }, error: (e) => Swal.fire('خطأ', e?.error?.message ?? 'فشل', 'error') });
    }});
  }
}
