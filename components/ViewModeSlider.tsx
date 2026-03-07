'use client';

import { Columns3, Columns2, Square } from 'lucide-react';

interface ViewModeSliderProps {
  mode: 'single' | 'double' | 'triple';
  onChange: (mode: 'single' | 'double' | 'triple') => void;
}

const modes = [
  { value: 'triple' as const, icon: Columns3, label: '三列' },
  { value: 'double' as const, icon: Columns2, label: '双列' },
  { value: 'single' as const, icon: Square, label: '单列' },
];

export function ViewModeSlider({ mode, onChange }: ViewModeSliderProps) {
  return (
    <div className="flex items-center gap-1 bg-pink-100/50 rounded-lg p-1 border border-pink-200">
      {modes.map((m) => {
        const Icon = m.icon;
        const isActive = mode === m.value;
        return (
          <button
            key={m.value}
            onClick={() => onChange(m.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              isActive
                ? 'bg-pink-500 text-white shadow-sm'
                : 'text-pink-600 hover:bg-pink-200/50'
            }`}
            title={m.label}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
