'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';

type Props = {
  value: number;
  currency: string;
  onChange: (value: number) => void;
  disabled?: boolean;
  ariaLabel: string;
  highAmount?: number;
};

function formatEditable(value: number) {
  return new Intl.NumberFormat('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value);
}

export function CurrencyAmountInput({ value, currency, onChange, disabled, ariaLabel, highAmount = 100_000 }: Props) {
  const [text, setText] = React.useState(() => formatEditable(value));
  const accepted = React.useRef(value);
  React.useEffect(() => { setText(formatEditable(value)); }, [value]);
  const symbol = new Intl.NumberFormat('es-MX', { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }).formatToParts(0).find((part) => part.type === 'currency')?.value ?? currency;
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{symbol}</span>
      <Input
        type="text"
        inputMode="decimal"
        disabled={disabled}
        value={text}
        aria-label={ariaLabel}
        className="h-12 pl-8 text-right font-semibold tabular-nums"
        onFocus={() => { accepted.current = value; }}
        onChange={(event) => {
          const normalized = event.target.value.replace(/[^0-9.,]/g, '').replace(/,/g, '');
          const amount = Math.max(0, Number(normalized) || 0);
          setText(normalized.endsWith('.') ? `${formatEditable(amount)}.` : formatEditable(amount));
          onChange(amount);
        }}
        onBlur={() => {
          if (value >= highAmount && value !== accepted.current) {
            const formatted = new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(value);
            if (!window.confirm(`El importe ${formatted} es inusualmente alto. ¿Deseas conservarlo?`)) {
              onChange(accepted.current);
              setText(formatEditable(accepted.current));
              return;
            }
          }
          accepted.current = value;
          setText(formatEditable(value));
        }}
      />
    </div>
  );
}
