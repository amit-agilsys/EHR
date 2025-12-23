import { TableCell, TableRow } from "./ui/table";

export default function NoDataFound() {
  return (
    <TableRow style={{ height: "65vh" }}>
      <TableCell colSpan={8} className="text-center font-bold text-gray-500">
        No Data Found
      </TableCell>
    </TableRow>
  );
}
