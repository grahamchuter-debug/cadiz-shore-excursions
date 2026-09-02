"use client";

import { useRef, type InputHTMLAttributes, type MouseEvent } from "react";
import { openNativeDatePicker } from "@shared/world-booking/date-picker";

export type DateFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  id: string;
  label: string;
  inputClassName?: string;
  wrapperClassName?: string;
};

/**
 * World 2.0 standard native date field — the full visible control opens the picker.
 * Uses showPicker() when supported; webkit gets a full-width invisible indicator via CSS.
 */
export function DateField({
  id,
  label,
  className,
  inputClassName,
  wrapperClassName,
  disabled,
  ...inputProps
}: DateFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function onWrapperClick(event: MouseEvent<HTMLDivElement>) {
    if (disabled) return;
    const input = inputRef.current;
    if (!input || !event.currentTarget.contains(event.target as Node)) return;
    openNativeDatePicker(input);
  }

  return (
    <div className={wrapperClassName}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-800">
        {label}
      </label>
      <div
        className={`relative mt-1 cursor-pointer ${className ?? ""}`.trim()}
        onClick={onWrapperClick}
      >
        <input
          {...inputProps}
          ref={inputRef}
          id={id}
          type="date"
          disabled={disabled}
          className={`w2-date-field-input w-full ${inputClassName ?? ""}`.trim()}
        />
      </div>
    </div>
  );
}
