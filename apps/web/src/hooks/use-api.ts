'use client';

import useSWR, { type SWRConfiguration, type KeyedMutator } from 'swr';
import { api, ApiError } from '@/lib/api';

// ─────────────────────────────────────────────────────────────────────────────
// Generic SWR fetcher
// ─────────────────────────────────────────────────────────────────────────────

async function fetcher<T>(url: string): Promise<T> {
  return api.get<T>(url);
}

// ─────────────────────────────────────────────────────────────────────────────
// useApi — generic GET hook backed by SWR
// ─────────────────────────────────────────────────────────────────────────────

interface UseApiResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: ApiError | Error | undefined;
  mutate: KeyedMutator<T>;
}

export function useApi<T>(
  path: string | null,
  config?: SWRConfiguration<T>,
): UseApiResult<T> {
  const { data, error, isLoading, mutate } = useSWR<T, ApiError | Error>(
    path,
    fetcher,
    {
      revalidateOnFocus: false,
      ...config,
    },
  );

  return {
    data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Typed domain hooks
// ─────────────────────────────────────────────────────────────────────────────

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  gender: string;
  dateOfBirth?: string;
  weight?: number;
  photoUrl?: string;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  lastVisitAt?: string;
  createdAt: string;
}

export interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  petsCount: number;
  createdAt: string;
}

export interface Appointment {
  id: string;
  pet: { id: string; name: string; species: string };
  owner: { id: string; firstName: string; lastName: string };
  vet?: { id: string; firstName: string; lastName: string };
  scheduledAt: string;
  durationMinutes: number;
  type: string;
  status: string;
  priority: string;
  notes?: string;
}

export interface DashboardStats {
  totalPets: number;
  appointmentsToday: number;
  newClientsThisMonth: number;
  pendingPayments: number;
  appointmentsPerDay: { date: string; count: number }[];
}

export function usePets(params?: { q?: string }) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set('q', params.q);
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return useApi<Pet[]>(`/pets${query}`);
}

export function usePet(id: string | null) {
  return useApi<Pet>(id ? `/pets/${id}` : null);
}

export function useOwners() {
  return useApi<Owner[]>('/owners');
}

export function useAppointments(params?: {
  from?: string;
  to?: string;
  status?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.from) qs.set('from', params.from);
  if (params?.to) qs.set('to', params.to);
  if (params?.status) qs.set('status', params.status);
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return useApi<{ items: Appointment[]; total: number }>(`/appointments${query}`);
}

export function useDashboardStats() {
  return useApi<DashboardStats>('/dashboard/stats');
}

export interface MedicalRecord {
  id: string;
  pet: { id: string; name: string; species: string };
  vet?: { id: string; user: { firstName: string; lastName: string } };
  chiefComplaint: string;
  anamnesis?: string;
  physicalExam?: Record<string, unknown>;
  diagnoses: { code?: string; description: string; isPrimary: boolean }[];
  treatments: { name: string; dose?: string; frequency?: string; duration?: string; route?: string }[];
  prescriptions: { drug: string; dose?: string; instructions?: string; durationDays?: number }[];
  notes?: string;
  followUpDate?: string;
  createdAt: string;
}

export function useMedicalRecords(params?: { petId?: string }) {
  const qs = new URLSearchParams();
  if (params?.petId) qs.set('petId', params.petId);
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return useApi<MedicalRecord[]>(`/medical-records${query}`);
}

export function useMedicalRecord(id: string | null) {
  return useApi<MedicalRecord>(id ? `/medical-records/${id}` : null);
}
