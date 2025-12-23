using EHR_Reports.Data;
using EHR_Reports.Interfaces;
using EHR_Reports.Models;
using Microsoft.EntityFrameworkCore;

namespace EHR_Reports.Services
{
    public class InsuranceService : IInsuranceService
    {
        private readonly ApplicationDbContext _context;
        public InsuranceService(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<ResponseModel<List<Insurance>>> GetAllInsurances()
        {
            try
            {
                return ResponseModel<List<Insurance>>
                    .SuccessResult(await _context.Insurances
                    .OrderBy(i => i.Name).ToListAsync());
            }
            catch (Exception ex)
            {
                return ResponseModel<List<Insurance>>.Failure(ex.Message);
            }
        }
    }
}
