import type { Metadata } from 'next';
import { PageHeader } from '@/components/common/page-header';
import { ThemeEditorClient } from './theme-editor-client';

export const metadata: Metadata = { title: 'Editor de tema' };

export default function ThemePage() {
  // tenantId would come from session/middleware in production
  const tenantId = process.env.NEXT_PUBLIC_DEV_TENANT_ID ?? 'default';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editor de tema"
        description="Personaliza la apariencia visual de tu clínica. Los cambios son instantáneos."
      />
      <ThemeEditorClient tenantId={tenantId} />
    </div>
  );
}
