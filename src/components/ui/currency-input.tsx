import { Input } from '@/components/ui/input';
import { forwardRef } from 'react';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    value: number;
    onChange: (value: number) => void;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
    ({ value, onChange, className, ...props }, ref) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const rawValue = e.target.value.replace(/\D/g, '');
            const numericValue = rawValue === '' ? 0 : parseInt(rawValue, 10);
            onChange(numericValue);
        };

        const formatValue = (val: number) => {
            if (val === 0) return '';
            return val.toLocaleString('pt-BR');
        };

        return (
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    R$
                </span>
                <Input
                    ref={ref}
                    type="text"
                    inputMode="numeric"
                    value={formatValue(value)}
                    onChange={handleChange}
                    className={`pl-10 ${className}`}
                    {...props}
                />
            </div>
        );
    }
);

CurrencyInput.displayName = 'CurrencyInput';
