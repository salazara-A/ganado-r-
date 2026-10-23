/**
 * GanadoPro - Sistema de Inventario Ganadero Offline & UPP
 * Optimizado para Celular, Tablet y Computadora en Campo sin Internet
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Livestock,
  HistorialClinicoItem,
  NovedadHato,
  ReporteDiario,
  UPPConfig,
  AlertaRecordatorio,
  UsuarioGanadero,
} from './types/livestock';
import { livestockStorage } from './services/storage';
import { notificationService } from './services/notifications';
import { useMobileBackHandler } from './hooks/useMobileBackHandler';
import { AuthScreen } from './components/AuthScreen';
import { LocationSelectorScreen } from './components/LocationSelectorScreen';
import { HeaderNav } from './components/HeaderNav';
import { OfflineSyncBar } from './components/OfflineSyncBar';
import { DashboardOverview } from './components/DashboardOverview';
import { AnimalInventory } from './components/AnimalInventory';
import { VacunacionRapidaSection } from './components/VacunacionRapidaSection';
import { MedicinasVademecumSection } from './components/MedicinasVademecumSection';
import { CalendarView } from './components/CalendarView';
import { HerdEventsSection } from './components/HerdEventsSection';
import { DailyReportsSection } from './components/DailyReportsSection';
import { AnimalFormModal } from './components/AnimalFormModal';
import { AnimalDetailModal } from './components/AnimalDetailModal';
import { VaccineAlarmModal } from './components/VaccineAlarmModal';
import { HerdEventsModal } from './components/HerdEventsModal';
import { FinalizarDiaModal } from './components/FinalizarDiaModal';
import { AlertsModal } from './components/AlertsModal';
import { RotateCcw } from 'lucide-react';

export default function App() {
  // Estado de Autenticación (Interfaz 1: sin contraseña)
  const [currentUser, setCurrentUser] = useState<UsuarioGanadero | null>(() =>
    livestockStorage.getCurrentUser()
  );

  // Estado de Selector de Ubicación (Interfaz 2: 4 casillas)
  const [isLocationSelectorOpen, setIsLocationSelectorOpen] = useState(false);

  // Estado general de datos
  const [upp, setUPP] = useState<UPPConfig>(() => livestockStorage.getUPP());
  const [animals, setAnimals] = useState<Livestock[]>([]);
  const [clinicalItems, setClinicalItems] = useState<HistorialClinicoItem[]>([]);
  const [herdEvents, setHerdEvents] = useState<NovedadHato[]>([]);
  const [dailyReports, setDailyReports] = useState<ReporteDiario[]>([]);
  const [alerts, setAlerts] = useState<AlertaRecordatorio[]>([]);

  // Pestaña activa (Menú sin deslizar: 5 pestañas exactas)
  const [activeTab, setActiveTab] = useState<
    'inventario' | 'vacunacion' | 'vademecum' | 'calendario' | 'movimientos'
  >('inventario');

  // Subpestaña en movimientos (Reportes vs Eventos)
  const [movimientosSubtab, setMovimientosSubtab] = useState<'reportes' | 'eventos'>('reportes');

  // Estados de Modales
  const [isAnimalFormOpen, setIsAnimalFormOpen] = useState(false);
  const [animalToEdit, setAnimalToEdit] = useState<Livestock | null>(null);

  const [isAnimalDetailOpen, setIsAnimalDetailOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Livestock | null>(null);

  const [isVaccineModalOpen, setIsVaccineModalOpen] = useState(false);
  const [selectedAnimalForVaccine, setSelectedAnimalForVaccine] = useState<Livestock | null>(null);
  const [editingClinicalItem, setEditingClinicalItem] = useState<HistorialClinicoItem | null>(null);

  const [isHerdEventsModalOpen, setIsHerdEventsModalOpen] = useState(false);
  const [herdEventMode, setHerdEventMode] = useState<'Nacimiento' | 'Venta' | 'Muerte'>('Nacimiento');
  const [preselectedAnimalForEvent, setPreselectedAnimalForEvent] = useState<Livestock | null>(null);

  const [isFinalizarDiaOpen, setIsFinalizarDiaOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);

  // INTEGRACIÓN DEL BOTÓN "ATRÁS" DEL CELULAR (Gesto nativo / botón físico)
  // Permite cerrar modales o volver sin salirse de la app en celular
  useMobileBackHandler(isLocationSelectorOpen, () => setIsLocationSelectorOpen(false), 'locationSelector');
  useMobileBackHandler(isAnimalFormOpen, () => setIsAnimalFormOpen(false), 'animalForm');
  useMobileBackHandler(isAnimalDetailOpen, () => setIsAnimalDetailOpen(false), 'animalDetail');
  useMobileBackHandler(isVaccineModalOpen, () => setIsVaccineModalOpen(false), 'vaccineModal');
  useMobileBackHandler(isHerdEventsModalOpen, () => setIsHerdEventsModalOpen(false), 'herdEvents');
  useMobileBackHandler(isFinalizarDiaOpen, () => setIsFinalizarDiaOpen(false), 'finalizarDia');
  useMobileBackHandler(isAlertsModalOpen, () => setIsAlertsModalOpen(false), 'alertsModal');

  // Cargar datos desde localStorage
  const loadData = useCallback(() => {
    const currentUPP = livestockStorage.getUPP();
    setUPP(currentUPP);
    setAnimals(livestockStorage.getAnimals());
    setClinicalItems(livestockStorage.getClinicalHistory());
    setHerdEvents(livestockStorage.getHerdEvents());
    setDailyReports(livestockStorage.getDailyReports());
    const currentAlerts = livestockStorage.getAlerts();
    setAlerts(currentAlerts);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Manejo de Inicio de Sesión / Registro (Interfaz 1 completada)
  const handleAuthenticated = (user: UsuarioGanadero) => {
    setCurrentUser(user);
    loadData();
    // Pasar a la segunda interfaz: seleccionar dónde están
    setIsLocationSelectorOpen(true);
  };

  // Manejo de Selección de Ubicación (Interfaz 2 completada)
  const handleSelectLocation = (location: string) => {
    const updated: UPPConfig = {
      ...upp,
      ubicacionActiva: location,
    };
    livestockStorage.saveUPP(updated);
    setUPP(updated);
    setIsLocationSelectorOpen(false);
  };

  // Cerrar Sesión
  const handleLogout = () => {
    livestockStorage.logoutUser();
    setCurrentUser(null);
    setIsLocationSelectorOpen(false);
  };

  // Abrir modal de vacuna para un animal específico o general
  const handleOpenVaccineModal = (animal?: Livestock, defaultDate?: string) => {
    setSelectedAnimalForVaccine(animal || null);
    setEditingClinicalItem(null);
    setIsVaccineModalOpen(true);
  };

  // Abrir detalle de animal
  const handleSelectAnimal = (animal: Livestock) => {
    setSelectedAnimal(animal);
    setIsAnimalDetailOpen(true);
  };

  // Abrir formulario para editar datos de animal
  const handleEditAnimal = (animal: Livestock) => {
    setAnimalToEdit(animal);
    setIsAnimalFormOpen(true);
  };

  // Abrir modal de eventos de hato (Nacimiento, Venta, Muerte)
  const handleOpenHerdEvent = (
    mode: 'Nacimiento' | 'Venta' | 'Muerte' = 'Nacimiento',
    animal?: Livestock | null
  ) => {
    setHerdEventMode(mode);
    setPreselectedAnimalForEvent(animal || null);
    setIsHerdEventsModalOpen(true);
  };

  // Reiniciar datos de prueba
  const handleResetDemo = () => {
    if (confirm('¿Deseas restaurar los datos de demostración ganadera?')) {
      livestockStorage.resetToDemoData();
      loadData();
      notificationService.playSuccessSound();
    }
  };

  // INTERFAZ 1: INICIO DE SESIÓN / SELECCIÓN DE PROPIETARIO (SIN CONTRASEÑA)
  if (!currentUser) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  // INTERFAZ 2: SELECTOR DE DÓNDE ESTÁN (Rancho Corral Nuevo / Corral Viejo / Curva / Ejido)
  if (isLocationSelectorOpen) {
    return (
      <LocationSelectorScreen
        user={currentUser}
        upp={upp}
        animals={animals}
        onSelectLocation={handleSelectLocation}
        onLogout={handleLogout}
      />
    );
  }

  const activeAnimals = animals.filter((a) => a.estado === 'Activo');

  // INTERFAZ PRINCIPAL DEL SISTEMA GANADERO
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans text-stone-900 selection:bg-emerald-600 selection:text-white">
      {/* Barra de Conectividad Offline / Sincronización Automática */}
      <OfflineSyncBar onDataRefreshed={loadData} />

      {/* Navegación con Menú Fácil sin Deslizar */}
      <HeaderNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        upp={upp}
        currentUser={currentUser}
        onChangeLocation={() => setIsLocationSelectorOpen(true)}
        onLogout={handleLogout}
        onOpenAlertsModal={() => setIsAlertsModalOpen(true)}
        onOpenFinalizarDia={() => setIsFinalizarDiaOpen(true)}
        alerts={alerts}
      />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-5">
        {/* PESTAÑA 1: INVENTARIO DE GANADO (SOLO AQUÍ APARECE EL RESUMEN Y BANNER UPP) */}
        {activeTab === 'inventario' && (
          <div className="space-y-5">
            <DashboardOverview
              animals={animals}
              clinicalItems={clinicalItems}
              alerts={alerts}
              upp={upp}
              onOpenNewAnimal={() => {
                setAnimalToEdit(null);
                setIsAnimalFormOpen(true);
              }}
              onOpenVaccineModal={() => handleOpenVaccineModal()}
              onOpenCalendar={() => setActiveTab('calendario')}
              onOpenAlerts={() => setIsAlertsModalOpen(true)}
            />

            <AnimalInventory
              animals={animals}
              upp={upp}
              onSelectAnimal={handleSelectAnimal}
              onOpenNewAnimal={() => {
                setAnimalToEdit(null);
                setIsAnimalFormOpen(true);
              }}
              onOpenVaccineModal={handleOpenVaccineModal}
              onOpenHerdEvent={(animal, mode) => handleOpenHerdEvent(mode, animal)}
            />
          </div>
        )}

        {/* PESTAÑA 2: REGISTRO DE VACUNACIÓN RÁPIDA (LISTA DE VACAS + BOTÓN "VACUNADA") */}
        {activeTab === 'vacunacion' && (
          <VacunacionRapidaSection
            animals={animals}
            clinicalItems={clinicalItems}
            upp={upp}
            onRefresh={loadData}
          />
        )}

        {/* PESTAÑA 3: VADEMÉCUM DE PURAS VACUNAS Y MEDICINAS (INFORME Y CALCULADORA DE DOSIS) */}
        {activeTab === 'vademecum' && (
          <MedicinasVademecumSection />
        )}

        {/* PESTAÑA 4: CALENDARIO GANADERO (QUÉ DÍAS SÍ Y QUÉ NO) */}
        {activeTab === 'calendario' && (
          <CalendarView
            animals={animals}
            clinicalItems={clinicalItems}
            onRefresh={loadData}
            onOpenNewVaccineModal={(defaultDate) => handleOpenVaccineModal(undefined, defaultDate)}
          />
        )}

        {/* PESTAÑA 5: REPORTES DIARIOS Y MOVIMIENTOS DE HATO */}
        {activeTab === 'movimientos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center p-1 bg-white rounded-2xl border border-stone-200 max-w-sm mx-auto shadow-xs">
              <button
                type="button"
                onClick={() => setMovimientosSubtab('reportes')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  movimientosSubtab === 'reportes'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Reportes Diarios
              </button>
              <button
                type="button"
                onClick={() => setMovimientosSubtab('eventos')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  movimientosSubtab === 'eventos'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Nacimientos / Ventas / Bajas
              </button>
            </div>

            {movimientosSubtab === 'reportes' ? (
              <DailyReportsSection
                reports={dailyReports}
                onOpenFinalizarDia={() => setIsFinalizarDiaOpen(true)}
              />
            ) : (
              <HerdEventsSection
                events={herdEvents}
                upp={upp}
                onOpenNewEvent={(mode) => handleOpenHerdEvent(mode || 'Nacimiento')}
              />
            )}
          </div>
        )}
      </main>

      {/* Pie de página */}
      <footer className="bg-stone-900 text-stone-400 py-6 px-4 border-t border-stone-800 text-xs no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="font-bold text-stone-200">
              GanadoPro — Sistema Integral de Inventario Ganadero & UPP
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Predio activo: <strong className="text-white">{upp.ubicacionActiva}</strong>. Operativo sin internet y sincronización automática.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetDemo}
              className="text-stone-400 hover:text-white flex items-center gap-1 cursor-pointer transition"
              title="Restaurar datos de demostración"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar demo</span>
            </button>
            <span>•</span>
            <span className="font-mono text-emerald-400 font-semibold">UPP {currentUser.upp}</span>
          </div>
        </div>
      </footer>

      {/* MODALES DEL SISTEMA CON SOPORTE DEL BOTÓN ATRÁS DEL CELULAR */}

      {/* 1. Formulario de Alta y Edición de Animal */}
      <AnimalFormModal
        isOpen={isAnimalFormOpen}
        onClose={() => {
          setIsAnimalFormOpen(false);
          setAnimalToEdit(null);
        }}
        animalToEdit={animalToEdit}
        upp={upp}
        onSaved={loadData}
      />

      {/* 2. Ficha Detallada del Animal */}
      <AnimalDetailModal
        animal={selectedAnimal}
        isOpen={isAnimalDetailOpen}
        onClose={() => {
          setIsAnimalDetailOpen(false);
          setSelectedAnimal(null);
        }}
        clinicalItems={clinicalItems}
        onOpenVaccineModal={(animal) => handleOpenVaccineModal(animal)}
        onEditAnimal={handleEditAnimal}
        onOpenHerdEvent={(animal, mode) => handleOpenHerdEvent(mode, animal)}
      />

      {/* 3. Modal de Registro de Vacunas & Configuración de Alarmas */}
      <VaccineAlarmModal
        isOpen={isVaccineModalOpen}
        onClose={() => {
          setIsVaccineModalOpen(false);
          setSelectedAnimalForVaccine(null);
          setEditingClinicalItem(null);
        }}
        selectedAnimal={selectedAnimalForVaccine}
        existingItem={editingClinicalItem}
        onSaved={loadData}
        activeAnimals={activeAnimals}
      />

      {/* 4. Modal de Novedades de Hato (Nacimientos, Ventas, Muertes) */}
      <HerdEventsModal
        isOpen={isHerdEventsModalOpen}
        onClose={() => {
          setIsHerdEventsModalOpen(false);
          setPreselectedAnimalForEvent(null);
        }}
        activeAnimals={activeAnimals}
        onSaved={loadData}
        defaultMode={herdEventMode}
        preselectedAnimal={preselectedAnimalForEvent}
        ubicaciones={upp.ubicaciones}
      />

      {/* 5. Modal de Finalizar Día (Cierre de Jornada & Reporte Automático) */}
      <FinalizarDiaModal
        isOpen={isFinalizarDiaOpen}
        onClose={() => setIsFinalizarDiaOpen(false)}
        upp={upp}
        animals={animals}
        clinicalItems={clinicalItems}
        herdEvents={herdEvents}
        onSaved={loadData}
      />

      {/* 6. Centro de Alertas y Notificaciones */}
      <AlertsModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        alerts={alerts}
        onOpenAnimalDetail={(animalId) => {
          const a = animals.find((item) => item.id === animalId);
          if (a) handleSelectAnimal(a);
        }}
        onOpenVaccineModalWithDate={(dateStr) => handleOpenVaccineModal(undefined, dateStr)}
      />
    </div>
  );
}
