using EHR_Reports.Configuration;
using EHR_Reports.Interfaces;
using MailKit.Net.Smtp;
using Microsoft.Extensions.Options;
using MimeKit;

namespace EHR_Reports.Services
{
    public class EmailService : IEmailService
    {
        private readonly SmtpSettings _smtpSettings;
        public EmailService(IOptions<SmtpSettings> smtpSettings)
        {
            _smtpSettings = smtpSettings.Value;

        }

        public async Task<bool> SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default)
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(_smtpSettings.SenderName, _smtpSettings.SenderEmail));
                message.To.Add(new MailboxAddress("", to));
                message.Subject = subject;
                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = body
                };
                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                client.ServerCertificateValidationCallback = (s, c, h, e) => true;              

                await client.ConnectAsync(_smtpSettings.Host, _smtpSettings.Port, MailKit.Security.SecureSocketOptions.StartTls, cancellationToken);
               
                await client.AuthenticateAsync(_smtpSettings.UserName, _smtpSettings.Password, cancellationToken);
                
                await client.SendAsync(message, cancellationToken);
                
                await client.DisconnectAsync(true, cancellationToken);
                
                return true;
            }
            catch (Exception ex)
            {            
                Console.WriteLine(ex.Message);
                return false;
            }
        }
    }
}
