import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { AuthResponse, loginDto, RefreshTokenDto } from '../models/IAuthModels';
import { tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Result } from '../models/ApiReponse';
import { HttpClient, HttpClientModule } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
    apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}
  login(dto:loginDto):Observable<Result<AuthResponse>> {
    return this.http.post<Result<AuthResponse>>(`${this.apiUrl}Auth/login`, dto);
  }
  refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');


  if (!refreshToken) return throwError(() => new Error('No refresh token'));
 const dto :RefreshTokenDto={
      token:refreshToken,
      ipAddress:refreshToken
    };
    return this.http.post<AuthResponse>(`${this.apiUrl}Auth/refresh`, dto).pipe(
      tap(res => {
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('refreshToken', res.refreshToken);
      })
    );
  }
   getToken() {
    return localStorage.getItem('accessToken');
  }
   logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
     localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
  }
}
