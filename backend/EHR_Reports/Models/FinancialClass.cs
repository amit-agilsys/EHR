namespace EHR_Reports.Models
{
    public class FinancialClass
    {
        public int Id { get; set; }
        public string Name { get; set; }

        // Navigation
        public ICollection<PatientInsurance> PatientInsurances { get; set; }
    }
}
