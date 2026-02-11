import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { IReclamo } from '../../pages/admin-dashboard/admin-dashboard';
import { NotificacionService } from '../../services/notificacion';

// Definimos los tipos de archivo permitidos para mayor seguridad
type TipoArchivo = 'dni' | 'recibo' | 'alta' | 'form1' | 'form2' | 'carta_documento' | 'revoca';

// Definimos los tabs disponibles
type TabType = 'info' | 'archivos' | 'gestion';

@Component({
  selector: 'app-gestionar-reclamo-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gestionar-reclamo-modal.html',
  styleUrl: './gestionar-reclamo-modal.scss'
})
export class GestionarReclamoModalComponent implements OnInit {

  @Input() reclamo!: IReclamo; 
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<'Recibido' | 'En Proceso' | 'Finalizado'>();

  private fb = inject(FormBuilder);
  private http = inject(HttpClient); 
  private notificacionService = inject(NotificacionService);

  // 1. Variable para controlar las Pestañas (Tabs)
  activeTab: TabType = 'info';

  // 2. Bandera para el spinner de descarga
  public descargando: TipoArchivo | null = null;

  // 3. Formulario de Estado
  estadoForm = this.fb.group({
    estado: ['', Validators.required]
  });

  constructor() {}

  ngOnInit(): void {
    if (this.reclamo) {
      // Inicializamos el formulario con el estado actual del reclamo
      this.estadoForm.patchValue({ estado: this.reclamo.estado });
    }
  }

  // ------------------------------------------------------------------
  // MÉTODO PARA DESCARGAR ARCHIVOS
  // ------------------------------------------------------------------
  descargarArchivo(tipo: TipoArchivo) {
    if (this.descargando) return; // Evita doble clic

    this.descargando = tipo; 
    
    // Construimos la URL usando el environment
    const url = `${environment.apiUrl}/reclamos/descargar/${this.reclamo.id}/${tipo}`;

    this.http.get<{ url: string }>(url).pipe(
      finalize(() => {
        this.descargando = null; // Apagamos el spinner al terminar (éxito o error)
      })
    ).subscribe({
      next: (response) => {
        // Abrimos la URL firmada (de Supabase/S3) en una nueva pestaña
        window.open(response.url, '_blank');
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al descargar archivo:', error);
        
        if (error.status === 404) {
           this.notificacionService.showError('El archivo solicitado no se encuentra disponible.');
        } else {
           this.notificacionService.showError('Error al generar el enlace de descarga.');
        }
      }
    });
  }

  // ------------------------------------------------------------------
  // GUARDAR CAMBIOS (ESTADO)
  // ------------------------------------------------------------------
  guardarCambios() {
    if (this.estadoForm.valid) {
      // Emitimos el valor para que el Dashboard actualice la lista
      this.save.emit(this.estadoForm.value.estado as 'Recibido' | 'En Proceso' | 'Finalizado');
    }
  }

  cerrarModal() {
    this.close.emit();
  }
}