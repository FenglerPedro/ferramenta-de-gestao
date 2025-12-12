import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTheme, presetThemes, Theme } from '@/contexts/ThemeContext';
import { Check, Plus, Trash2, Palette } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const hslToHex = (hsl: string): string => {
    const parts = hsl.split(' ').map((p) => parseFloat(p));
    if (parts.length < 3) return '#808080';

    const h = parts[0];
    const s = parts[1] / 100;
    const l = parts[2] / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;
    if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
    else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
    else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
    else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
    else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const hexToHsl = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '0 0% 50%';

    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <div className="flex gap-2">
        <input
          type="color"
          value={hslToHex(value)}
          onChange={(e) => onChange(hexToHsl(e.target.value))}
          className="h-10 w-14 cursor-pointer rounded border border-input"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="H S% L%"
          className="flex-1 text-xs"
        />
      </div>
    </div>
  );
}

function ThemeCard({ theme, isSelected, onSelect, onDelete }: {
  theme: Theme;
  isSelected: boolean;
  onSelect: () => void;
  onDelete?: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all hover:shadow-md ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'
        }`}
    >
      {isSelected && (
        <div className="absolute -right-2 -top-2 rounded-full bg-primary p-1">
          <Check className="h-3 w-3 text-primary-foreground" />
        </div>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-2 -bottom-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/80"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
      <div className="mb-2 flex gap-1">
        <div
          className="h-6 w-6 rounded-full"
          style={{ backgroundColor: `hsl(${theme.colors.primary})` }}
        />
        <div
          className="h-6 w-6 rounded-full"
          style={{ backgroundColor: `hsl(${theme.colors.secondary})` }}
        />
        <div
          className="h-6 w-6 rounded-full"
          style={{ backgroundColor: `hsl(${theme.colors.accent})` }}
        />
      </div>
      <p className="text-sm font-medium">{theme.name}</p>
    </div>
  );
}

export function ThemeCustomizer() {
  const { currentTheme, customThemes, setTheme, addCustomTheme, deleteCustomTheme } = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTheme, setNewTheme] = useState<Theme>({
    id: '',
    name: '',
    colors: {
      primary: '210 80% 40%',
      secondary: '200 60% 90%',
      accent: '180 70% 85%',
      background: '210 40% 96%',
      foreground: '210 80% 20%',
      card: '210 40% 94%',
      muted: '200 30% 90%',
    },
  });

  const handleCreateTheme = () => {
    if (!newTheme.name.trim()) {
      toast.error('Digite um nome para o tema');
      return;
    }

    const theme: Theme = {
      ...newTheme,
      id: `custom-${Date.now()}`,
    };

    addCustomTheme(theme);
    setTheme(theme);
    setDialogOpen(false);
    setNewTheme({
      id: '',
      name: '',
      colors: {
        primary: '210 80% 40%',
        secondary: '200 60% 90%',
        accent: '180 70% 85%',
        background: '210 40% 96%',
        foreground: '210 80% 20%',
        card: '210 40% 94%',
        muted: '200 30% 90%',
      },
    });
    toast.success('Tema criado com sucesso!');
  };

  const updateNewThemeColor = (key: keyof Theme['colors'], value: string) => {
    setNewTheme((prev) => ({
      ...prev,
      colors: { ...prev.colors, [key]: value },
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Personalização de Cores
        </CardTitle>
        <CardDescription>Crie e personalize seu tema de cores</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {customThemes.length > 0 && (
          <div>
            <Label className="mb-3 block">Seus Temas</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {customThemes.map((theme) => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  isSelected={currentTheme.id === theme.id}
                  onSelect={() => {
                    setTheme(theme);
                    toast.success(`Tema "${theme.name}" aplicado!`);
                  }}
                  onDelete={() => {
                    deleteCustomTheme(theme.id);
                    toast.success('Tema removido');
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Criar Tema Personalizado
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Tema</DialogTitle>
              <DialogDescription>
                Personalize as cores do seu tema
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Tema</Label>
                <Input
                  value={newTheme.name}
                  onChange={(e) => setNewTheme((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Meu Tema"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <ColorInput
                  label="Cor Principal"
                  value={newTheme.colors.primary}
                  onChange={(v) => updateNewThemeColor('primary', v)}
                />
                <ColorInput
                  label="Cor Secundária"
                  value={newTheme.colors.secondary}
                  onChange={(v) => updateNewThemeColor('secondary', v)}
                />
                <ColorInput
                  label="Cor de Destaque"
                  value={newTheme.colors.accent}
                  onChange={(v) => updateNewThemeColor('accent', v)}
                />
                <ColorInput
                  label="Fundo"
                  value={newTheme.colors.background}
                  onChange={(v) => updateNewThemeColor('background', v)}
                />
                <ColorInput
                  label="Texto"
                  value={newTheme.colors.foreground}
                  onChange={(v) => updateNewThemeColor('foreground', v)}
                />
                <ColorInput
                  label="Cartões"
                  value={newTheme.colors.card}
                  onChange={(v) => updateNewThemeColor('card', v)}
                />
              </div>

              <div className="rounded-lg border p-4">
                <p className="mb-2 text-sm font-medium">Pré-visualização</p>
                <div className="flex gap-2">
                  {Object.entries(newTheme.colors).slice(0, 4).map(([key, value]) => (
                    <div
                      key={key}
                      className="h-8 flex-1 rounded"
                      style={{ backgroundColor: `hsl(${value})` }}
                    />
                  ))}
                </div>
              </div>

              <Button onClick={handleCreateTheme} className="w-full">
                Criar Tema
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
