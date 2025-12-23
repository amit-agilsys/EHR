using EHR_Reports.Models;

namespace EHR_Reports.Interfaces
{
    public interface IDoctorService
    {
        Task<DataTableResponse<Doctor>> GetAllDoctors(DataTableRequest dataTableRequest);
        Task<ResponseModel<List<DoctorListDto>>> SearchDoctorByName(string query);
        Task<ResponseModel<Doctor>> GetDoctorById(int id);
        Task<ResponseModel<Doctor>> AddDoctor(Doctor doctor);
        Task<ResponseModel<Doctor>> UpdateDoctor(Doctor doctor);
        Task<ResponseModel<bool>> DeleteDoctor(int id);
    }
}
