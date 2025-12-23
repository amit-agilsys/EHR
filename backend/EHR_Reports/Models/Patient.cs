using Microsoft.AspNetCore.Mvc;

namespace EHR_Reports.Models
{
    public class Patient
    {
        public int Id { get; set; }             
        public string MRN { get; set; }          
        public string Name { get; set; }
        public DateOnly DOB { get; set; }
        public string Gender { get; set; }
        public bool IsDeleted { get; set; } = false;

        public ICollection<PatientInsurance> PatientInsurances { get; set; }

        public ICollection<PatientEncounter> PatientEncounters { get; set; }
    }


    public class PatientDataTableRequest : DataTableRequest
    {
        public DateOnly? DOB { get; set; }
        [FromQuery(Name = "financialClassId[]")]
        public List<int> FinancialClassId { get; set; }
        public string Gender { get; set; }
    }
}
