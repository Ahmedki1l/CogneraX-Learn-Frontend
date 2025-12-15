"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "./utils";
import { useLanguage } from "../context/LanguageContext";

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const { isRTL } = useLanguage();
  
  // For RTL, translate from left to right (positive X)
  // For LTR, translate from right to left (negative X)
  const translateValue = isRTL 
    ? `translateX(${100 - (value || 0)}%)` 
    : `translateX(-${100 - (value || 0)}%)`;

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className,
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: translateValue }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
