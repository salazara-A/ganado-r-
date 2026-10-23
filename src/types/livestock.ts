/**
 * Tipos e interfaces de datos para el Sistema de Inventario Ganadero GanadoPro
 */

export type Genero = 'Hembra' | 'Macho';

export type CategoriaGanado = 
  | 'Becerro' 
  | 'Becerra' 
  | 'Novillo' 
  | 'Novillona' 
  | 'Vaca' 
  | 'Toro' 
  | 'Buey';

export type EstadoAnimal = 'Activo' | 'Vendido' | 'Muerto' | 'Transferido';

export type EstadoReproductivo = 
  | 'Vacía' 
  | 'Gestante' 
  | 'Lactando' 
  | 'Seca' 
  | 'En Servicio' 
  | 'No Aplica';

export interface UsuarioGanadero {
  id: string;
  upp: string;                 // Números de la UPP (ej. 14-045-0012-001 o 14-045)
  nombreProductor: string;     // Nombre del propietario / responsable
  nombreRancho?: string;
  fechaRegistro: string;
}

export interface Livestock {
  id: string;
  arete: string;              // Número de arete oficial (SINIGA o arete de campaña)
  areteVisual?: string;        // Arete de manejo / plástico visible en potrero
  nombre?: string;
  genero: Genero;
  categoria: CategoriaGanado;
  raza: string;                // Brahman, Angus, Simmental, Charolais, Gyr, etc.
  color?: string;
  fechaNacimiento: string;     // YYYY-MM-DD
  pesoKg: number;
  fechaUltimoPesaje?: string;
  gananciaPesoDiariaKg?: number; // Registro de evolución
  condicionCorporal?: string;  // Escala 1 a 5 (ej. 3.5 Buena, 4 Óptima)
  estado: EstadoAnimal;
  estadoReproductivo: EstadoReproductivo;
  fechaInseminacionOMonta?: string;
  fechaProbableParto?: string; // Calculado (~283 días)
  madreArete?: string;
  padreArete?: string;
  uppId: string;
  ubicacion: string;           // 'Rancho, Corral Nuevo' | 'Rancho, Corral Viejo' | 'Curva' | 'Ejido'
  potrero?: string;
  notas?: string;
  fechaIngreso: string;
}

export type TipoTratamiento = 
  | 'Vacuna' 
  | 'Tratamiento Médico' 
  | 'Desparasitación' 
  | 'Vitamina' 
  | 'Cirugía / Curación' 
  | 'Antibiótico'
  | 'Suero / Intravenosa';

export type ViaAdministracion = 
  | 'Subcutánea' 
  | 'Intramuscular' 
  | 'Intravenosa' 
  | 'Oral' 
  | 'Tópica / Baño';

export interface HistorialClinicoItem {
  id: string;
  animalId: string;
  arete: string;
  tipo: TipoTratamiento;
  medicamento: string;
  concentracionMg?: string;    // Ej. "200 mg/ml", "500 mg", "3.15%"
  costoMedicamento?: number;   // Costo en $ MXN
  dosis: string;
  via: ViaAdministracion;
  fechaAplicacion: string;     // YYYY-MM-DD
  fechaProximaDosis?: string;  // YYYY-MM-DD
  diasAlarmaAnticipacion?: number;
  alarmaActiva?: boolean;
  loteLaboratorio?: string;
  diasRetiroCarne?: number;
  diasRetiroLeche?: number;
  veterinario?: string;
  completado: boolean;
  notas?: string;
}

export interface MedicamentoCatalogo {
  id: string;
  nombre: string;
  tipo: TipoTratamiento;
  especificaciones: string;    // Para qué sirve, indicaciones y precauciones
  concentracionMg: string;     // Concentración en mg o %
  via: ViaAdministracion;
  tipoDosis: 'fija' | 'por_peso';
  dosisFija?: string;          // Ej. "2 ml por cabeza"
  formulaPorKgTexto?: string;  // Ej. "1 ml por cada 10 kg de peso"
  mlPorCadaKg?: number;        // Factor para calculadora (ej. 1 / 10 = 0.1 ml/kg)
  dosisMinimaMl?: number;
  dosisMaximaMl?: number;
  costoAprox: number;
  retiroCarneDias: number;
  retiroLecheDias: number;
  laboratorioComun?: string;
}

export interface AlertaRecordatorio {
  id: string;
  animalId?: string;
  arete: string;
  tipo: 'Vacuna' | 'Parto' | 'Tratamiento' | 'Desparasitación' | 'Revisión';
  titulo: string;
  descripcion: string;
  fechaProgramada: string;
  hora?: string;
  urgencia: 'Baja' | 'Media' | 'Alta' | 'Vencida';
  completada: boolean;
  pospuestaHasta?: string;
}

export interface NovedadHato {
  id: string;
  tipo: 'Nacimiento' | 'Venta' | 'Muerte';
  animalId?: string;
  arete: string;
  fecha: string;
  ubicacion: string;
  detalles: {
    comprador?: string;
    precioTotal?: number;
    pesoVentaKg?: number;
    motivoVenta?: string;
    causaMuerte?: string;
    destinoCadáver?: string;
    madreArete?: string;
    padreArete?: string;
    sexoCria?: Genero;
    pesoNacimientoKg?: number;
    observaciones?: string;
  };
}

export interface ReporteDiario {
  id: string;
  fecha: string;
  horaCierre: string;
  uppClave: string;
  nombreProductor: string;
  ubicacion: string;
  responsable: string;
  totalAnimalesActivos: number;
  animalesRevisados: number;
  vacunasAplicadas: number;
  costoTotalMedicinas?: number;
  tratamientosAplicados: number;
  nacimientosRegistrados: number;
  ventasRegistradas: number;
  muertesRegistradas: number;
  observacionesGenerales: string;
  registrosDetallados: Array<{
    tipo: string;
    arete: string;
    descripcion: string;
  }>;
}

export interface UPPConfig {
  clave: string;
  nombreProductor: string;
  nombreRancho: string;
  ubicaciones: string[];
  ubicacionActiva: string;
  telefono?: string;
  estado?: string;
  municipio?: string;
}
