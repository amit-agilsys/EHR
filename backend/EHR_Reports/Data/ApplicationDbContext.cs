using EHR_Reports.Models;
using EHR_Reports.Models.Role;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace EHR_Reports.Data
{
    public class ApplicationDbContext : IdentityDbContext<User, ApplicationRole, string>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        #region Tables
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<Patient> Patients { get; set; }
        public DbSet<PatientInsurance> PatientInsurances { get; set; }
        public DbSet<FinancialClass> FinancialClasses { get; set; }
        public DbSet<Insurance> Insurances { get; set; }
        public DbSet<PatientType> PatientTypes { get; set; }
        public DbSet<RoomType> RoomTypes { get; set; }
        public DbSet<DischargeStatus> DischargeStatuses { get; set; }
        public DbSet<PatientEncounter> PatientEncounters { get; set; }
        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<PatientTypeSegment> PatientTypeSegments { get; set; }
        public DbSet<Screen> Screens { get; set; }
        public DbSet<ScreenAction> ScreenActions { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }

        #endregion

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);


            #region Primary Keys Configuration
            builder.Entity<RefreshToken>()
                .HasKey(rt => rt.Id);

            builder.Entity<Patient>()
             .HasKey(p => p.Id);

            builder.Entity<PatientInsurance>()
              .HasKey(p => p.Id);

            builder.Entity<Insurance>()
             .HasKey(p => p.Id);

            builder.Entity<FinancialClass>()
                .HasKey(f => f.Id);

            builder.Entity<PatientType>()
                .ToTable("PatientTypes")
                .HasKey(p => p.Id);

            builder.Entity<Screen>(entity => {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.ScreenName).IsUnique();
            });

            #endregion

            

            #region foreign keys configuration
            // Patient Relationship
            builder.Entity<PatientInsurance>()
                .HasOne(pi => pi.Patient)
                .WithMany(p => p.PatientInsurances)
                .HasForeignKey(pi => pi.PatientId);

            // FinancialClass Relationship
            builder.Entity<PatientInsurance>()
                .HasOne(pi => pi.FinancialClass)
                .WithMany(fc => fc.PatientInsurances)
                .HasForeignKey(pi => pi.FinancialId);

            // PatientInsurance1
            builder.Entity<PatientInsurance>()
                .HasOne(pi => pi.PatientInsurance1)
                .WithMany(iname => iname.PatientInsurances1)
                .HasForeignKey(pi => pi.PatientInsurance1Id)
                .OnDelete(DeleteBehavior.Restrict);

            // PatientInsurance2
            builder.Entity<PatientInsurance>()
                .HasOne(pi => pi.PatientInsurance2)
                .WithMany(iname => iname.PatientInsurances2)
                .HasForeignKey(pi => pi.PatientInsurance2Id)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<PatientEncounter>()
               .HasOne(pe => pe.Patient)
               .WithMany(p => p.PatientEncounters)
               .HasForeignKey(pe => pe.PatientId);

            builder.Entity<PatientEncounter>()
                 .HasOne(pe => pe.PatientType)
                 .WithMany(loc => loc.PatientEncounters)
                 .HasForeignKey(pe => pe.PatientTypeId);

            builder.Entity<PatientEncounter>()
                .HasOne(pe => pe.RoomType)
                .WithMany(rt => rt.PatientEncounters)
                .HasForeignKey(pe => pe.RoomTypeId);

            builder.Entity<PatientEncounter>()
                .HasOne(pe => pe.Doctor)
                .WithMany(d => d.PatientEncounters)
                .HasForeignKey(pe => pe.DoctorId);

            builder.Entity<PatientTypeSegment>()
            .HasOne(pts => pts.PatientEncounter)
            .WithMany(pe => pe.PatientTypeSegments)
            .HasForeignKey(pts => pts.PatientEncounterId)
            .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<PatientTypeSegment>()
                .HasOne(pts => pts.PatientType)
                .WithMany(pt => pt.PatientTypeSegments)
                .HasForeignKey(pts => pts.PatientTypeId)
                .OnDelete(DeleteBehavior.Restrict);


            //screen action to screen relationship
            builder.Entity<ScreenAction>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasOne(sa => sa.Screen)
                    .WithMany(s => s.ScreenActions)
                    .HasForeignKey(sa => sa.ScreenId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Composite unique index: one action per screen
                entity.HasIndex(e => new { e.ScreenId, e.ActionName }).IsUnique();
            });

            // Configure RolePermission
            builder.Entity<RolePermission>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasOne(rp => rp.Role)
                    .WithMany()
                    .HasForeignKey(rp => rp.RoleId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(rp => rp.Screen)
                    .WithMany(s => s.RolePermissions)
                    .HasForeignKey(rp => rp.ScreenId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(rp => rp.ScreenAction)
                    .WithMany(sa => sa.RolePermissions)
                    .HasForeignKey(rp => rp.ScreenActionId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Composite unique index: one permission entry per role-screen-action
                entity.HasIndex(e => new { e.RoleId, e.ScreenId, e.ScreenActionId }).IsUnique();
            });


        #endregion

        #region filter deleted and suspended users

        // Filter deleted patients
        builder.Entity<Patient>().HasQueryFilter(p => !p.IsDeleted);


            // Avoid deleted users  ------- check for suspended users
            builder.Entity<User>().ToTable("Users");

            // Soft delete global filter
            builder.Entity<User>().HasQueryFilter(u => !u.IsDeleted);

            builder.Entity<User>()
                .HasIndex(u => u.NormalizedUserName)
                .IsUnique()
                .HasDatabaseName("UserNameIndex")
                .HasFilter("[IsDeleted] = 0");

            builder.Entity<User>()
                .HasIndex(u => u.NormalizedEmail)
                .IsUnique()
                .HasDatabaseName("EmailIndex")
                .HasFilter("[IsDeleted] = 0");

            // Your custom indexes
            builder.Entity<User>()
                .HasIndex(u => u.UserName)
                .IsUnique()
                .HasFilter("[IsDeleted] = 0");

            builder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique()
                .HasFilter("[IsDeleted] = 0");
            #endregion

            #region Identity tables
            builder.Entity<ApplicationRole>().ToTable("Roles");
            builder.Entity<IdentityUserRole<string>>().ToTable("UserRoles");
            builder.Entity<IdentityUserClaim<string>>().ToTable("UserClaims");
            builder.Entity<IdentityUserLogin<string>>().ToTable("UserLogins");
            builder.Entity<IdentityRoleClaim<string>>().ToTable("RoleClaims");
            builder.Entity<IdentityUserToken<string>>().ToTable("UserTokens");
            #endregion
        }


    }
}
