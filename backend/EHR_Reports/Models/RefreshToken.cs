namespace EHR_Reports.Models
{
    public class RefreshToken
    {
        public int Id { get; set; }
        public string Token { get; set; } = Guid.NewGuid().ToString();
        public DateTime ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? RevokedAt { get; set; }
        public bool IsRevoked => RevokedAt != null;
        public string UserId { get; set; }
    }
}
