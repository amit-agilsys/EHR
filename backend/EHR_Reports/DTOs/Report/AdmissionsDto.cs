using EHR_Reports.Models;
using Microsoft.AspNetCore.Mvc;

namespace EHR_Reports.DTOs.Report
{
    public class AdmissionsDTO
    {
        public int PatientId { get; set; }
        public string PatientName { get; set; }
        public string MRN { get; set; }
        public string DoctorName { get; set; }
        public int DoctorId { get; set; }
        public DateTime AdmitDate { get; set; }
        public string PatientType{ get; set; }
        public int PatientTypeId { get; set; }
        public DateOnly DOB { get; set; }
        public int Age { get; set; }
        public string FinancialClass { get; set; }
        public int FinancialClassId { get; set; }
    }

    public class AdmissionsRequest : DataTableRequest
    {
        [FromQuery(Name = "patientId[]")]
        public List<int> PatientId { get; set; }
        [FromQuery(Name = "doctorId[]")]
        public List<int> DoctorId { get; set; }
        public DateTime? AdmitStartDate { get; set; }
        public DateTime? AdmitEndDate { get; set; }
        public DateTime? AdmitDate { get; set; }
        public DateOnly? DOB { get; set; }
        [FromQuery(Name = "financialClassId[]")]
        public List<int> FinancialClassId { get; set; }
        [FromQuery(Name = "patientTypeId[]")]
        public List<int> PatientTypeId { get; set; }
    }
}
