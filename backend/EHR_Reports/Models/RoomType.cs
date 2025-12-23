namespace EHR_Reports.Models
{
    public class RoomType
    {
        public int Id { get; set; }
        public int Code { get; set; }
        public string Name { get; set; }

        public ICollection<PatientEncounter> PatientEncounters { get; set; }
    }
}
