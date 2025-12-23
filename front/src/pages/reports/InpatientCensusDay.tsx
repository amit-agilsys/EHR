import { PaginatedDataTable } from "components/PaginatedDataTable";
import {
  DOWNLOAD_INPATIENT_CENSUS_PDF,
  INPATIENT_CENSUS_REPORT,
} from "constants/endPoints";
import { InpatientCensusDays } from "hooks/types/reports";
import { inpatientCensusDaysColumns } from "./common/columns";
import { useInitLists } from "hooks/useInitLists";
import { getLastMonthRange } from "utils/utils";

export default function InpatientCensusDay() {
  useInitLists();

  return (
    <>
      <PaginatedDataTable<InpatientCensusDays>
        columns={inpatientCensusDaysColumns}
        endpoint={INPATIENT_CENSUS_REPORT}
        queryKey={INPATIENT_CENSUS_REPORT}
        searchPlaceholder="MRN"
        searchFields={[
          "patientId",
          "patientTypeId",
          "admitDateRange",
          "dischargeDateRange",
          "financialClassId",
        ]}
        defaultPageSize={15}
        defaultSortColumn="patientName"
        defaultSortDirection="asc"
        pdfDownloadEndpoint={DOWNLOAD_INPATIENT_CENSUS_PDF}
        defaultFilterValues={{ admitDateRange: getLastMonthRange() }}
      />
    </>
  );
}
