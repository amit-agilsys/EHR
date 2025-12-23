using EHR_Reports.Models;
using Microsoft.AspNetCore.Mvc;

namespace EHR_Reports.DTOs.Report
{
    public class InpatientCensusDays
    {
        public string MRN { get; set; }
        public int PatientId { get; set; }
        public string PatientName { get; set; }
        public DateOnly DOB { get; set; }
        public DateTime AdmitDate { get; set; }
        public TimeOnly AdmitTime { get; set; }
        public DateTime DischargeDate { get; set; }
        public TimeOnly DischargeTime { get; set; }
        public string FinancialClass { get; set; }
        public string LengthOfStay { get; set; }
        public string PatientDays { get; set; }
        public string PatientType { get; set; }
    }

    public class InpatientCensusDaysRequest : DataTableRequest
    {
        public string MRN { get; set; }

        [FromQuery(Name = "patientId[]")]
        public List<int> PatientId { get; set; }

        [FromQuery(Name = "doctorId[]")]
        public List<int> DoctorId { get; set; }
        [FromQuery(Name = "financialClassId[]")]
        public List<int> FinancialClassId { get; set; }
        [FromQuery(Name = "patientTypeId[]")]
        public List<int> PatientTypeId { get; set; }
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
