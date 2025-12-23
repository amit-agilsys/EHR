using EHR_Reports.Models;
using Microsoft.AspNetCore.Mvc;

namespace EHR_Reports.DTOs.Report
{
    public class ReadmissionsDto
    {
        public string MRN { get; set; }
        public int PatientId { get; set; }
        public string PatientName { get; set; }
        public DateOnly DOB { get; set; }
        public DateTime AdmitDate { get; set; }
        public DateTime DischargeDate { get; set; }
        public int TimeSinceReadmission { get; set; }
        public int LengthOfStay { get; set; }
        public string DoctorName { get; set; }
        public int DoctorId { get; set; }
        public bool IsReadmission { get; set; }
    }

    public class ReadmissionsRequest : DataTableRequest
    {
        [FromQuery(Name = "patientId[]")]
        public List<int> PatientId { get; set; }
        
        [FromQuery(Name = "doctorId[]")]
        public List<int> DoctorId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime? AdmitStartDate { get; set; }
        public DateTime? AdmitEndDate { get; set; }
        public DateTime? DischargeStartDate { get; set; }
        public DateTime? DischargeEndDate { get; set; }
        public DateOnly? DOB { get; set; }
        public DateTime? AdmitDate { get; set; }
        public DateTime? DischargeDate { get; set; }
    }
}
