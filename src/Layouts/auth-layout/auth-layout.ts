import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../app/Services/auth-service';
import { loginDto } from '../../app/models/IAuthModels';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css'
})
export class AuthLayout implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
    }
  }

  login() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = null;

    const dto: loginDto = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(dto).subscribe({
      next: res => {
        console.log('Login success:', res);

        localStorage.setItem('refreshToken', res.data?.refreshToken ?? "");
        localStorage.setItem('accessToken', res.data?.accessToken ?? "");
        localStorage.setItem('userName', res.data?.userName ?? "");
        localStorage.setItem('userEmail', res.data?.userMail ?? "");
        this.router.navigate(['/SalesInvoices']);
        this.isLoading = false;
      },
      error: err => {
        console.error(err);
        this.errorMessage = 'Invalid email or password';
        this.isLoading = false;
      }
    });
  }
}