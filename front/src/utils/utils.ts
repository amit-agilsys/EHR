import { format, parse, startOfMonth, endOfMonth, subMonths } from "date-fns";

export const formatPhoneNumber = (value: string): string => {
  if (!value) return "";
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6,
      10
    )}`;
  }
  return value;
};

export function parseLocalDate(dateString: string): Date {
  const parts = dateString.split("-").map(Number);

  if (parts.length === 3) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return new Date(dateString);
}

export const formatDate = (date?: Date | string | null) => {
  if (!date) return "NA";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "-";
  return format(d, "MM-dd-yyyy");
};

export const timeOnly = (timeString: string) => {
  const date = parse(timeString, "HH:mm:ss", new Date());

  const formatted = format(date, "HH:mm");
  return formatted;
};

export const getLastMonthRange = () => {
  const today = new Date();
  const lastMonth = subMonths(today, 1);
  return {
    from: startOfMonth(lastMonth),
    to: endOfMonth(lastMonth),
  };
};
