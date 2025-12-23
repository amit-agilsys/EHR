namespace EHR_Reports.Models
{
    public class DataTableResponse<T> : ResponseModel<List<T>>
    {
        public int TotalRecords { get; set; }
        public int FilteredRecords { get; set; }
    }
}
