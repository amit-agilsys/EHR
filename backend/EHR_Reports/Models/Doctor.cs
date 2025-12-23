namespace EHR_Reports.Models
{
    public class Doctor
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public bool IsDeleted { get; set; } = false;

        public ICollection<PatientEncounter> PatientEncounters { get; set; }
    }

    public class DoctorListDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }
}
