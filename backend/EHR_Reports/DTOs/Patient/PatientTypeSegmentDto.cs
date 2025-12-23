namespace EHR_Reports.DTOs.Patient
{
    public class PatientTypeSegmentDto
    {
        public int Id { get; set; }
        public int PatientTypeId { get; set; }
        public DateTime TransferInDate { get; set; }
        public TimeOnly TransferInTime { get; set; }
        public DateTime? TransferOutDate { get; set; }
        public TimeOnly? TransferOutTime { get; set; }
    }

}
