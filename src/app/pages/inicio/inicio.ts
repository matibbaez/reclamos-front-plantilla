import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.scss']
})
export class InicioComponent {

  // 1. Datos de Marca
  brand = environment.branding || { nombre: 'Estudio Jurídico' };

  // 2. Lógica para FAQ (Acordeón)
  faqOpen: number | null = null;

  toggleFaq(index: number) {
    if (this.faqOpen === index) {
      this.faqOpen = null; // Cierra si ya está abierto
    } else {
      this.faqOpen = index; // Abre el nuevo
    }
  }

  // 3. Scroll suave al CTA (Opcional)
  scrollToContact() {
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
  }
}