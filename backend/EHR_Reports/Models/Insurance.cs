namespace EHR_Reports.Models
{
    public class Insurance
    {
        public int Id { get; set; }
        public string Name { get; set; }

        // Navigation
        public ICollection<PatientInsurance> PatientInsurances1 { get; set; }
        public ICollection<PatientInsurance> PatientInsurances2 { get; set; }
    }
}
