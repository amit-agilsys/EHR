using EHR_Reports.Models;

namespace EHR_Reports.Interfaces
{
    public interface IFinancialClassService
    {
        Task<ResponseModel<List<FinancialClass>>> GetAllFinancialClasses();
    }
}
