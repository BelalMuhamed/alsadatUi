import { AddEditSupplierComponent } from './../Components/add-edit-supplier/add-edit-supplier.component';
import { Routes } from '@angular/router';
import { AuthLayout } from '../Layouts/auth-layout/auth-layout';
import { SideBarComponent } from '../Layouts/side-bar-component/side-bar-component';
import { SalesInvoicesComponent } from '../Components/sales-invoices-component/sales-invoices-component';
import { authGuard } from '../Guards/auth-gard-guard';
import { SalesInvoiceDetailsComponent } from '../Components/sales-invoice-details-component/sales-invoice-details-component';
import { CopounComponent } from '../Components/copoun-component/copoun-component';
import { BillDiscountComponent } from '../Components/bill-discount-component/bill-discount-component';
import { CategoriesComponent } from '../Components/categories-component/categories-component';
import { ProductComponent } from '../Components/product/product.component';
import { GovernrateComponent } from '../Components/governrate/governrate.component';
import { CityComponent } from '../Components/city/city.component';
import { DisAndMerchantComponent } from '../Components/dis-and-merchant/dis-and-merchant.component';
import { HrAttendanceComponent } from '../Components/hr-attendance-component/hr-attendance-component';
import { HrAttendanceRecordComponent } from '../Components/hr-attendance-record-component/hr-attendance-record-component';
import { TransactionsComponent } from '../Components/transactions/transactions.component';
import { StoresComponent } from '../Components/stores/stores.component';
import { EmployeesListComponent } from '../Components/employees-list-component/employees-list-component';
import { RolesComponent } from '../Components/roles-component/roles-component';
import { EmployeeAddComponent } from '../Components/employee-add-component/employee-add-component';
import { EmployeeSalaryComponent } from '../Components/employee-salary-component/employee-salary-component';
import { StockComponent } from '../Components/stock/stock.component';
import { SalarySearchComponent } from '../Components/salary-search-component/salary-search-component';
import { QuickAttendanceComponent } from '../Components/quick-attendance-component/quick-attendance-component';
import { DepartmentComponent } from '../Components/department-component/department-component';
import { PublicHolidayComponent } from '../Components/public-holiday-component/public-holiday-component';
import { TreeAccountsComponent } from '../Components/tree-accounts/tree-accounts.component';
import { SupplierComponent } from '../Components/supplier/supplier.component';

export const routes: Routes = [
  { path: 'login', component: AuthLayout },

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: '',
    component: SideBarComponent,
    children: [
      { path: 'SalesInvoices', component: SalesInvoicesComponent, canActivate: [authGuard]},
      { path: 'sales-invoices/details/:id', component: SalesInvoiceDetailsComponent, canActivate: [authGuard]},
      { path: 'Copouns', component: CopounComponent, canActivate: [authGuard]},
      { path: 'general-setting/bill-discounts', component: BillDiscountComponent, canActivate: [authGuard]},
      { path: 'Categories', component: CategoriesComponent, canActivate: [authGuard]},
      { path: 'Products', component: ProductComponent, canActivate: [authGuard]},
      { path: 'DistributorsAndMerchants', component: DisAndMerchantComponent, canActivate: [authGuard]},
      { path: 'general-setting/Governrates', component: GovernrateComponent, canActivate: [authGuard]},
      { path: 'general-setting/cities', component: CityComponent, canActivate: [authGuard]},
      { path: 'hr/attendance', component: HrAttendanceComponent, canActivate: [authGuard]},
      { path: 'hr/attendance-record', component: HrAttendanceRecordComponent, canActivate: [authGuard]},
      { path: 'transactions/all', component: TransactionsComponent, canActivate: [authGuard]},
      { path: 'stores/all', component: StoresComponent, canActivate: [authGuard]},
      {
  path: 'supplier/all',
  loadComponent: () =>
    import('../Components/supplier/supplier.component')
      .then(c => c.SupplierComponent),
  canActivate: [authGuard]
},
{
  path: 'supplier/add',
  loadComponent: () =>
    import('../Components/add-edit-supplier/add-edit-supplier.component')
      .then(c => c.AddEditSupplierComponent),
  canActivate: [authGuard]
},
{
  path: 'supplier/edit/:id',
  loadComponent: () =>
    import('../Components/add-edit-supplier/add-edit-supplier.component')
      .then(m => m.AddEditSupplierComponent),
  canActivate: [authGuard]
}
,

      { path: 'stocks', component: StockComponent, canActivate: [authGuard]},
      { path: 'hr/employees', component: EmployeesListComponent, canActivate: [authGuard]},
      { path: 'hr/employee-salary/:empCode', component: EmployeeSalaryComponent, canActivate: [authGuard]},
      { path: 'hr/roles', component: RolesComponent, canActivate: [authGuard]},
      { path: 'hr/employees/add', component: EmployeeAddComponent, canActivate: [authGuard]},
      { path: 'hr/salaries', component: SalarySearchComponent, canActivate: [authGuard]},
      { path: 'hr/quick-attendance', component: QuickAttendanceComponent, canActivate: [authGuard]},
      { path: 'hr/departments', component: DepartmentComponent, canActivate: [authGuard]},
      { path: 'hr/public-holidays', component: PublicHolidayComponent, canActivate: [authGuard]},
       { path: 'tree', component: TreeAccountsComponent, canActivate: [authGuard]},

    ]
  },

  { path: '**', redirectTo: 'login' }
];
