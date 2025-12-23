namespace EHR_Reports.DTOs.Patiens
{
    public class PatientInsuranceDto
    {
        public int Id { get; set; }
        public string InsuranceNumber { get; set; }
        public int FinancialId { get; set; }
        public string FinancialName { get; set; }
        public int PatientInsurance1Id { get; set; }
        public string InsuranceName1 { get; set; }
        public int? PatientInsurance2Id { get; set; }
        public string InsuranceName2 { get; set; }
    }
}
