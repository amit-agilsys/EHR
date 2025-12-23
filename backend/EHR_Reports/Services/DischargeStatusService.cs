using EHR_Reports.Data;
using EHR_Reports.Interfaces;
using EHR_Reports.Models;
using Microsoft.EntityFrameworkCore;

namespace EHR_Reports.Services
{
    public class DischargeStatusService: IDischargeStatusService
    {
        private readonly ApplicationDbContext _context;
        public DischargeStatusService(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<ResponseModel<List<DischargeStatus>>> GetAllDischargeStatuses()
        {
            try
            {
                return ResponseModel<List<DischargeStatus>>
                     .SuccessResult(await _context.DischargeStatuses
                     .OrderBy(ds => ds.Name).ToListAsync());
            }
            catch (Exception ex)
            {
                return ResponseModel<List<DischargeStatus>>.Failure($"An error occurred while retrieving discharge statuses: {ex.Message}");
            }
        }
    }
}
