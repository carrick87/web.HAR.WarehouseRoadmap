"use client";

import { useMemo } from "react";
import { getBoxColor } from "@/lib/box-colors";
import { shuffle } from "@/lib/shuffle";

interface NumberGridProps {
  availableNumbers: number[];
  participantId: string;
  onSelect: (number: number) => void;
  disabled?: boolean;
}

export function NumberGrid({
  availableNumbers,
  participantId,
  onSelect,
  disabled,
}: NumberGridProps) {
  const numbersKey = useMemo(
    () => [...availableNumbers].sort((a, b) => a - b).join(","),
    [availableNumbers]
  );

  const grid = useMemo(
    () => shuffle(availableNumbers),
    [availableNumbers, numbersKey]
  );

  if (grid.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        No numbers available to pick.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {grid.map((number) => (
        <button
          key={number}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(number)}
          className={`aspect-square rounded-2xl text-2xl font-bold text-white shadow-md transition active:scale-95 disabled:opacity-50 ${getBoxColor(number, participantId)}`}
        >
          {number}
        </button>
      ))}
    </div>
  );
}
