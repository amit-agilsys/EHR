using EHR_Reports.DTOs;
using EHR_Reports.Models;

namespace EHR_Reports.Interfaces
{
    public interface IScreenService
    {
        Task<ResponseModel<List<ScreenDto>>> GetScreensWithActions();
    }
}
