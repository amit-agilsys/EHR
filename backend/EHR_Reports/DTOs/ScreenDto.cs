namespace EHR_Reports.DTOs
{
    public class ScreenDto
    {
        public int ScreenId { get; set; }
        public string ScreenName { get; set; }
        public List<ScreenActionDto> Actions { get; set; }
    }

    public class ScreenActionDto
    {
        public int ActionId { get; set; }
        public string ActionName { get; set; }
    }
}
