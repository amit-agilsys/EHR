import { Badge } from "@/components/ui/badge";
import { BadgeCheck, AlertCircle } from "lucide-react";
import clsx from "clsx";

interface VerificationBadgeProps {
  verified: boolean;
  label?: string;
  className?: string;
}

export function VerificationBadge({
  verified,
  label,
  className,
}: VerificationBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={clsx(
        "flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full w-fit border",
        verified
          ? "text-blue-600 border-blue-200"
          : "text-yellow-700 border-yellow-300 bg-yellow-100",
        className
      )}
    >
      {verified ? (
        <BadgeCheck className="w-3 h-3" />
      ) : (
        <AlertCircle className="w-3 h-3" />
      )}
      {label || (verified ? "Verified" : "Not Verified")}
    </Badge>
  );
}
