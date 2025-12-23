namespace EHR_Reports.DTOs.Patient
{
    public class PatientEncounterDto
    {
        public int Id { get; set; }
        public DateTime AdmitDate { get; set; }
        public TimeOnly AdmitTime { get; set; }
        public DateTime? DischargeDate { get; set; }
        public TimeOnly? DischargeTime { get; set; }
        public int DoctorId { get; set; }
        public string DoctorName { get; set; }
        public int PatientId { get; set; }
        public string PatientName { get; set; }
        public int PatientTypeId { get; set; }
        public string PatientTypeName { get; set; }
        public string AdmitNumber { get; set; }
        public int RoomTypeId { get; set; }
        public string RoomTypeName { get; set; }
        public List<PatientTypeSegmentDto> PatientTypeSegments { get; set; } = new List<PatientTypeSegmentDto>();
    }
}
