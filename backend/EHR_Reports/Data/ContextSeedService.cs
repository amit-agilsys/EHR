using EHR_Reports.Models;
using EHR_Reports.Models.Role;
using Microsoft.EntityFrameworkCore;

namespace EHR_Reports.Data
{
    public class ContextSeedService
    {
        private readonly ApplicationDbContext _context;

        public ContextSeedService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task InitializeContextAsync()
        {
            if (_context.Database.GetPendingMigrationsAsync().GetAwaiter().GetResult().Count() > 0)
            {
                await _context.Database.MigrateAsync();
            }

            if (!_context.FinancialClasses.AnyAsync().GetAwaiter().GetResult())
            {

                List<FinancialClass> financialClasses = new List<FinancialClass>()
                {
                    new FinancialClass { Name = "Medicare" },
                    new FinancialClass { Name = "Medicare HMO" },
                    new FinancialClass { Name = "Medicaid" },
                    new FinancialClass { Name = "Medicaid MCO" },
                    new FinancialClass { Name = "Commercial" },
                    new FinancialClass { Name = "Self Pay" },
                    new FinancialClass { Name = "Respite" }
                };

                await _context.FinancialClasses.AddRangeAsync(financialClasses);
                await _context.SaveChangesAsync();
            }
            if (!_context.Insurances.AnyAsync().GetAwaiter().GetResult())
            {

                List<Insurance> insurances = new List<Insurance>()
                  {
                      new Insurance { Name = "Medicare" },
                      new Insurance { Name = "Aetna Medicare" },
                      new Insurance { Name = "Blue Advantage Medicare" },
                      new Insurance { Name = "Humana Gold Medicare" },
                      new Insurance { Name = "United Healthcare Peoples Health Medicare" },
                      new Insurance { Name = "United Healthcare Dual Medicare" },
                      new Insurance { Name = "Advantage" },
                      new Insurance { Name = "Medicaid" },
                      new Insurance { Name = "Aetna Better Health Medicaid" },
                      new Insurance { Name = "AmeriHealth Caritas Medicaid" },
                      new Insurance { Name = "Healthy Blue Medicaid" },
                      new Insurance { Name = "Humana Healthy Horizons Medicaid" },
                      new Insurance { Name = "Louisiana Healthcare Connections Medicaid" },
                      new Insurance { Name = "United Health Care Community Medicaid" },
                      new Insurance { Name = "Aetna" },
                      new Insurance { Name = "BlueCross BlueShields" },
                      new Insurance { Name = "Cigna" },
                      new Insurance { Name = "Humana" },
                      new Insurance { Name = "Humana Tricare" },
                      new Insurance { Name = "Optum VA" },
                      new Insurance { Name = "PPO Plus - Zelis" },
                      new Insurance { Name = "United Healthcare" },
                      new Insurance { Name = "United Healthcare Bronze" },
                      new Insurance { Name = "United Healthcare Silver" },

                  };
                await _context.Insurances.AddRangeAsync(insurances);
                await _context.SaveChangesAsync();
            }
            if (!_context.RoomTypes.AnyAsync().GetAwaiter().GetResult())
            {
                List<RoomType> roomTypes = new List<RoomType>()
                {
                    new RoomType {Code = 1, Name = "Private" },
                    new RoomType {Code = 2, Name = "Observation" },
                    new RoomType {Code = 3, Name = "Monitor" },
                    new RoomType {Code = 4, Name = "Swingbed" },
                    new RoomType {Code = 5,  Name = "Respite" },
                    new RoomType {Code = 6, Name = "Isolation" },
                    new RoomType {Code = 7, Name = "Outpatient" },
                };
                await _context.RoomTypes.AddRangeAsync(roomTypes);
                await _context.SaveChangesAsync();
            }
            if (!_context.PatientTypes.AnyAsync().GetAwaiter().GetResult())
            {
                List<PatientType> patientType = new List<PatientType>()
                {
                    new PatientType {Code = 01, Name = "Acute" },
                    new PatientType {Code = 03, Name = "Observation" },
                    new PatientType {Code = 04, Name = "Swingbed" },
                    new PatientType {Code = 05, Name = "Respite" },
                    new PatientType {Code = 12, Name = "OP Blood" },
                    new PatientType {Code = 11, Name = "OP Services" },
                };
                await _context.PatientTypes.AddRangeAsync(patientType);
                await _context.SaveChangesAsync();
            }
            if (!_context.DischargeStatuses.AnyAsync().GetAwaiter().GetResult())
            {
                List<DischargeStatus> dischargeStatus = new List<DischargeStatus>()
                {
                    new DischargeStatus {Code= 1, Name = "Discharge to Home" },
                    new DischargeStatus {Code= 2, Name = "Transfer to Inpatient Acute" },
                    new DischargeStatus {Code= 3, Name = "Transfer to SNF" },
                    new DischargeStatus {Code= 6, Name = "Discharge Home with Home Health" },
                    new DischargeStatus {Code= 9, Name = "Outpatient to Inpatient" },
                    new DischargeStatus {Code= 20, Name = "Expired" },
                    new DischargeStatus {Code= 30, Name = "Still a patient" },
                    new DischargeStatus {Code= 50, Name = "Discharge Home with Hospice" },
                    new DischargeStatus {Code= 51, Name = "Discharge Medical Facility with Hospice" },
                    new DischargeStatus {Code= 61, Name = "Transferred to Swingbed" },

                };
                await _context.DischargeStatuses.AddRangeAsync(dischargeStatus);
                await _context.SaveChangesAsync();
            }

            // Screen and screen action seeds
            if (!_context.Screens.AnyAsync().GetAwaiter().GetResult())
            {
                var screens = new List<Screen>
                {
                    new Screen { ScreenName = "Patients",  IsActive = true },
                    new Screen { ScreenName = "Encounters", IsActive = true },
                    new Screen { ScreenName = "Users", IsActive = true },
                    new Screen { ScreenName = "Doctors", IsActive = true },
                    new Screen { ScreenName = "Role", IsActive = true },
                    new Screen { ScreenName = "Reports", IsActive = true }
                };

                await _context.Screens.AddRangeAsync(screens);
                await _context.SaveChangesAsync();


                // actions for each screen
                var screenActions = new List<ScreenAction>();

                // CRUD screens (View, Add, Edit, Delete)
                var crudScreens = screens.Where(s => new[] { "patients", "encounters", "users", "doctors", "role" }.Contains(s.ScreenName)).ToList();
                foreach (var screen in crudScreens)
                {
                    screenActions.Add(new ScreenAction { ScreenId = screen.Id, ActionName = "View", IsActive = true });
                    screenActions.Add(new ScreenAction { ScreenId = screen.Id, ActionName = "Add", IsActive = true });
                    screenActions.Add(new ScreenAction { ScreenId = screen.Id, ActionName = "Edit", IsActive = true });
                    screenActions.Add(new ScreenAction { ScreenId = screen.Id, ActionName = "Delete", IsActive = true });
                }

                // Report screens (View, Download PDF)
                var reportsScreen = screens.FirstOrDefault(s => s.ScreenName == "Reports");
                if (reportsScreen != null)
                {
                    screenActions.Add(new ScreenAction { ScreenId = reportsScreen.Id, ActionName = "Daily Census", IsActive = true });
                    screenActions.Add(new ScreenAction { ScreenId = reportsScreen.Id, ActionName = "Admission", IsActive = true });
                    screenActions.Add(new ScreenAction { ScreenId = reportsScreen.Id, ActionName = "Discharge", IsActive = true });
                    screenActions.Add(new ScreenAction { ScreenId = reportsScreen.Id, ActionName = "Re-Admission", IsActive = true });
                    screenActions.Add(new ScreenAction { ScreenId = reportsScreen.Id, ActionName = "Observation Hours", IsActive = true });
                    screenActions.Add(new ScreenAction { ScreenId = reportsScreen.Id, ActionName = "Inpatient Census", IsActive = true });
                }

                await _context.ScreenActions.AddRangeAsync(screenActions);
                await _context.SaveChangesAsync();
            }
        }
    }
}
