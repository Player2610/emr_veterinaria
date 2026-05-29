'use client';

import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { MedicalRecord } from '@/hooks/use-api';

interface MedicalRecordDetailProps {
  record: MedicalRecord | null;
  open: boolean;
  onClose: () => void;
}

export function MedicalRecordDetail({ record, open, onClose }: MedicalRecordDetailProps) {
  if (!record) return null;

  const vetName = record.vet
    ? `${record.vet.user.firstName} ${record.vet.user.lastName}`
    : '—';

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Historia clínica — {record.pet.name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {formatDate(record.createdAt)} · {vetName}
          </p>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Chief complaint */}
          <Section title="Motivo de consulta">
            <p className="text-sm">{record.chiefComplaint}</p>
          </Section>

          {/* Anamnesis */}
          {record.anamnesis && (
            <Section title="Anamnesis">
              <p className="text-sm">{record.anamnesis}</p>
            </Section>
          )}

          {/* Physical exam */}
          {record.physicalExam && Object.keys(record.physicalExam).length > 0 && (
            <Section title="Examen físico">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                {Object.entries(record.physicalExam).map(([k, v]) => (
                  <div key={k} className="flex gap-1">
                    <dt className="font-medium capitalize text-muted-foreground">
                      {k.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                    </dt>
                    <dd>{String(v)}</dd>
                  </div>
                ))}
              </dl>
            </Section>
          )}

          {/* Diagnoses */}
          {record.diagnoses.length > 0 && (
            <Section title="Diagnósticos">
              <ul className="space-y-1.5">
                {record.diagnoses.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    {d.isPrimary && (
                      <Badge variant="default" className="shrink-0 text-xs">
                        Principal
                      </Badge>
                    )}
                    <span>
                      {d.code && (
                        <span className="mr-1 font-mono text-xs text-muted-foreground">
                          [{d.code}]
                        </span>
                      )}
                      {d.description}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Treatments */}
          {record.treatments.length > 0 && (
            <Section title="Tratamientos">
              <ul className="space-y-2">
                {record.treatments.map((t, i) => (
                  <li key={i} className="text-sm">
                    <span className="font-medium">{t.name}</span>
                    {t.dose && <span className="text-muted-foreground"> — {t.dose}</span>}
                    {t.frequency && (
                      <span className="text-muted-foreground">, {t.frequency}</span>
                    )}
                    {t.duration && (
                      <span className="text-muted-foreground"> · {t.duration}</span>
                    )}
                    {t.route && (
                      <span className="text-muted-foreground"> ({t.route})</span>
                    )}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Prescriptions */}
          {record.prescriptions.length > 0 && (
            <Section title="Prescripciones">
              <ul className="space-y-2">
                {record.prescriptions.map((p, i) => (
                  <li key={i} className="text-sm">
                    <span className="font-medium">{p.drug}</span>
                    {p.dose && <span className="text-muted-foreground"> — {p.dose}</span>}
                    {p.instructions && (
                      <span className="text-muted-foreground">. {p.instructions}</span>
                    )}
                    {p.durationDays && (
                      <span className="text-muted-foreground">
                        {' '}
                        · {p.durationDays} días
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Notes */}
          {record.notes && (
            <Section title="Notas">
              <p className="text-sm">{record.notes}</p>
            </Section>
          )}

          {/* Follow-up */}
          {record.followUpDate && (
            <Section title="Seguimiento">
              <p className="text-sm">{formatDate(record.followUpDate)}</p>
            </Section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h4>
      {children}
    </div>
  );
}
