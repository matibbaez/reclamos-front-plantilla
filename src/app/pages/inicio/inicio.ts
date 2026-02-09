import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss'
})
export class InicioComponent {
  
  brand = environment.branding;

  // Datos para la nueva sección de "Áreas de Práctica"
  servicios = [
    {
      titulo: 'Accidentes Laborales',
      desc: 'Reclamos ante ART por accidentes o enfermedades profesionales.',
      icono: 'archivos' 
    },
    {
      titulo: 'Despidos Injustificados',
      desc: 'Defensa integral ante desvinculaciones sin causa justa.',
      icono: 'maletin'
    },
    {
      titulo: 'Accidentes de Tránsito',
      desc: 'Reclamos por daños físicos y materiales a terceros y aseguradoras.',
      icono: 'auto'
    }
  ];

  // FAQs con estilo nuevo (Acordeón simple)
  faqs = [
    {
      pregunta: '¿Tengo que pagar para iniciar?',
      respuesta: 'No. Trabajamos a resultado. Solo cobramos un porcentaje si ganamos tu caso.',
      abierta: false
    },
    {
      pregunta: '¿Cuánto demora el proceso?',
      respuesta: 'Gracias a nuestra tecnología, agilizamos los tiempos de presentación hasta un 40% más rápido que un estudio tradicional.',
      abierta: false
    },
    {
      pregunta: '¿Es válido el trámite digital?',
      respuesta: 'Totalmente. La justicia y las aseguradoras operan con expedientes electrónicos validados.',
      abierta: false
    }
  ];

  toggleFaq(index: number) {
    // Cierra las otras para que quede más pro
    this.faqs.forEach((faq, i) => {
      if (i !== index) faq.abierta = false;
    });
    this.faqs[index].abierta = !this.faqs[index].abierta;
  }
}