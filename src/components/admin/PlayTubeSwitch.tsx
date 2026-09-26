"use client";

import React, { useState } from "react";
import { Check, X } from "lucide-react";

interface PlayTubeSwitchProps {
  id?: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

/**
 * Authentic PlayTube Admin Switch Toggle:
 * Green background (#16a085) with knob on right and checkmark (✔) when active.
 * Red background (#be3e44) with knob on left and cross (×) when inactive.
 */
export function PlayTubeSwitch({
  id,
  name,
  checked,
  onChange,
  disabled = false,
}: PlayTubeSwitchProps) {
  const switchId = id || `switch_${name}`;

  return (
    <button
      type="button"
      id={switchId}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex items-center w-[58px] h-[33px] rounded-[2.5em] transition-colors duration-200 ease-in-out cursor-pointer focus:outline-hidden select-none ${
        checked ? "bg-[#16a085]" : "bg-[#be3e44]"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span
        className={`flex items-center justify-center w-[25px] h-[25px] rounded-full shadow-[0_0_8px_rgba(0,0,0,0.3)] transition-all duration-200 ease-in-out ${
          checked
            ? "ml-[30px] bg-[#1abc9c] text-white"
            : "ml-[3px] bg-[#ce464a] text-white"
        }`}
      >
        {checked ? (
          <span className="text-[13px] font-bold leading-none select-none">✔</span>
        ) : (
          <span className="text-[15px] font-bold leading-none select-none">×</span>
        )}
      </span>
    </button>
  );
}
