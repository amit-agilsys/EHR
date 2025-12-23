using EHR_Reports.Data;
using EHR_Reports.Interfaces;
using EHR_Reports.Models;
using Microsoft.EntityFrameworkCore;

namespace EHR_Reports.Services
{
    public class RoomTypeService: IRoomTypeService
    {
        private readonly ApplicationDbContext _context;
        public RoomTypeService(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<ResponseModel<List<RoomType>>> GetAllRoomTypes()
        {
            try
            {
               return ResponseModel<List<RoomType>>
                    .SuccessResult(await _context.RoomTypes
                    .OrderBy(rt => rt.Name).ToListAsync());
            }
            catch (Exception ex)
            {
                return ResponseModel<List<RoomType>>.Failure($"An error occurred while retrieving room types: {ex.Message}");
            }
        }
    }
}
