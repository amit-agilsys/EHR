using EHR_Reports.Data;
using EHR_Reports.Interfaces;
using EHR_Reports.Models;
using EHR_Reports.Utilities;
using Microsoft.EntityFrameworkCore;

namespace EHR_Reports.Services
{
    public class DoctorService : IDoctorService
    {
        private readonly ApplicationDbContext _context;
        public DoctorService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DataTableResponse<Doctor>> GetAllDoctors(DataTableRequest request)
        {
            try
            {
                var query = _context.Doctors.AsNoTracking().AsSplitQuery().Where(d => !d.IsDeleted);

                if (!string.IsNullOrEmpty(request.Search))
                {
                    var searchText = request.Search.Trim().ToLower();

                    query = query.Where(c =>
                        c.Name.ToLower().Contains(searchText) ||
                        c.Email.ToLower().Contains(searchText) ||
                        c.Phone.ToLower().Contains(searchText)
                    );
                }

                var totalRecords = await _context.Doctors.CountAsync();
                var filteredRecords = await query.CountAsync();

                if (!string.IsNullOrEmpty(request.SortColumn))
                {
                    var orderColumn = request.SortColumn;
                    var orderDirection = request.SortDirection;

                    query = orderDirection == "asc"
                        ? query.OrderByDynamic(orderColumn, true)
                        : query.OrderByDynamic(orderColumn, false);
                }
                else
                {
                    query=query.OrderByDynamic("Name", true);
                }

                    var page = request.Page > 0 ? request.Page : 1;
                    var limit = request.Limit > 0 ? request.Limit : totalRecords;

                var doctors = await query
                    .Skip((page - 1) * limit)
                    .Take(limit)
                    .Select(d => new Doctor
                    {
                        Id = d.Id,
                        Name = d.Name,
                        Email = d.Email,
                        Phone = d.Phone
                    })
                    .ToListAsync();

                return new DataTableResponse<Doctor>
                {
                    Success = true,
                    Message = "Doctors retrieved successfully.",
                    Data = doctors,
                    TotalRecords = totalRecords,
                    FilteredRecords = filteredRecords
                };
            }
            catch (Exception ex)
            {
                return new DataTableResponse<Doctor>
                {
                    Success = false,
                    Message = $"Error retrieving doctors: {ex.Message}",
                    Data = null,
                    TotalRecords = 0,
                    FilteredRecords = 0
                };
            }
        }

        public async Task<ResponseModel<List<DoctorListDto>>> SearchDoctorByName(string query)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
                {
                    return ResponseModel<List<DoctorListDto>>.SuccessResult(new List<DoctorListDto>());
                }

                var searchTerm = query.ToLower().Trim();

                var doctors = await _context.Doctors
                .Where(p => p.Name.ToLower().Contains(searchTerm) & !p.IsDeleted)
                .Take(10)
                .Select(p => new DoctorListDto
                {
                    Id = p.Id,
                    Name = p.Name
                })
                .ToListAsync();

                return ResponseModel<List<DoctorListDto>>.SuccessResult(doctors);
            }
            catch (Exception ex)
            {
                return ResponseModel<List<DoctorListDto>>.Failure($"An error occurred while searching for doctors: {ex.Message}");
            }
        }
        public async Task<ResponseModel<Doctor>> GetDoctorById(int id)
        {
            try
            {
                var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.Id == id);
                if (doctor == null)
                {
                    return ResponseModel<Doctor>.Failure("Doctor not found.");
                }
                return ResponseModel<Doctor>.SuccessResult(doctor, "Doctor retrieved successfully.");
            }
            catch (Exception ex)
            {
                return ResponseModel<Doctor>.Failure($"Error retrieving doctor: {ex.Message}");
            }
        }

        public async Task<ResponseModel<Doctor>> AddDoctor(Doctor doctor)
        {
            try
            {
                var existingEmail = await _context.Doctors.FirstOrDefaultAsync(d => d.Email == doctor.Email && !d.IsDeleted);
                if (existingEmail != null)
                {
                    return ResponseModel<Doctor>.Failure("A doctor with the same email already exists.");
                }

                var existingPhone = await _context.Doctors.FirstOrDefaultAsync(d => d.Phone == doctor.Phone && !d.IsDeleted);
                if (existingPhone != null)
                {
                    return ResponseModel<Doctor>.Failure("A doctor with the same phone number already exists.");
                }

                _context.Doctors.Add(doctor);
                await _context.SaveChangesAsync();
                return ResponseModel<Doctor>.SuccessResult(doctor, "Doctor added successfully.");
            }
            catch (Exception ex)
            {
                return ResponseModel<Doctor>.Failure($"Error adding doctor: {ex.Message}");
            }
        }

        public async Task<ResponseModel<Doctor>> UpdateDoctor(Doctor doctor)
        {
            try
            {
                var existingDoctor = await _context.Doctors.FirstOrDefaultAsync(d => d.Id == doctor.Id && !d.IsDeleted);
                if (existingDoctor == null)
                    return ResponseModel<Doctor>.Failure("Doctor not found.");

                var existingEmail = await _context.Doctors.FirstOrDefaultAsync(d => d.Email == doctor.Email && !d.IsDeleted && d.Id != doctor.Id);
                if (existingEmail != null)
                    return ResponseModel<Doctor>.Failure("A doctor with the same email already exists.");


                var existingPhone = await _context.Doctors.FirstOrDefaultAsync(d => d.Phone == doctor.Phone && !d.IsDeleted && d.Id != doctor.Id);
                if (existingPhone != null)
                    return ResponseModel<Doctor>.Failure("A doctor with the same phone number already exists.");

                existingDoctor.Name = doctor.Name;
                existingDoctor.Email = doctor.Email;
                existingDoctor.Phone = doctor.Phone;
                await _context.SaveChangesAsync();
                return ResponseModel<Doctor>.SuccessResult(doctor, "Doctor updated successfully.");
            }
            catch (Exception ex)
            {
                return ResponseModel<Doctor>.Failure($"Error updating doctor: {ex.Message}");
            }
        }

        public async Task<ResponseModel<bool>> DeleteDoctor(int id)
        {
            try
            {
                var doctor = await _context.Doctors.FindAsync(id);
                if (doctor == null)
                {
                    return ResponseModel<bool>.Failure("Doctor not found.");
                }
                doctor.IsDeleted = true;
                _context.Doctors.Update(doctor);
                await _context.SaveChangesAsync();
                return ResponseModel<bool>.SuccessResult(true, "Doctor deleted successfully.");
            }
            catch (Exception ex)
            {
                return ResponseModel<bool>.Failure($"Error deleting doctor: {ex.Message}");
            }
        }

    }
}
