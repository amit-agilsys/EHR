import { PaginatedDataTable } from "components/PaginatedDataTable";
import {
  DOWNLOAD_OBSERVATION_HOURS_PDF,
  OBSERVATION_HOURS_REPORT,
} from "constants/endPoints";
import { ObservationHours } from "hooks/types/reports";
import { observationHoursColumns } from "./common/columns";
import { useInitLists } from "hooks/useInitLists";
import { getLastMonthRange } from "utils/utils";

export default function ObservationHour() {
  useInitLists();

  return (
    <>
      <PaginatedDataTable<ObservationHours>
        columns={observationHoursColumns}
        endpoint={OBSERVATION_HOURS_REPORT}
        queryKey={OBSERVATION_HOURS_REPORT}
        searchPlaceholder="MRN"
        searchFields={["patientId", "admitDateRange", "dischargeDateRange"]}
        defaultPageSize={15}
        defaultSortColumn="patientName"
        defaultSortDirection="asc"
        pdfDownloadEndpoint={DOWNLOAD_OBSERVATION_HOURS_PDF}
        defaultFilterValues={{ admitDateRange: getLastMonthRange() }}
      />
    </>
  );
}
