namespace EHR_Reports.Utilities
{
    public class Utils
    {
        public static int CalculateAge(DateOnly dob)
        {
            var today = DateOnly.FromDateTime(DateTime.Today);
            int age = today.Year - dob.Year;

            if (today.DayOfYear < dob.DayOfYear)
                age--;

            return age;
        }
    }
}
