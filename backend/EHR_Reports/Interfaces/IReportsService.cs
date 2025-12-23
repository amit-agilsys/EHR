using EHR_Reports.DTOs.Report;
using EHR_Reports.Models;

namespace EHR_Reports.Interfaces
{
    public interface IReportsService
    {
        Task<DataTableResponse<DailyCensusDTO>> GetDailyCensusReport(DailyCensusRequest request);
        Task<DataTableResponse<DischargesDto>> GetDischargesReport(DischargesRequest request);
        Task<DataTableResponse<AdmissionsDTO>> GetAdmissionsReport(AdmissionsRequest request);
        Task<DataTableResponse<ReadmissionsDto>> GetReadmissionsReport(ReadmissionsRequest request);
        Task<DataTableResponse<ObservationHoursDto>> GetObservationHoursReport(ObservationHoursRequest request);
        Task<DataTableResponse<InpatientCensusDays>> GetInpatientCensusReport(InpatientCensusDaysRequest request);
        Task<byte[]> GenerateDailyCensusPdf(DailyCensusRequest dataTableRequest);
        Task<byte[]> GenerateAdmissionPdf(AdmissionsRequest dataTableRequest);
        Task<byte[]> GenerateDischargePdf(DischargesRequest dataTableRequest);
        Task<byte[]> GenerateReadmissionsPdf(ReadmissionsRequest dataTableRequest);
        Task<byte[]> GenerateObservationHoursPdf(ObservationHoursRequest dataTableRequest);
        Task<byte[]> GenerateInpatientCensusPdf(InpatientCensusDaysRequest dataTableRequest);
    }

}
