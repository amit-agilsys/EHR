using EHR_Reports.Models;

namespace EHR_Reports.Interfaces
{
    public interface IPatientTypeService
    {
        Task<ResponseModel<List<PatientType>>> GetAllPatientTypes();
    }
}
