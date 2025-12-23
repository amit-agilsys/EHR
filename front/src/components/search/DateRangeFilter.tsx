import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, X } from "lucide-react";
import {
  format,
  parseISO,
  setYear,
  setMonth,
  getYear,
  getMonth,
  isValid,
  isSameDay,
} from "date-fns";
import { DateRange } from "react-day-picker";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface DateRangeFilterProps {
  title: string;
  fromField: string;
  toField: string;
  fromValue?: string | null;
  toValue?: string | null;
  onFromChange: (date: string | null) => void;
  onToChange: (date: string | null) => void;
  minDate?: Date;
  maxDate?: Date;
  defaultValue?: { from: Date; to: Date } | null;
}

export function DateRangeFilter({
  title,
  fromValue,
  toValue,
  onFromChange,
  onToChange,
  minDate,
  maxDate,
  defaultValue,
}: DateRangeFilterProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (fromValue && toValue) {
      const from = parseISO(fromValue);
      const to = parseISO(toValue);
      if (isValid(from) && isValid(to)) {
        return { from, to };
      }
    }
    if (defaultValue) {
      return {
        from: defaultValue.from,
        to: defaultValue.to,
      };
    }
    return undefined;
  });
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    if (fromValue) {
      const parsed = parseISO(fromValue);
      if (isValid(parsed)) return parsed;
    }
    if (toValue) {
      const parsed = parseISO(toValue);
      if (isValid(parsed)) return parsed;
    }
    if (defaultValue) return defaultValue.from;
    return new Date();
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 111 }, (_, i) => currentYear - 100 + i);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    if (fromValue && toValue) {
      const from = parseISO(fromValue);
      const to = parseISO(toValue);
      if (isValid(from) && isValid(to)) {
        setDateRange({ from, to });
      }
    } else if (!fromValue && !toValue) {
      setDateRange(undefined);
    }
  }, [fromValue, toValue]);

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range);

    onFromChange(range?.from ? format(range.from, "yyyy-MM-dd") : null);
    onToChange(range?.to ? format(range.to, "yyyy-MM-dd") : null);

    if (range?.from && range?.to && !isSameDay(range.from, range.to)) {
      setCalendarOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDateRange(undefined);
    setCurrentMonth(new Date());
    onFromChange(null);
    onToChange(null);
  };

  const handleMonthChange = (month: string) => {
    const newDate = setMonth(currentMonth, parseInt(month));
    setCurrentMonth(newDate);
  };

  const handleYearChange = (year: string) => {
    const newDate = setYear(currentMonth, parseInt(year));
    setCurrentMonth(newDate);
  };

  const displayRange = () => {
    if (!dateRange?.from || !isValid(dateRange.from)) return null;

    if (dateRange.to && isValid(dateRange.to)) {
      return `${format(dateRange.from, "MMM dd")} - ${format(
        dateRange.to,
        "MMM dd"
      )}`;
    }

    return `${format(dateRange.from, "MMM dd")} - ...`;
  };

  return (
    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-0 w-full justify-start"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="capitalize">{title}</span>

          {displayRange() && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal truncate max-w-[120px]"
              >
                {displayRange()}
              </Badge>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleClear(e);
                }}
                className="ml-2 flex items-center cursor-pointer pointer-events-auto"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-red-500" />
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-auto p-0"
        align="start"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="flex flex-col gap-2 p-3">
          <div className="flex gap-2 justify-between">
            <div className="flex gap-2">
              <Select
                value={getMonth(currentMonth).toString()}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger className="w-[130px] focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={month} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={getYear(currentMonth).toString()}
                onValueChange={handleYearChange}
              >
                <SelectTrigger className="w-[100px] focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center ">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCalendarOpen(false)}
                className="h-6 px-2"
              >
                Close
              </Button>
            </div>
          </div>

          <Calendar
            mode="range"
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            selected={dateRange}
            onSelect={handleDateRangeSelect}
            numberOfMonths={2}
            disabled={(date) => {
              if (maxDate && date > maxDate) return true;
              if (minDate && date < minDate) return true;
              return false;
            }}
            className="rounded-lg"
          />
          <Separator />
          <div className="flex justify-center">
            {dateRange?.from && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="w-full"
              >
                <span>Clear date</span>
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
