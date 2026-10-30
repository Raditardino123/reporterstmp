import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function PageContainer({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn("mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-7 sm:py-10 lg:px-10 lg:py-12", className)}
      {...props}
    />
  );
}
