import { PaginatedDataTable } from "components/PaginatedDataTable";
import {
  DAILY_CENSUS_REPORT,
  DOWNLOAD_DAILY_CENSUS_PDF,
} from "constants/endPoints";
import { DailyCensus as DailyCensusReport } from "hooks/types/reports";
import { dailyCensusColumns } from "./common/columns";
import { useInitLists } from "hooks/useInitLists";

export default function DailyCensus() {
  useInitLists();

  return (
    <>
      <PaginatedDataTable<DailyCensusReport>
        columns={dailyCensusColumns}
        endpoint={DAILY_CENSUS_REPORT}
        queryKey={DAILY_CENSUS_REPORT}
        searchPlaceholder="MRN"
        searchFields={[
          "patientId",
          "doctorId",
          "financialClassId",
          "startDate",
        ]}
        defaultPageSize={15}
        defaultSortColumn="patientName"
        defaultSortDirection="asc"
        pdfDownloadEndpoint={DOWNLOAD_DAILY_CENSUS_PDF}
        defaultFilterValues={{
          startDate: new Date(),
        }}
      />
    </>
  );
}
