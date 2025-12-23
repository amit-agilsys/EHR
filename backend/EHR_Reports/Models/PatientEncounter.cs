using Microsoft.AspNetCore.Mvc;

namespace EHR_Reports.Models
{
    public class PatientEncounter
    {
        public int Id { get; set; }
        public DateTime AdmitDate { get; set; }
        public TimeOnly AdmitTime { get; set; }
        public DateTime? DischargeDate { get; set; }
        public TimeOnly? DischargeTime { get; set; }
        public int DoctorId { get; set; }
        public int PatientId { get; set; }
        public int PatientTypeId { get; set; }
        public string AdmitNumber { get; set; }
        public int RoomTypeId { get; set; }


        // Navigation Properties
        public Doctor Doctor { get; set; }
        public Patient Patient { get; set; }
        public PatientType PatientType { get; set; }
        public RoomType RoomType { get; set; }
        public ICollection<PatientTypeSegment> PatientTypeSegments { get; set; }
    }


    public class EncounterDataTableRequest : DataTableRequest
    {
        [FromQuery(Name = "patientId[]")]
        public List<int> PatientId { get; set; }
        [FromQuery(Name = "doctorId[]")]
        public List<int> DoctorId  { get; set; }
        [FromQuery(Name = "patientTypeId[]")]
        public List<int> PatientTypeId { get; set; }
        [FromQuery(Name = "roomTypeId[]")]
        public List<int> RoomTypeId { get; set; }
        public DateTime? AdmitDate { get; set; }
        public DateTime? DischargeDate { get; set; }
    }
}
