using EHR_Reports.DTOs.Patiens;
using EHR_Reports.DTOs.Patient;
using EHR_Reports.Models;

namespace EHR_Reports.Interfaces
{
    public interface IPatientService
    {
        Task<DataTableResponse<PatientDto>> GetAllPatients(PatientDataTableRequest request);
        Task<ResponseModel<List<PatientListDto>>> SearchPatientByName(string query);
        Task<ResponseModel<PatientDto>> GetPatientById(int id);
        Task<ResponseModel<Patient>> CreatePatient(PatientDto patientDto);
        Task<ResponseModel<bool>> UpdatePatient(PatientDto patientDto);
        Task<ResponseModel<bool>> DeletePatient(int id);
        Task<DataTableResponse<PatientEncounterDto>> GetAllEncounter(EncounterDataTableRequest request);
        Task<DataTableResponse<PatientEncounterDto>> GetEncountersByPatientId(EncounterDataTableRequest request, int patientId);
        Task<ResponseModel<bool>> AddPatientEncounter(PatientEncounter patientEncounterDto);
        Task<ResponseModel<bool>> UpdatePatientEncounter(PatientEncounterDto encounterDto);
        Task<ResponseModel<bool>> DeletePatientEncounter(int id);
    }
}
