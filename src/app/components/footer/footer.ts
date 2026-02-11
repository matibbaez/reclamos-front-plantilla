import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss']
})
export class FooterComponent {
  // Leemos la marca del environment, o ponemos defaults
  brand = environment.branding || { 
    nombre: 'Estudio Jurídico', 
    email: 'contacto@estudio.com',
    whatsapp: '' 
  };
  
  year = new Date().getFullYear();
}