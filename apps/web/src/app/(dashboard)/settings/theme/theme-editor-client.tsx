'use client';

import { ThemeEditor } from '@/components/theme/theme-editor';

interface ThemeEditorClientProps {
  tenantId: string;
}

/**
 * Thin 'use client' wrapper so that the theme/page.tsx Server Component can
 * pass a serialisable tenantId prop to the interactive ThemeEditor.
 */
export function ThemeEditorClient({ tenantId }: ThemeEditorClientProps) {
  return <ThemeEditor tenantId={tenantId} />;
}
