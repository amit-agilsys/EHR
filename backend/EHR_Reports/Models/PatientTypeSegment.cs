namespace EHR_Reports.Models
{
    public class PatientTypeSegment
    {
        public int Id { get; set; }
        public int PatientEncounterId { get; set; }
        public int PatientTypeId { get; set; }
        public DateTime TransferInDate { get; set; }
        public TimeOnly TransferInTime { get; set; }
        public DateTime? TransferOutDate { get; set; }
        public TimeOnly? TransferOutTime { get; set; }

        // Navigation Properties
        public PatientEncounter PatientEncounter { get; set; }
        public PatientType PatientType { get; set; }
    }
}
