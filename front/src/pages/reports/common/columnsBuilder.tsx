import { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "utils/utils";

export function createColumns<T extends object>(
  fields: Record<keyof T, string>,
  keys: (keyof T)[],
  options?: Partial<Record<keyof T, Partial<ColumnDef<T>>>>
): ColumnDef<T>[] {
  return keys.map((key) => {
    const keyStr = String(key).toLowerCase();
    const header = fields[key];
    const isDateField = keyStr.includes("date") || keyStr === "dob";

    const column: ColumnDef<T> = {
      accessorKey: key as string,
      header,
      cell: ({ row }) => {
        const value = row.original[key];

        if (isDateField) {
          let display = "-";
          if (value instanceof Date) {
            display = formatDate(value);
          } else if (typeof value === "string" || typeof value === "number") {
            const parsed = new Date(value);
            display = isNaN(parsed.getTime())
              ? String(value)
              : formatDate(parsed);
          }
          return <div className="text-sm">{display}</div>;
        }

        // Default renderer for non-date fields - convert to string safely
        const displayValue = value == null ? "-" : String(value);
        return <div className="text-sm">{displayValue}</div>;
      },
      ...options?.[key],
    };

    return column;
  });
}
