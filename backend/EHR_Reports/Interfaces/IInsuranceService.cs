using EHR_Reports.Models;

namespace EHR_Reports.Interfaces
{
    public interface IInsuranceService
    {
        Task<ResponseModel<List<Insurance>>> GetAllInsurances();
    }
}
