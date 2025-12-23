namespace EHR_Reports.DTOs.Patiens
{
    public class PatientDto
    {
        public int Id { get; set; }
        public string MRN { get; set; }
        public string Name { get; set; }
        public DateOnly DOB { get; set; }
        public string Gender { get; set; }

        public List<PatientInsuranceDto> PatientInsurances { get; set; }
    }

    public class PatientListDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }
}
