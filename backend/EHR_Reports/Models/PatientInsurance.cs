using System.ComponentModel.DataAnnotations;

namespace EHR_Reports.Models
{
    public class PatientInsurance
    {
        
        public int Id { get; set; }
        public string InsuranceNumber { get; set; }
        public int FinancialId { get; set; }
        public int PatientId { get; set; }
        public int PatientInsurance1Id { get; set; }
        public int? PatientInsurance2Id { get; set; }

        // Navigation Properties
        public Patient Patient { get; set; }
        public FinancialClass FinancialClass { get; set; }
        public Insurance PatientInsurance1 { get; set; }
        public Insurance PatientInsurance2 { get; set; }
    }
}
