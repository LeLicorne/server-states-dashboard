import React from 'react';

import { cn } from '@/utils/cn';

interface TextInputProps {
  label: string;
  value: string;
  placeHolder?: string;
  onChange: (value: string) => void;
  secure?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChange,
  placeHolder,
  secure,
  disabled,
  className,
  inputClassName,
}) => {
  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        type={secure ? 'password' : 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeHolder}
        disabled={disabled}
        className={cn(
          'min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100',
          inputClassName
        )}
      />
    </div>
  );
};

export default TextInput;
