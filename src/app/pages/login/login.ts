import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { NotificacionService } from '../../services/notificacion';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'] // Fíjate que sea .scss
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private notificacionService = inject(NotificacionService);
  private router = inject(Router);

  // Fallback por si no está definido en environment
  brand = environment.branding || { nombre: 'Estudio Jurídico', tituloWeb: 'Portal de Gestión' };
  
  isLoading = false;
  showPassword = false; // Agregamos funcionalidad de ver contraseña

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const url = `${environment.apiUrl}/auth/login`; 
    const credentials = this.loginForm.value;

    this.http.post(url, credentials).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token);
          this.notificacionService.showSuccess(`Bienvenido a ${this.brand.nombre}`);
          this.router.navigate(['/admin/dashboard']); 
        }
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('Error Login:', error);
        
        if (error.status === 0) {
           this.notificacionService.showError('No se pudo conectar con el servidor.');
        } else if (error.status === 401 || error.status === 403) {
           this.notificacionService.showError('Credenciales incorrectas.');
        } else {
           this.notificacionService.showError('Ocurrió un error inesperado.');
        }
      }
    });
  }
}