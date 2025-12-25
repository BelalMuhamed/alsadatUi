import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TreeAccountDto } from '../models/TreeAccountDto';

@Injectable({
  providedIn: 'root'
})
export class TreeAccountsService {
apiUrl = environment.apiUrl;
constructor(private http: HttpClient) {}
 getTreeAccounts(): Observable<TreeAccountDto[]> {
    return this.http.get<TreeAccountDto[]>(`${this.apiUrl}TreeAccounts`)
  }

  addAccount(account: TreeAccountDto): Observable<any> {
    return this.http.post(`${this.apiUrl}`, account)
  }

  updateAccount(id: number, account: TreeAccountDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, account)
  }

  deleteAccount(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`)
  }
}
