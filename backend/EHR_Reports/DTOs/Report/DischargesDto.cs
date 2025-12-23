using EHR_Reports.Models;
using Microsoft.AspNetCore.Mvc;

namespace EHR_Reports.DTOs.Report
{
    public class DischargesDto
    {
        public int PatientId { get; set; }
        public string PatientName { get; set; }
        public string MRN { get; set; }
        public string DoctorName { get; set; }
        public int DoctorId { get; set; }
        public DateTime DischargeDate { get; set; }
        public string PatientType { get; set; }
        public int PatientTypeId { get; set; }
        public DateOnly DOB { get; set; }
        public int Age { get; set; }
        public string FinancialClass { get; set; }
        public int FinancialClassId { get; set; }
    }

    public class DischargesRequest : DataTableRequest
    {
        [FromQuery(Name = "patientId[]")]
        public List<int> PatientId { get; set; }
        [FromQuery(Name = "doctorId[]")]
        public List<int> DoctorId { get; set; }
        public DateTime? DischargeStartDate { get; set; }
        public DateTime? DischargeEndDate { get; set; }
        public DateOnly? DOB { get; set; }
        [FromQuery(Name = "financialClassId[]")]
        public List<int> FinancialClassId { get; set; }
        [FromQuery(Name = "patientTypeId[]")]
        public List<int> PatientTypeId { get; set; }
        public DateTime? DischargeDate { get; set; }
    }
}
