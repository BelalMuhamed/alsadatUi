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
      { path: 'general-setting/Governrates', component: GovernrateComponent, canActivate: [authGuard]},
      { path: 'general-setting/cities', component: CityComponent, canActivate: [authGuard]}

    ]
  },

  { path: '**', redirectTo: 'login' }
];
