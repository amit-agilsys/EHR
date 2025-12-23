namespace EHR_Reports.Models
{
    public class PatientType
    {
        public int Id { get; set; }
        public int Code { get; set; }
        public string Name { get; set; }

        public ICollection<PatientEncounter> PatientEncounters { get; set; }
        public ICollection<PatientTypeSegment> PatientTypeSegments { get; set; }
    }
}
