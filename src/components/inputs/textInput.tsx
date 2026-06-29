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
    <div className={cn('flex flex-1 flex-col gap-1', className)}>
      <label>{label}</label>
      <input
        type={secure ? 'password' : 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeHolder}
        disabled={disabled}
        className={cn('rounded-md border border-gray-300 p-2', inputClassName)}
      />
    </div>
  );
};

export default TextInput;
