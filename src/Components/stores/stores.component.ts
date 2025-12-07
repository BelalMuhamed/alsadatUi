import { Component, inject } from '@angular/core';
import { StoreService } from '../../app/Services/store.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-stores',
  standalone: true,
  imports: [],
  templateUrl: './stores.component.html',
  styleUrl: './stores.component.css'
})
export class StoresComponent {
private _StoreService = inject(StoreService);
private _StoreSubscription = new Subscription();
}
