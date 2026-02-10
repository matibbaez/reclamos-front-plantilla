import { Component, HostListener, OnInit, inject } from '@angular/core';
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
  
  // Control de estado visual
  isScrolled = false;
  hasHero = true; // Indica si la página actual tiene un Hero (fondo oscuro)

  private router = inject(Router);

  ngOnInit() {
    // Detectar cambios de ruta para saber si aplicamos transparencia
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      
      // Páginas que tienen fondo oscuro arriba (Hero) y soportan transparencia
      const pagesWithHero = ['/', '/inicio', '/iniciar-reclamo'];
      
      // Verificamos si la URL actual empieza con alguna de las permitidas
      // (Usamos startsWith para que '/iniciar-reclamo?revoca=true' siga funcionando)
      this.hasHero = pagesWithHero.some(path => 
        url === path || url.startsWith(path + '?')
      );

      // Si NO tiene hero (ej: Consultar), forzamos el fondo sólido de una
      if (!this.hasHero) {
        this.isScrolled = true;
      } else {
        // Si TIENE hero, chequeamos la posición del scroll
        this.checkScroll();
      }
      
      // Cerramos menú móvil al navegar
      this.menuAbierto = false;
    });
  }

  // Escuchar el scroll
  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.hasHero) {
      this.checkScroll();
    }
  }

  private checkScroll() {
    // Si bajamos más de 20px, se pone sólido
    this.isScrolled = window.scrollY > 20;
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu() {
    this.menuAbierto = false;
  }
}