import type { Metadata } from 'next';
import { PageHeader } from '@/components/common/page-header';
import { AppointmentCalendar } from '@/components/appointments/appointment-calendar';

export const metadata: Metadata = { title: 'Citas' };

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Citas"
        description="Calendario semanal de citas veterinarias"
      />
      <AppointmentCalendar />
    </div>
  );
}
