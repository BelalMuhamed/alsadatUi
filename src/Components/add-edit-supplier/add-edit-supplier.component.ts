import { Component, inject } from '@angular/core';
import { ProductService } from '../../app/Services/product.service';
import { Subscription } from 'rxjs';
import { ProductFilterationDto, ProductWithSupplierDto } from '../../app/models/IProductVM';
import Swal from 'sweetalert2';
import { CityServiceService } from '../../app/Services/city-service.service';
import { ICityFilteration } from '../../app/models/Icity';
import { SupplierService } from '../../app/Services/supplier.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-edit-supplier',
  standalone: true,
  imports: [],
  templateUrl: './add-edit-supplier.component.html',
  styleUrl: './add-edit-supplier.component.css'
})
export class AddEditSupplierComponent {
 private ProductService = inject(ProductService);
  private ProductSubscription = new Subscription();
cityFilters:ICityFilteration={
  page:null,
  pageSize:null,
  cityName:null,
  governrateName:null
    }
    private supplierService = inject(SupplierService);
    private  fb = inject(FormBuilder);
    private  router = inject(Router);
    private  route = inject(ActivatedRoute);
  form!: FormGroup;
  supplierId: number | null = null;



    private CityService = inject(CityServiceService);
    private CitySubscription = new Subscription();
  filters:ProductFilterationDto={
      categoryName:null,
      isDeleted:false,
      name:null,
      page:null,
      pageSize:null
    }
ngOnInit():void
    {
      this.GetAllProducts();
      this.GetAllCities();
      this.IntializeForm();
       this.supplierId = +this.route.snapshot.params['id'];
    if (this.supplierId) this.loadSupplier(this.supplierId);
    }
 createProductFormGroup(product?: ProductWithSupplierDto): FormGroup {
    return this.fb.group({
      productId: [product?.productId || null],
      productName: [product?.productName || '', Validators.required]
    });
  }

  addProduct() {
    this.products.push(this.createProductFormGroup());
  }
 get products(): FormArray {
    return this.form.get('products') as FormArray;
  }
  removeProduct(index: number) {
    this.products.removeAt(index);


}
 GetAllProducts()
    {
      this.ProductSubscription.add(this.ProductService.getAllProducts(this.filters).subscribe(
        {
          next:(res)=>{
            console.log(res.data);

          },
          error:(err)=>{
               Swal.fire({
                                      icon: 'error',
                                      title: 'حدث خطأ',
                                      text: `${err.message}`,
                                      confirmButtonText: 'موافق',
                                      confirmButtonColor: '#d33'
                                    });
          }
        }
      ))
    }
     GetAllCities()
       {
        this.CitySubscription.add(this.CityService.getAllCities(this.cityFilters).subscribe({
          next:(res)=>{
            console.log(res.data);

          },
          error:(err)=>{
               Swal.fire({
                                       icon: 'error',
                                       title: 'حدث خطأ',
                                       text: `${err.message}`,
                                       confirmButtonText: 'موافق',
                                       confirmButtonColor: '#d33'
                                     });
          }
        }))
       }


       IntializeForm()
       {
         this.form = this.fb.group({

      name: ['', Validators.required],
      phoneNumbers: ['', Validators.required],
      address: [''],
      cityId: [null, Validators.required],
      cityName: [''],
      isDeleted: [false],
      products: this.fb.array([]) // هنا هنعمل FormArray للمنتجات
    });
       }
       loadSupplier(id: number) {
    this.supplierService.getById(id).subscribe((res) => {
      this.form.patchValue(res);
      if (res.products) {
        res.products.forEach(p => this.products.push(this.createProductFormGroup(p)));
      }
    });
  }



}
