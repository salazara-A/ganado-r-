/**
 * Servicio de Notificaciones y Audio para el Rancho
 * Funciona 100% Offline mediante Web Audio API y Notification API
 */

class SoundNotificationService {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Tono de alarma ganadera (Campana / Chime de atención de rancho)
   */
  playAlertChime() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Primer tono suave
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // Re (D5)
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // La (A5)

      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.6);

      // Segundo tono armónico tipo campana
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1174.66, now + 0.15); // Re (D6)

      gain2.gain.setValueAtTime(0.25, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(now + 0.15);
      osc2.stop(now + 0.85);
    } catch (e) {
      console.warn('Audio feedback error:', e);
    }
  }

  playChimeSound() {
    this.playAlertChime();
  }

  /**
   * Sonido corto de confirmación (ej. vacuna guardada o sincronización exitosa)
   */
  playSuccessSound() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // Do5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // Mi5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // Sol5

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {
      console.warn('Audio feedback error:', e);
    }
  }

  /**
   * Solicitar permisos de notificación nativa del navegador
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * Enviar notificación de sistema si los permisos están dados
   */
  sendNotification(title: string, options?: NotificationOptions) {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          icon: '/icon.svg',
          badge: '/icon.svg',
          ...options,
        });
      } catch (e) {
        console.warn('Could not trigger native notification:', e);
      }
    }
    // Siempre reproducir chime local
    this.playAlertChime();
  }
}

export const notificationService = new SoundNotificationService();
