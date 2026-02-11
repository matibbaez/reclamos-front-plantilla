import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReclamosService } from '../../services/reclamos.service';
import { CardComponent } from '../../components/card/card';
import { GestionarReclamoModalComponent } from '../../components/gestionar-reclamo-modal/gestionar-reclamo-modal';

// Interfaz completa
export interface IReclamo {
  id: string;
  nombre: string;
  dni: string;
  email: string;
  codigo_seguimiento: string;
  estado: 'Recibido' | 'En Proceso' | 'Finalizado';
  fecha_creacion: string;
  
  // Archivos Base
  path_dni: string;
  path_recibo: string;
  path_form1: string;
  path_form2: string;
  
  // Archivos Opcionales
  path_alta_medica?: string;
  path_carta_documento?: string;
  path_revoca_patrocinio?: string;
  
  // Datos Lógicos
  tipo_tramite: string;
  subtipo_tramite?: string;
  tiene_abogado_anterior?: boolean;

  // Datos Texto (Rechazo)
  jornada_laboral?: string;
  direccion_laboral?: string;
  trayecto_habitual?: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, CardComponent, GestionarReclamoModalComponent],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboardComponent implements OnInit {

  private reclamosService = inject(ReclamosService);

  // Variables de Datos
  ordenDescendente = true;
  reclamosOriginales: IReclamo[] = []; 
  reclamosFiltrados: IReclamo[] = [];   
  
  // ESTADOS DE CARGA (Separados para mejor UX)
  loading = true;       // Carga inicial (Pantalla completa / Tabla)
  isRefreshing = false; // Carga manual (Solo el botón gira)

  // Variables de Filtro
  filtroEstado: string = ''; // '' = Todos
  filtroTipo: string = '';   // '' = Todos
  filtrosAbiertos = false;

  // Variables Modal
  reclamoSeleccionado: IReclamo | null = null;
  actualizandoId: string | null = null;

  ngOnInit() {
    // Carga inicial: Bloqueamos la tabla con el spinner grande
    this.cargarDatos(false);
  }

  // =========================================================
  //  LÓGICA DE CARGA DE DATOS (MEJORADA)
  // =========================================================

  // Se llama desde el botón "Actualizar" del HTML
  actualizarManual() {
    this.isRefreshing = true; // Activamos solo el giro del botón
    this.cargarDatos(true);
  }

  // Función principal unificada
  cargarDatos(esRefreshManual: boolean = false) {
    
    // Si NO es manual (es la primera carga o cambio de filtro), mostramos loading general
    if (!esRefreshManual) {
      this.loading = true;
    }

    this.reclamosService.findAll(this.filtroEstado).subscribe({
      next: (data) => {
        this.reclamosOriginales = data as IReclamo[];
        this.aplicarFiltrosLocales(); // Re-aplicar orden y filtros de tipo
        
        // Apagamos ambos estados de carga
        this.loading = false;
        this.isRefreshing = false;
      },
      error: (err) => {
        console.error('Error cargando reclamos', err);
        this.loading = false;
        this.isRefreshing = false;
      }
    });
  }

  // =========================================================
  //  FILTROS Y ORDENAMIENTO
  // =========================================================

  alternarOrden() {
    this.ordenDescendente = !this.ordenDescendente;
    this.aplicarFiltrosLocales();
  }

  toggleFiltros() {
    this.filtrosAbiertos = !this.filtrosAbiertos;
  }

  aplicarFiltrosLocales() {
    let resultado = [];

    // A. Filtrado por Tipo
    if (!this.filtroTipo) {
      resultado = [...this.reclamosOriginales]; 
    } else {
      if (this.filtroTipo === 'Revoca') {
        resultado = this.reclamosOriginales.filter(r => !!r.path_revoca_patrocinio);
      } else if (this.filtroTipo === 'Rechazo') {
        resultado = this.reclamosOriginales.filter(r => r.tipo_tramite === 'Rechazo' || r.subtipo_tramite === 'Rechazo');
      } else {
        resultado = this.reclamosOriginales.filter(r => r.tipo_tramite === this.filtroTipo);
      }
    }

    // B. Ordenamiento (Sorting)
    resultado.sort((a, b) => {
      const fechaA = new Date(a.fecha_creacion).getTime();
      const fechaB = new Date(b.fecha_creacion).getTime();

      return this.ordenDescendente 
        ? fechaB - fechaA  // Descendente (Recientes arriba)
        : fechaA - fechaB; // Ascendente (Antiguos arriba)
    });

    this.reclamosFiltrados = resultado;
  }

  // Eventos de UI Filtros
  cambiarEstado(nuevoEstado: string) {
    this.filtroEstado = nuevoEstado;
    // Al cambiar estado, hacemos una carga "general" (loading = true)
    this.cargarDatos(false); 
  }

  cambiarTipo(event: any) {
    this.filtroTipo = event.target.value;
    this.aplicarFiltrosLocales(); 
  }

  // =========================================================
  //  HELPERS VISUALES (HTML)
  // =========================================================

  getIniciales(nombreCompleto: string): string {
    if (!nombreCompleto) return 'NN';
    const partes = nombreCompleto.trim().split(' ');
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }

  getClassEstado(estado: string): string {
    if (!estado) return '';
    return estado.toLowerCase().replace(/\s+/g, '-');
  }

  // Buscador en tiempo real
  filtrarBusqueda(event: any) {
    const texto = event.target.value.toLowerCase();

    if (!texto) {
      this.aplicarFiltrosLocales();
      return;
    }
    
    this.reclamosFiltrados = this.reclamosOriginales.filter(r => 
      r.nombre.toLowerCase().includes(texto) || 
      r.dni.includes(texto) ||
      r.codigo_seguimiento.toLowerCase().includes(texto)
    );
  }

  resetFiltros() {
    this.filtroEstado = '';
    this.filtroTipo = '';
    this.cargarDatos(false); 
  }

  // =========================================================
  //  MODAL
  // =========================================================

  abrirModal(reclamo: IReclamo) {
    this.reclamoSeleccionado = reclamo;
  }

  cerrarModal() {
    this.reclamoSeleccionado = null;
  }

  guardarCambiosModal(nuevoEstado: any) {
    if (!this.reclamoSeleccionado) return;
    
    const id = this.reclamoSeleccionado.id;
    this.actualizandoId = id;
    this.cerrarModal(); 
    
    const estadoFinal = typeof nuevoEstado === 'string' ? nuevoEstado : nuevoEstado.estado;

    this.reclamosService.update(id, { estado: estadoFinal }).subscribe({
      next: () => {
        this.actualizandoId = null;
        // Al guardar, refrescamos la tabla sin bloquearla entera si querés, 
        // o bloqueando. Aquí usamos refresh manual para que sea sutil.
        this.cargarDatos(true); 
      },
      error: (err) => {
        console.error('Error actualizando', err);
        this.actualizandoId = null;
      }
    });
  }
}