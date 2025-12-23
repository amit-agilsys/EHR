using Microsoft.AspNetCore.Identity;

namespace EHR_Reports.Models
{
    public class User: IdentityUser
    {
        public string Name { get; set; }
        public DateTime CreatedDate { get; set; }
        public bool IsDeleted { get; set; }
        public ICollection<PatientEncounter> PatientEncounters { get; set; }
    }


    public class UserDataTableRequest : DataTableRequest
    {
        public bool? EmailConfirmed { get; set; }
        public string Role { get; set; }
    }
}
