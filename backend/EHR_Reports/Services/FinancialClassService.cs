using EHR_Reports.Data;
using EHR_Reports.Interfaces;
using EHR_Reports.Models;
using Microsoft.EntityFrameworkCore;

namespace EHR_Reports.Services
{
    public class FinancialClassService : IFinancialClassService
    {
        private readonly ApplicationDbContext _context;
        public FinancialClassService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ResponseModel<List<FinancialClass>>> GetAllFinancialClasses()
        {
            try
            {
                return ResponseModel<List<FinancialClass>>
                    .SuccessResult(await _context.FinancialClasses
                    .OrderBy(fc => fc.Name).ToListAsync());
            }
            catch (Exception ex)
            {
                return ResponseModel<List<FinancialClass>>.Failure(ex.Message);
            }
        }
    }
}
