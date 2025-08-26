import * as React from "react";
import { Slot } from "@radix-ui/react-slot"; // ✅ correct import
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-cpn-yellow/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cpn-dark",
  {
    variants: {
      variant: {
        default:
          "bg-cpn-yellow text-cpn-dark hover:bg-cpn-yellow/80 font-semibold",
        destructive:
          "bg-red-500 text-white hover:bg-red-600",
        outline:
          "border-2 border-cpn-gray/30 bg-transparent text-cpn-white hover:bg-cpn-gray/10",
        secondary:
          "bg-cpn-gray/20 text-cpn-white hover:bg-cpn-gray/30",
        ghost:
          "text-cpn-white hover:bg-cpn-gray/10",
        link: "text-cpn-yellow underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 px-4",
        lg: "h-12 px-8",
        icon: "size-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button"; // ✅ use Slot here

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
