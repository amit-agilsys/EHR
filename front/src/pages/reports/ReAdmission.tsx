import { PaginatedDataTable } from "components/PaginatedDataTable";
import {
  DOWNLOAD_RE_ADMISSIONS_PDF,
  RE_ADMISSIONS_REPORT,
} from "constants/endPoints";
import { ReAdmission as ReAdmissions } from "hooks/types/reports";

import { useInitLists } from "hooks/useInitLists";
import { reAdmissionColumns } from "./common/columns";
import { getLastMonthRange } from "utils/utils";

export default function ReAdmission() {
  useInitLists();

  return (
    <>
      <PaginatedDataTable<ReAdmissions>
        columns={reAdmissionColumns}
        endpoint={RE_ADMISSIONS_REPORT}
        queryKey={RE_ADMISSIONS_REPORT}
        searchPlaceholder="MRN"
        searchFields={[
          "patientId",
          "doctorId",
          "admitDateRange",
          "dischargeDateRange",
        ]}
        defaultPageSize={15}
        defaultSortColumn="patientName"
        defaultSortDirection="asc"
        pdfDownloadEndpoint={DOWNLOAD_RE_ADMISSIONS_PDF}
        defaultFilterValues={{ admitDateRange: getLastMonthRange() }}
      />
    </>
  );
}
