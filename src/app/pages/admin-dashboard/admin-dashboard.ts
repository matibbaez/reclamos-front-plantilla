import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReclamosService } from '../../services/reclamos.service';
import { CardComponent } from '../../components/card/card';
import { GestionarReclamoModalComponent } from '../../components/gestionar-reclamo-modal/gestionar-reclamo-modal';

// Interfaz completa con todos los campos nuevos
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
  loading = true;

  // Variables de Filtro
  filtroEstado: string = ''; // '' = Todos
  filtroTipo: string = '';   // '' = Todos

  // Variables Modal
  reclamoSeleccionado: IReclamo | null = null;
  actualizandoId: string | null = null;
  filtrosAbiertos = false;

  ngOnInit() {
    this.cargarDatos();
  }

  // 1. Carga desde Backend (Filtra por ESTADO)
  cargarDatos() {
    this.loading = true;
    this.reclamosService.findAll(this.filtroEstado).subscribe({
      next: (data) => {
        this.reclamosOriginales = data as IReclamo[];
        this.aplicarFiltrosLocales(); // Aplicamos el filtro de tipo y orden
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando reclamos', err);
        this.loading = false;
      }
    });
  }

  alternarOrden() {
    this.ordenDescendente = !this.ordenDescendente;
    this.aplicarFiltrosLocales();
  }

  toggleFiltros() {
    this.filtrosAbiertos = !this.filtrosAbiertos;
  }

  // 2. Filtro Local (Filtra por TIPO y Ordena)
  aplicarFiltrosLocales() {
    let resultado = [];

    // A. Filtrado por Tipo
    if (!this.filtroTipo) {
      resultado = [...this.reclamosOriginales]; 
    } else {
      if (this.filtroTipo === 'Revoca') {
        resultado = this.reclamosOriginales.filter(r => !!r.path_revoca_patrocinio);
      } else if (this.filtroTipo === 'Rechazo') {
        // Asumiendo que 'Rechazo' es un tipo_tramite o subtipo
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
    this.cargarDatos(); 
  }

  cambiarTipo(event: any) {
    this.filtroTipo = event.target.value;
    this.aplicarFiltrosLocales(); 
  }

  // =========================================================
  //  NUEVAS FUNCIONES (PARA CORREGIR LOS ERRORES DEL HTML)
  // =========================================================

  // 1. Generar iniciales para el Avatar (Ej: "Matias Baez" -> "MB")
  getIniciales(nombreCompleto: string): string {
    if (!nombreCompleto) return 'NN';
    const partes = nombreCompleto.trim().split(' ');
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }

  // 2. Convertir estado a clase CSS (Ej: "En Proceso" -> "en-proceso")
  getClassEstado(estado: string): string {
    if (!estado) return '';
    return estado.toLowerCase().replace(/\s+/g, '-');
  }

  // 3. Buscador en tiempo real
  filtrarBusqueda(event: any) {
    const texto = event.target.value.toLowerCase();

    // Si borran el texto, volvemos a los filtros originales
    if (!texto) {
      this.aplicarFiltrosLocales();
      return;
    }
    
    // Buscamos sobre los originales
    this.reclamosFiltrados = this.reclamosOriginales.filter(r => 
      r.nombre.toLowerCase().includes(texto) || 
      r.dni.includes(texto) ||
      r.codigo_seguimiento.toLowerCase().includes(texto)
    );
  }

  // 4. Botón "Limpiar Filtros" del Empty State
  resetFiltros() {
    this.filtroEstado = '';
    this.filtroTipo = '';
    
    // Limpiamos visualmente el input search si pudiéramos acceder al DOM, 
    // pero por ahora recargamos los datos que es lo importante.
    this.cargarDatos(); 
  }

  // =========================================================
  //  FIN NUEVAS FUNCIONES
  // =========================================================

  // Modal Logica
  abrirModal(reclamo: IReclamo) {
    this.reclamoSeleccionado = reclamo;
  }

  cerrarModal() {
    this.reclamoSeleccionado = null;
  }

  guardarCambiosModal(nuevoEstado: any) {
    // Nota: nuevoEstado viene del evento 'save' del modal.
    // Si tu modal emite un objeto { estado: '...' }, ajusta aquí.
    // Asumimos que emite el string directo o un objeto compatible.
    
    if (!this.reclamoSeleccionado) return;
    
    const id = this.reclamoSeleccionado.id;
    this.actualizandoId = id;
    this.cerrarModal(); 
    
    // Asumiendo que nuevoEstado es el string 'Recibido' | 'En Proceso' | 'Finalizado'
    const estadoFinal = typeof nuevoEstado === 'string' ? nuevoEstado : nuevoEstado.estado;

    this.reclamosService.update(id, { estado: estadoFinal }).subscribe({
      next: () => {
        this.actualizandoId = null;
        this.cargarDatos(); 
      },
      error: (err) => {
        console.error('Error actualizando', err);
        this.actualizandoId = null;
      }
    });
  }
}