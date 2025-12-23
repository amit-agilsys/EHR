namespace EHR_Reports.Interfaces
{
    public interface IEmailService
    {
        Task<bool> SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default);
    }
}
