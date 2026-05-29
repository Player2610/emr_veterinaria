import { useState, useEffect, useCallback } from 'react';
import { api, ApiRequestError } from '@/lib/api';
import type {
  AppointmentSummary,
  Appointment,
  CreateAppointmentDto,
  AvailableSlot,
} from '@emr/shared';
import { AppointmentStatus } from '@emr/shared';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ─── Upcoming appointments hook ───────────────────────────────────────────────

export function useUpcomingAppointments() {
  const [appointments, setAppointments] = useState<AppointmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<PaginatedResponse<AppointmentSummary>>(
        '/owner/appointments?status=CONFIRMED,PENDING_CONFIRMATION&upcoming=true'
      );
      setAppointments(res.data);
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : 'Error al cargar citas'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return { appointments, loading, error, refetch: fetchAppointments };
}

// ─── All appointments hook (with optional pet filter) ────────────────────────

export function useAppointments(petId?: string) {
  const [appointments, setAppointments] = useState<AppointmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const path = petId
        ? `/owner/pets/${petId}/appointments`
        : '/owner/appointments';
      const res = await api.get<PaginatedResponse<AppointmentSummary>>(path);
      setAppointments(res.data);
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : 'Error al cargar citas'
      );
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const upcoming = appointments.filter(
    (a) =>
      a.status === AppointmentStatus.CONFIRMED ||
      a.status === AppointmentStatus.PENDING_CONFIRMATION
  );

  const past = appointments.filter(
    (a) =>
      a.status === AppointmentStatus.COMPLETED ||
      a.status === AppointmentStatus.CANCELLED ||
      a.status === AppointmentStatus.NO_SHOW
  );

  return { appointments, upcoming, past, loading, error, refetch: fetchAppointments };
}

// ─── Appointment detail hook ──────────────────────────────────────────────────

export function useAppointment(appointmentId: string) {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appointmentId) return;
    setLoading(true);
    api
      .get<Appointment>(`/owner/appointments/${appointmentId}`)
      .then(setAppointment)
      .catch((err) => {
        setError(err instanceof ApiRequestError ? err.message : 'Error al cargar cita');
      })
      .finally(() => setLoading(false));
  }, [appointmentId]);

  return { appointment, loading, error };
}

// ─── Available slots hook ─────────────────────────────────────────────────────

export function useAvailableSlots(date: Date | null) {
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date) return;
    setLoading(true);
    setError(null);

    const dateStr = date.toISOString().split('T')[0];
    api
      .get<AvailableSlot[]>(`/owner/appointments/available-slots?date=${dateStr}`)
      .then(setSlots)
      .catch((err) => {
        setError(err instanceof ApiRequestError ? err.message : 'Error al cargar horarios');
      })
      .finally(() => setLoading(false));
  }, [date]);

  return { slots, loading, error };
}

// ─── Book appointment action ──────────────────────────────────────────────────

export function useBookAppointment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bookAppointment = useCallback(
    async (dto: CreateAppointmentDto): Promise<Appointment | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await api.post<Appointment>('/owner/appointments', dto);
        return result;
      } catch (err) {
        const message =
          err instanceof ApiRequestError ? err.message : 'Error al solicitar cita';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const cancelAppointment = useCallback(
    async (appointmentId: string, reason: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        await api.post(`/owner/appointments/${appointmentId}/cancel`, {
          cancellationReason: reason,
        });
        return true;
      } catch (err) {
        const message =
          err instanceof ApiRequestError ? err.message : 'Error al cancelar cita';
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    bookAppointment,
    cancelAppointment,
    loading,
    error,
    clearError: () => setError(null),
  };
}
