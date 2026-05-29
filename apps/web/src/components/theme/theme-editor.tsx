'use client';

import { useState } from 'react';
import { useTheme } from '@/hooks/use-theme';
import {
  COLOR_THEME_KEYS,
  THEME_KEY_LABELS,
  hslChannelsToHex,
  hexToHslChannels,
  type TenantTheme,
} from '@/lib/theme';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// ─────────────────────────────────────────────────────────────────────────────
// Colour swatch row
// ─────────────────────────────────────────────────────────────────────────────

interface ColourRowProps {
  label: string;
  channels: string;
  onChange: (channels: string) => void;
}

function ColourRow({ label, channels, onChange }: ColourRowProps) {
  // Convert channels → hex for the colour input
  const hex = hslChannelsToHex(channels);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(hexToHslChannels(e.target.value));
  };

  const handleChannelsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex items-center gap-3 py-2">
      <div
        className="h-8 w-8 flex-shrink-0 rounded-md border border-border shadow-sm"
        style={{ backgroundColor: `hsl(${channels})` }}
      />
      <span className="w-48 flex-shrink-0 text-sm text-foreground">{label}</span>
      <input
        type="color"
        value={hex}
        onChange={handleHexChange}
        className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent p-0.5"
        title={`Picker: ${label}`}
      />
      <Input
        value={channels}
        onChange={handleChannelsChange}
        placeholder="H S% L%"
        className="h-8 font-mono text-xs"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ThemeEditor
// ─────────────────────────────────────────────────────────────────────────────

interface ThemeEditorProps {
  tenantId: string;
}

export function ThemeEditor({ tenantId }: ThemeEditorProps) {
  const { theme, updateTheme, resetTheme, isDirty } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Non-colour settings
  const [radius, setRadius] = useState(theme.radius);
  const [fontSans, setFontSans] = useState(theme.fontSans);

  const handleColourChange = (key: keyof TenantTheme, value: string) => {
    updateTheme({ [key]: value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await api.patch(`/tenants/${tenantId}/theme`, {
        ...theme,
        radius,
        fontSans,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar el tema');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Editor de tema</h2>
          <p className="text-sm text-muted-foreground">
            Los cambios se aplican en tiempo real. Guarda para persistirlos.
          </p>
        </div>
        <div className="flex gap-2">
          {isDirty && (
            <Button variant="outline" onClick={resetTheme} disabled={isSaving}>
              Descartar
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving || !isDirty}>
            {isSaving ? 'Guardando…' : 'Guardar tema'}
          </Button>
        </div>
      </div>

      {/* Status messages */}
      {saveSuccess && (
        <div className="rounded-md border border-success/30 bg-success/10 px-4 py-2 text-sm text-success">
          Tema guardado correctamente.
        </div>
      )}
      {saveError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {saveError}
        </div>
      )}

      {/* Colour tokens */}
      <Card className="p-6">
        <h3 className="mb-4 font-medium">Colores</h3>
        <div className="divide-y divide-border">
          {COLOR_THEME_KEYS.map((key) => (
            <ColourRow
              key={key}
              label={THEME_KEY_LABELS[key] ?? key}
              channels={theme[key] as string}
              onChange={(v) => handleColourChange(key, v)}
            />
          ))}
        </div>
      </Card>

      {/* Shape */}
      <Card className="p-6">
        <h3 className="mb-4 font-medium">Forma y tipografía</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Radio de bordes
            </label>
            <div className="flex items-center gap-3">
              <Input
                value={radius}
                onChange={(e) => {
                  setRadius(e.target.value);
                  updateTheme({ radius: e.target.value });
                }}
                placeholder="0.5rem"
                className="font-mono text-sm"
              />
              <div
                className="h-8 w-8 flex-shrink-0 border-2 border-primary bg-primary/20"
                style={{ borderRadius: radius }}
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Fuente principal
            </label>
            <Input
              value={fontSans}
              onChange={(e) => {
                setFontSans(e.target.value);
                updateTheme({ fontSans: e.target.value });
              }}
              placeholder="Inter"
            />
          </div>
        </div>
      </Card>

      {/* Live preview */}
      <Card className="p-6">
        <h3 className="mb-4 font-medium">Vista previa</h3>
        <div className="flex flex-wrap gap-3">
          <Button>Primario</Button>
          <Button variant="secondary">Secundario</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructivo</Button>
          <Badge>Badge</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge
            className={cn(
              'border-transparent',
              'bg-success text-success-foreground',
            )}
          >
            Éxito
          </Badge>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(['primary', 'secondary', 'accent', 'muted'] as const).map((c) => (
            <div
              key={c}
              className={cn(
                'flex h-12 items-center justify-center rounded-md text-xs font-medium',
              )}
              style={{
                backgroundColor: `hsl(${theme[c]})`,
                color: `hsl(${theme[`${c}Foreground` as keyof TenantTheme] ?? theme.foreground})`,
              }}
            >
              {c}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
