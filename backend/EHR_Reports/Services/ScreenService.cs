using EHR_Reports.Data;
using EHR_Reports.DTOs;
using EHR_Reports.Interfaces;
using EHR_Reports.Models;
using Microsoft.EntityFrameworkCore;

namespace EHR_Reports.Services
{
    public class ScreenService : IScreenService
    {
        private readonly ApplicationDbContext _context;
        public ScreenService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ResponseModel<List<ScreenDto>>> GetScreensWithActions()
        {
            try
            {
                var screens = await _context.Screens
                 .Where(s => s.IsActive)
                 .Include(s => s.ScreenActions.Where(sa => sa.IsActive))
                 .OrderBy(s => s.ScreenName)
                 .Select(s => new ScreenDto
                 {
                     ScreenId = s.Id,
                     ScreenName = s.ScreenName,
                     Actions = s.ScreenActions
                         .OrderBy(sa => sa.ActionName)
                         .Select(sa => new ScreenActionDto
                         {
                             ActionId = sa.Id,
                             ActionName = sa.ActionName
                         })
                         .ToList()
                 })
                 .ToListAsync();

                return ResponseModel<List<ScreenDto>>.SuccessResult(screens, "Screens retrieved successfully.");
            }
            catch (Exception ex)
            {
                return ResponseModel<List<ScreenDto>>.Failure($"An error occurred while retrieving screens: {ex.Message}");
            }
        }
    }
}
