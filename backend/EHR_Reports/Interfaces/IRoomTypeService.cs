using EHR_Reports.Models;

namespace EHR_Reports.Interfaces
{
    public interface IRoomTypeService
    {
        Task<ResponseModel<List<RoomType>>> GetAllRoomTypes();
    }
}
