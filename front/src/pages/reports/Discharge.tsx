import { PaginatedDataTable } from "components/PaginatedDataTable";
import { DISCHARGE_REPORT, DOWNLOAD_DISCHARGE_PDF } from "constants/endPoints";
import { Discharge as DischargeType } from "hooks/types/reports";
import { dischargeColumns } from "./common/columns";
import { useInitLists } from "hooks/useInitLists";
import { getLastMonthRange } from "utils/utils";

export default function Discharge() {
  useInitLists();

  return (
    <>
      <PaginatedDataTable<DischargeType>
        columns={dischargeColumns}
        endpoint={DISCHARGE_REPORT}
        queryKey={DISCHARGE_REPORT}
        searchPlaceholder="MRN"
        searchFields={[
          "patientId",
          "doctorId",
          "patientTypeId",
          "financialClassId",
          "dischargeDateRange",
        ]}
        defaultPageSize={15}
        defaultSortColumn="patientName"
        defaultSortDirection="asc"
        pdfDownloadEndpoint={DOWNLOAD_DISCHARGE_PDF}
        defaultFilterValues={{ dischargeDateRange: getLastMonthRange() }}
      />
    </>
  );
}
