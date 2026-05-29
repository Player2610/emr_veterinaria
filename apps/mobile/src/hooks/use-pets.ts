import { useState, useEffect, useCallback } from 'react';
import { api, ApiRequestError } from '@/lib/api';
import type {
  Pet,
  PetSummary,
  MedicalRecord,
  MedicalRecordSummary,
  VaccinationRecord,
} from '@emr/shared';

// ─── API response types ───────────────────────────────────────────────────────

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ─── Pets list hook ───────────────────────────────────────────────────────────

export function usePets() {
  const [pets, setPets] = useState<PetSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<PaginatedResponse<PetSummary>>('/owner/pets');
      setPets(res.data);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Error al cargar mascotas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  return { pets, loading, error, refetch: fetchPets };
}

// ─── Pet detail hook ──────────────────────────────────────────────────────────

export function usePet(petId: string) {
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPet = useCallback(async () => {
    if (!petId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Pet>(`/owner/pets/${petId}`);
      setPet(data);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Error al cargar mascota');
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    fetchPet();
  }, [fetchPet]);

  return { pet, loading, error, refetch: fetchPet };
}

// ─── Medical history hook ─────────────────────────────────────────────────────

export function usePetMedicalHistory(petId: string) {
  const [records, setRecords] = useState<MedicalRecordSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!petId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<PaginatedResponse<MedicalRecordSummary>>(
        `/owner/pets/${petId}/medical-records`
      );
      setRecords(res.data);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Error al cargar historial');
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { records, loading, error, refetch: fetchHistory };
}

// ─── Medical record detail hook ───────────────────────────────────────────────

export function useMedicalRecord(petId: string, recordId: string) {
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!petId || !recordId) return;
    setLoading(true);
    api
      .get<MedicalRecord>(`/owner/pets/${petId}/medical-records/${recordId}`)
      .then(setRecord)
      .catch((err) => {
        setError(err instanceof ApiRequestError ? err.message : 'Error al cargar consulta');
      })
      .finally(() => setLoading(false));
  }, [petId, recordId]);

  return { record, loading, error };
}

// ─── Vaccinations hook ────────────────────────────────────────────────────────

export function usePetVaccinations(petId: string) {
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVaccinations = useCallback(async () => {
    if (!petId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<PaginatedResponse<VaccinationRecord>>(
        `/owner/pets/${petId}/vaccinations`
      );
      setVaccinations(res.data);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Error al cargar vacunas');
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    fetchVaccinations();
  }, [fetchVaccinations]);

  return { vaccinations, loading, error, refetch: fetchVaccinations };
}
