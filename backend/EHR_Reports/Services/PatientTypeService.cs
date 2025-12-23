using EHR_Reports.Data;
using EHR_Reports.Interfaces;
using EHR_Reports.Models;
using Microsoft.EntityFrameworkCore;

namespace EHR_Reports.Services
{
    public class PatientTypeService : IPatientTypeService
    {
        private readonly ApplicationDbContext _context;

        public PatientTypeService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ResponseModel<List<PatientType>>> GetAllPatientTypes()
        {
            try
            {
                return ResponseModel<List<PatientType>>
                    .SuccessResult(await _context.PatientTypes
                    .OrderBy(loc => loc.Name).ToListAsync());
            }
            catch (Exception ex)
            {
                return ResponseModel<List<PatientType>>.Failure(ex.Message);
            }
        }
    }
}
