import { Component, HostListener, OnInit } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent implements OnInit {

  brand = environment.branding;
  menuAbierto = false;
  
  // Variables para el efecto visual
  isScrolled = false;
  isHome = true;

  constructor(private router: Router) {}

  ngOnInit() {
    // 1. Detectar si estamos en la Home (para aplicar transparencia solo ahí)
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isHome = event.url === '/' || event.url === '/inicio';
      // Si no es home, forzamos que parezca scrolleado (fondo sólido)
      if (!this.isHome) {
        this.isScrolled = true;
      } else {
        // Si volvimos al home, chequeamos la posición actual
        this.isScrolled = window.scrollY > 20;
      }
    });
  }

  // 2. Escuchar el scroll del mouse
  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Si estamos en home, cambiamos según la posición
    if (this.isHome) {
      this.isScrolled = window.scrollY > 20; // Cambia a los 20px de bajada
    } else {
      this.isScrolled = true; // En otras páginas siempre sólido
    }
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu() {
    this.menuAbierto = false;
  }
}