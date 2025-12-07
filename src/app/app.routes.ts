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
import { EmployeesListComponent } from '../Components/employees-list-component/employees-list-component';
import { RolesComponent } from '../Components/roles-component/roles-component';
import { EmployeeAddComponent } from '../Components/employee-add-component/employee-add-component';
import { EmployeeSalaryComponent } from '../Components/employee-salary-component/employee-salary-component';

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
      { path: 'hr/employees', component: EmployeesListComponent, canActivate: [authGuard]},
      { path: 'hr/employee-salary/:empCode', component: EmployeeSalaryComponent, canActivate: [authGuard]},
      { path: 'hr/roles', component: RolesComponent, canActivate: [authGuard]},
      { path: 'hr/employees/add', component: EmployeeAddComponent, canActivate: [authGuard]},

    ]
  },

  { path: '**', redirectTo: 'login' }
];
