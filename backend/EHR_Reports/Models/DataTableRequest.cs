namespace EHR_Reports.Models
{
    public class DataTableRequest
    {
        public int Limit { get; set; }
        public int Page { get; set; } 
        public string SortColumn { get; set; }
        public string SortDirection { get; set; }
        public string SearchFields { get; set; }
        public string Search { get; set; }
    }
}
