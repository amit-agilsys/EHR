using EHR_Reports.Models;

namespace EHR_Reports.Interfaces
{
    public interface IDischargeStatusService
    {
        Task<ResponseModel<List<DischargeStatus>>> GetAllDischargeStatuses();
    }
}
