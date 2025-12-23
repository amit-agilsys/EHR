import { PaginatedDataTable } from "components/PaginatedDataTable";
import {
  ADMISSIONS_REPORT,
  DOWNLOAD_ADMISSIONS_PDF,
} from "constants/endPoints";
import { Admission as Admissions } from "hooks/types/reports";
import { admissionColumns } from "./common/columns";
import { useInitLists } from "hooks/useInitLists";
import { getLastMonthRange } from "utils/utils";

export default function Admission() {
  useInitLists();

  return (
    <>
      <PaginatedDataTable<Admissions>
        columns={admissionColumns}
        endpoint={ADMISSIONS_REPORT}
        queryKey={ADMISSIONS_REPORT}
        searchPlaceholder="MRN"
        searchFields={[
          "patientId",
          "doctorId",
          "patientTypeId",
          "financialClassId",
          "admitDateRange",
        ]}
        defaultPageSize={15}
        defaultSortColumn="patientName"
        defaultSortDirection="asc"
        pdfDownloadEndpoint={DOWNLOAD_ADMISSIONS_PDF}
        defaultFilterValues={{ admitDateRange: getLastMonthRange() }}
      />
    </>
  );
}
