import * as React from "react";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { parseLocalDate } from "utils/utils";
import CustomSelectDropdown from "./search/CustomSelectDropdown";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
// import { format } from "date-fns";

interface GenericDatePickerProps {
  value: string | null | undefined;
  onChange: (date: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  buttonClassName?: string;
  defaultValue?: Date | null;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  disabled = false,
  minDate,
  maxDate,
  buttonClassName,
}: GenericDatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Convert string to Date for Calendar component
  const dateValue = value ? parseLocalDate(value) : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (!date) {
      onChange(null);
      setOpen(false);
      return;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    onChange(formattedDate);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onChange(null);
    setOpen(false);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    try {
      const date = parseLocalDate(dateString);
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    } catch {
      return null;
    }
  };

  const displayDate = formatDate(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          size="sm"
          className={cn(
            "h-9 gap-0 justify-start text-left font-normal",
            !value && "text-muted-foreground",
            buttonClassName
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-black" />
          <span className="text-gray-800 font-medium">{placeholder}</span>

          {displayDate && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal truncate max-w-[110px]"
              >
                {displayDate}
              </Badge>
              <div
                onClick={handleClear}
                className="ml-2 flex items-center justify-center cursor-pointer pointer-events-auto"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-red-500" />
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          disabled={(date) => {
            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
          }}
          initialFocus
          captionLayout="dropdown"
          fromYear={1900}
          toYear={2100}
          components={{ Dropdown: CustomSelectDropdown }}
          hideNavigation={true}
        />
      </PopoverContent>
    </Popover>
  );
}
