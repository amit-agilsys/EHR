using EHR_Reports.Models;
using Microsoft.AspNetCore.Mvc;

namespace EHR_Reports.DTOs.Report
{
   public class DailyCensusDTO
    {
        public int PatientId { get; set; }
        public string PatientName { get; set; }
        public string MRN { get; set; }
        public string DoctorName { get; set; }
        public int DoctorId { get; set; }
        public DateTime AdmitDate { get; set; }
        public DateTime? DischargeDate { get; set; }
        public DateOnly DOB { get; set; }
        public int Age { get; set; }
        public string FinancialClass { get; set; }
        public int FinancialClassId { get; set; }
    }

    public class DailyCensusRequest : DataTableRequest
    {
        [FromQuery(Name = "patientId[]")]
        public List<int> PatientId { get; set; }
        [FromQuery(Name = "doctorId[]")]
        public List<int> DoctorId { get; set; }
        //public DateTime? ReportDate { get; set; }
        public DateTime? StartDate { get; set; }
        public DateOnly? DOB { get; set; }
        public int Age { get; set; }
        [FromQuery(Name = "financialClassId[]")]
        public List<int> FinancialClassId { get; set; }
    }
}
