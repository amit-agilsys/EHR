using EHR_Reports.Data;
using EHR_Reports.DTOs.Patiens;
using EHR_Reports.DTOs.Patient;
using EHR_Reports.Interfaces;
using EHR_Reports.Models;
using EHR_Reports.Utilities;
using Microsoft.EntityFrameworkCore;

namespace EHR_Reports.Services
{
    public class PatientService : IPatientService
    {
        private readonly ApplicationDbContext _context;

        public PatientService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DataTableResponse<PatientDto>> GetAllPatients(PatientDataTableRequest request)
        {
            try
            {
                var query = _context.Patients.AsNoTracking()
                                            .Include(p => p.PatientInsurances)
                                                .ThenInclude(pi => pi.FinancialClass)
                                            .Include(p => p.PatientInsurances)
                                                .ThenInclude(pi => pi.PatientInsurance1)
                                            .Include(p => p.PatientInsurances)
                                                .ThenInclude(pi => pi.PatientInsurance2)
                                            .Where(p => !p.IsDeleted);

                if (!string.IsNullOrEmpty(request.Search))
                {
                    var searchText = request.Search.Trim().ToLower();

                    query = query.Where(c =>
                        c.Name.ToLower().Contains(searchText) ||
                        c.MRN.ToLower().Contains(searchText) ||
                        c.PatientInsurances.Any(pi => pi.InsuranceNumber.ToLower().Contains(searchText)));
                }

                if (!string.IsNullOrEmpty(request.Gender))
                {
                    query = query.Where(c => c.Gender == request.Gender);
                }

                if (request.DOB.HasValue)
                {
                    var date = request.DOB.Value;
                    query = query.Where(c => c.DOB == date);
                }

                if (request.FinancialClassId != null && request.FinancialClassId.Any())
                {
                    query = query.Where(p => p.PatientInsurances.Any() &&
                            p.PatientInsurances.All(pi => request.FinancialClassId.Contains(pi.FinancialId)));
                }

                var totalRecords = await _context.Patients.CountAsync();
                var filteredRecords = await query.CountAsync();

                if (!string.IsNullOrEmpty(request.SortColumn))
                {
                    var orderColumn = request.SortColumn;
                    var orderDirection = request.SortDirection;

                    switch (orderColumn)
                    {
                        case "Insurance No":
                            query = orderDirection == "desc"
                                ? query.OrderByDescending(p => p.PatientInsurances
                                    .Select(i => i.InsuranceNumber)
                                    .FirstOrDefault())
                                : query.OrderBy(p => p.PatientInsurances
                                    .Select(i => i.InsuranceNumber)
                                    .FirstOrDefault());
                            break;
                        case "financialName":
                            query = orderDirection == "desc"
                                ? query.OrderByDescending(p => p.PatientInsurances
                                    .Select(i => i.FinancialClass.Name)
                                    .FirstOrDefault())
                                : query.OrderBy(p => p.PatientInsurances
                                    .Select(i => i.FinancialClass.Name)
                                    .FirstOrDefault());
                            break;
                        default:
                            query = orderDirection == "asc"
                                ? query.OrderByDynamic(orderColumn, true)
                                : query.OrderByDynamic(orderColumn, false);
                            break;
                    }
                }
                else
                {
                    query = query.OrderBy(p => p.Name);
                }

                var page = request.Page > 0 ? request.Page : 1;
                var limit = request.Limit > 0 ? request.Limit : 50;

                var patients = await query.Skip((page - 1) * limit).Take(limit).ToListAsync();
                var patientDtos = patients.Select(p => new PatientDto
                {
                    Id = p.Id,
                    MRN = p.MRN,
                    Name = p.Name,
                    DOB = p.DOB,
                    Gender = p.Gender,
                    PatientInsurances = p.PatientInsurances?.Select(pi => new PatientInsuranceDto
                    {
                        Id = pi.Id,
                        InsuranceNumber = pi.InsuranceNumber,
                        FinancialId = pi.FinancialId,
                        FinancialName = pi.FinancialClass?.Name,
                        PatientInsurance1Id = pi.PatientInsurance1Id,
                        PatientInsurance2Id = pi.PatientInsurance2Id,
                        InsuranceName1 = pi.PatientInsurance1?.Name,
                        InsuranceName2 = pi.PatientInsurance2?.Name
                    }).ToList() ?? new List<PatientInsuranceDto>()
                }).ToList();

                return new DataTableResponse<PatientDto>
                {
                    Success = true,
                    Message = "Patients retrieved successfully.",
                    Data = patientDtos,
                    TotalRecords = totalRecords,
                    FilteredRecords = filteredRecords
                };

            }
            catch (Exception ex)
            {
                return new DataTableResponse<PatientDto>
                {
                    Success = false,
                    Message = $"Error retrieving all patients: {ex.Message}",
                    Data = null,
                    TotalRecords = 0,
                    FilteredRecords = 0
                };
            }
        }

        public async Task<ResponseModel<List<PatientListDto>>> SearchPatientByName(string query)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
                {
                    return ResponseModel<List<PatientListDto>>.SuccessResult(new List<PatientListDto>());
                }

                var searchTerm = query.ToLower().Trim();

                var patients = await _context.Patients
                .Where(p => p.Name.ToLower().Contains(searchTerm))
                .OrderBy(p => p.Name)
                .Take(10)
                .Where(p => !p.IsDeleted)
                .Select(p => new PatientListDto
                {
                    Id = p.Id,
                    Name = p.Name
                })
                .ToListAsync();

                return ResponseModel<List<PatientListDto>>.SuccessResult(patients);
            }
            catch (Exception ex)
            {
                return ResponseModel<List<PatientListDto>>.Failure($"An error occurred while searching for patients: {ex.Message}");
            }
        }

        public async Task<ResponseModel<PatientDto>> GetPatientById(int id)
        {
            try
            {
                var patient = await _context.Patients
                    .Include(p => p.PatientInsurances)
                        .ThenInclude(pi => pi.FinancialClass)
                    .Include(p => p.PatientInsurances)
                        .ThenInclude(pi => pi.PatientInsurance1)
                    .Include(p => p.PatientInsurances)
                        .ThenInclude(pi => pi.PatientInsurance2)
                    .FirstOrDefaultAsync(p => p.Id == id);
                if (patient == null)
                {
                    return ResponseModel<PatientDto>.Failure("Patient not found.");
                }
                // Map Entity → DTO
                var patientDto = new PatientDto
                {
                    Id = patient.Id,
                    MRN = patient.MRN,
                    Name = patient.Name,
                    DOB = patient.DOB,
                    Gender = patient.Gender,
                    PatientInsurances = patient.PatientInsurances?.Select(pi => new PatientInsuranceDto
                    {
                        Id = pi.Id,
                        InsuranceNumber = pi.InsuranceNumber,
                        FinancialId = pi.FinancialId,
                        FinancialName = pi.FinancialClass.Name,
                        PatientInsurance1Id = pi.PatientInsurance1Id,
                        InsuranceName1 = pi.PatientInsurance1?.Name,
                        PatientInsurance2Id = pi.PatientInsurance2Id,
                        InsuranceName2 = pi.PatientInsurance2?.Name
                    }).ToList()
                }
                ;
                return ResponseModel<PatientDto>.SuccessResult(patientDto);
            }
            catch (Exception)
            {
                return ResponseModel<PatientDto>.Failure("Error retrieving patient.");
            }
        }

        public async Task<ResponseModel<Patient>> CreatePatient(PatientDto patientDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var existingPatient = await _context.Patients.FirstOrDefaultAsync(p => p.MRN == patientDto.MRN.Trim());
                if (existingPatient != null)
                {
                    return ResponseModel<Patient>.Failure("Patient with the same MRN already exists.");
                }

                var patient = new Patient
                {
                    MRN = patientDto.MRN,
                    Name = patientDto.Name,
                    DOB = patientDto.DOB,
                    Gender = patientDto.Gender.ToUpper(),
                    PatientInsurances = patientDto.PatientInsurances?.Select(pi => new PatientInsurance
                    {
                        InsuranceNumber = pi.InsuranceNumber,
                        FinancialId = pi.FinancialId,
                        PatientInsurance1Id = pi.PatientInsurance1Id,
                        PatientInsurance2Id = pi.PatientInsurance2Id == 0 ? null : pi.PatientInsurance2Id
                    }).ToList()
                };
                var newPatient = _context.Patients.Add(patient);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return ResponseModel<Patient>.SuccessResult(newPatient.Entity, "Patient created successfully.");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return ResponseModel<Patient>.Failure($"Error creating patient: {ex.Message}");
            }
        }

        public async Task<ResponseModel<bool>> UpdatePatient(PatientDto patientDto)
        {
            try
            {
                var existingPatient = await _context.Patients.FirstOrDefaultAsync(p => p.MRN == patientDto.MRN.Trim() && p.Id != patientDto.Id);
                if (existingPatient != null)
                {
                    return ResponseModel<bool>.Failure("Patient with the same MRN already exists.");
                }

                var patient = await _context.Patients.Include(x => x.PatientInsurances).FirstOrDefaultAsync(x => x.Id == patientDto.Id);
                if (patient == null)
                {
                    return ResponseModel<bool>.Failure("Patient not found.");
                }
                patient.MRN = patientDto.MRN;
                patient.Name = patientDto.Name;
                patient.DOB = patientDto.DOB;
                patient.Gender = patientDto.Gender.ToUpper();
                _context.Patients.Update(patient);

                if (patientDto.PatientInsurances.Any())
                {
                    var patientInsurances = _context.PatientInsurances.FindAsync(patientDto.PatientInsurances[0].Id).Result;
                    if (patientInsurances == null)
                    {
                        return ResponseModel<bool>.Failure("Patient Insurance not found.");
                    }

                    foreach (var pi in patientDto.PatientInsurances)
                    {
                        var existingInsurance = patient.PatientInsurances.FirstOrDefault(x => x.Id == pi.Id);
                        if (existingInsurance != null)
                        {
                            existingInsurance.InsuranceNumber = pi.InsuranceNumber;
                            existingInsurance.FinancialId = pi.FinancialId;
                            existingInsurance.PatientInsurance1Id = pi.PatientInsurance1Id;
                            existingInsurance.PatientInsurance2Id = pi.PatientInsurance2Id == 0 ? null : pi.PatientInsurance2Id;
                            _context.PatientInsurances.Update(existingInsurance);
                        }
                        else
                        {
                            // If the insurance doesn't exist, add it
                            var newInsurance = new PatientInsurance
                            {
                                InsuranceNumber = pi.InsuranceNumber,
                                FinancialId = pi.FinancialId,
                                PatientInsurance1Id = pi.PatientInsurance1Id,
                                PatientInsurance2Id = pi.PatientInsurance2Id,
                                PatientId = patient.Id
                            };
                            _context.PatientInsurances.Add(newInsurance);
                        }
                    }
                }
                await _context.SaveChangesAsync();

                return ResponseModel<bool>.SuccessResult(true, "Patient updated successfully.");
            }
            catch (Exception ex)
            {
                return ResponseModel<bool>.Failure($"Error updating patient: {ex.Message}");
            }
        }

        public async Task<ResponseModel<bool>> DeletePatient(int id)
        {
            try
            {
                var patient = await _context.Patients.FindAsync(id);
                if (patient == null)
                {
                    return ResponseModel<bool>.Failure("Patient not found.");
                }
                patient.IsDeleted = true;
                await _context.SaveChangesAsync();
                return ResponseModel<bool>.SuccessResult(true, "Patient deleted successfully.");
            }
            catch (Exception)
            {
                return ResponseModel<bool>.Failure("Error deleting patient.");
            }
        }

        public async Task<DataTableResponse<PatientEncounterDto>> GetAllEncounter(EncounterDataTableRequest request)
        {
            try
            {
                var query = _context.PatientEncounters
                             .Include(x => x.Doctor)
                             .Include(x => x.Patient)
                             .Include(pe => pe.PatientTypeSegments)
                             .Include(x => x.PatientType)
                             .Include(x => x.RoomType)
                             .AsNoTracking()
                             .AsSplitQuery();

                if (!string.IsNullOrEmpty(request.Search))
                {
                    var searchText = request.Search.Trim().ToLower();

                    query = query.Where(c =>
                            c.Id.ToString().Contains(searchText)
                    );
                }

                if (request.PatientId != null && request.PatientId.Any())
                {
                    query = query.Where(c => request.PatientId.Contains(c.PatientId));
                }

                if (request.DoctorId != null && request.DoctorId.Any())
                {
                    query = query.Where(c => request.DoctorId.Contains(c.DoctorId));
                }

                if (request.PatientTypeId != null && request.PatientTypeId.Any())
                {
                    query = query.Where(c => request.PatientTypeId.Contains(c.PatientTypeId));
                }

                if (request.RoomTypeId != null && request.RoomTypeId.Any())
                {
                    query = query.Where(c => request.RoomTypeId.Contains(c.RoomTypeId));
                }

                if (request.AdmitDate.HasValue)
                {
                    var date = request.AdmitDate.Value.Date;
                    query = query.Where(c => c.AdmitDate.Date == date);
                }

                if (request.DischargeDate.HasValue)
                {
                    var date = request.DischargeDate.Value.Date;
                    query = query.Where(c => c.DischargeDate.HasValue && c.DischargeDate.Value.Date == date);
                }

                var totalRecords = await _context.PatientEncounters.CountAsync();
                var filteredRecords = await query.CountAsync();

                var result = query.Select(pe => new
                {
                    pe.Id,
                    pe.AdmitDate,
                    pe.AdmitTime,
                    pe.DischargeDate,
                    pe.DischargeTime,
                    pe.DoctorId,
                    DoctorName = pe.Doctor.Name,
                    pe.PatientId,
                    PatientName = pe.Patient.Name,
                    pe.PatientTypeId,
                    PatientTypeName = pe.PatientType.Name,
                    pe.AdmitNumber,
                    pe.RoomTypeId,
                    RoomTypeName = pe.RoomType.Name,
                    PatientTypeSegments = pe.PatientTypeSegments.Select(pts => new PatientTypeSegmentDto
                    {
                        Id = pts.Id,
                        PatientTypeId = pts.PatientTypeId,
                        TransferInDate = pts.TransferInDate,
                        TransferInTime = pts.TransferInTime,
                    }).ToList(),
                }).ToList()
                  .Select(x => new PatientEncounterDto
                  {
                      Id = x.Id,
                      AdmitDate = x.AdmitDate,
                      AdmitTime = x.AdmitTime,
                      DischargeDate = x.DischargeDate,
                      DischargeTime = x.DischargeTime,
                      DoctorId = x.DoctorId,
                      DoctorName = x.DoctorName,
                      PatientId = x.PatientId,
                      PatientName = x.PatientName,
                      PatientTypeId = x.PatientTypeId,
                      PatientTypeName = x.PatientTypeName,
                      AdmitNumber = x.AdmitNumber,
                      RoomTypeId = x.RoomTypeId,
                      RoomTypeName = x.RoomTypeName,
                      PatientTypeSegments = x.PatientTypeSegments,
                  });

                var encounters = result.ToList();

                if (!string.IsNullOrEmpty(request.SortColumn))
                {
                    var orderColumn = request.SortColumn;
                    var orderDirection = request.SortDirection;

                    switch (orderColumn)
                    {
                        case "id":
                            encounters = orderDirection == "desc"
                                ? encounters.OrderByDescending(dto => dto.Id).ToList()
                                : encounters.OrderBy(dto => dto.Id).ToList();
                            break;
                        case "patientName":
                            encounters = orderDirection == "desc"
                                ? encounters.OrderByDescending(dto => dto.PatientName).ToList()
                                : encounters.OrderBy(dto => dto.PatientName).ToList();
                            break;
                        case "doctorName":
                            encounters = orderDirection == "desc"
                                ? encounters.OrderByDescending(dto => dto.DoctorName).ToList()
                                : encounters.OrderBy(dto => dto.DoctorName).ToList();
                            break;
                        case "admitDate":
                            encounters = orderDirection == "desc"
                                ? encounters.OrderByDescending(dto => dto.AdmitDate).ToList()
                                : encounters.OrderBy(dto => dto.AdmitDate).ToList();
                            break;
                        //case "dischargeDate":
                        //    encounters = orderDirection == "desc"
                        //        ? encounters.OrderByDescending(dto => dto.DischargeDate).ToList()
                        //        : encounters.OrderBy(dto => dto.DischargeDate).ToList();
                        //    break;
                        case "dischargeDate":
                            encounters = orderDirection == "desc"
                                ? encounters.OrderByDescending(dto => dto.DischargeDate ?? DateTime.MinValue).ToList()
                                : encounters.OrderBy(dto => dto.DischargeDate ?? DateTime.MaxValue).ToList();
                            break;
                        case "patientTypeId":
                            encounters = orderDirection == "desc"
                                ? encounters.OrderByDescending(dto => dto.PatientTypeName).ToList()
                                : encounters.OrderBy(dto => dto.PatientTypeName).ToList();
                            break;
                        case "roomTypeId":
                            encounters = orderDirection == "desc"
                                ? encounters.OrderByDescending(dto => dto.RoomTypeName).ToList()
                                : encounters.OrderBy(dto => dto.RoomTypeName).ToList();
                            break;
                        case "admitNumber":
                            encounters = orderDirection == "desc"
                                ? encounters.OrderByDescending(dto => dto.AdmitNumber).ToList()
                                : encounters.OrderBy(dto => dto.AdmitNumber).ToList();
                            break;
                        default:
                            encounters = orderDirection == "desc"
                                ? encounters.OrderByDescending(dto => dto.Id).ToList()
                                : encounters.OrderBy(dto => dto.Id).ToList();
                            break;
                    }
                }
                else
                {
                    encounters = encounters.OrderByDescending(dto => dto.Id).ToList();
                }

                if (request.Limit > 0)
                {
                    encounters = encounters
                        .Skip((request.Page - 1) * request.Limit)
                        .Take(request.Limit)
                        .ToList();
                }

                return new DataTableResponse<PatientEncounterDto>
                {
                    Success = true,
                    Data = encounters,
                    TotalRecords = totalRecords,
                    FilteredRecords = filteredRecords
                };
            }
            catch (Exception ex)
            {
                return new DataTableResponse<PatientEncounterDto>
                {
                    Success = false,
                    Message = $"Error retrieving encounters: {ex.Message}",
                    Data = null,
                    TotalRecords = 0,
                    FilteredRecords = 0
                };
            }
        }

        public async Task<DataTableResponse<PatientEncounterDto>> GetEncountersByPatientId(EncounterDataTableRequest request, int patientId)
        {
            try
            {
                var query = _context.PatientEncounters.AsNoTracking().AsSplitQuery()
                            .Include(pe => pe.PatientTypeSegments)
                            .Where(pe => pe.PatientId == patientId);

                if (!string.IsNullOrEmpty(request.Search))
                {
                    var searchText = request.Search.Trim().ToLower();

                    query = query.Where(c =>
                            c.Id.ToString().Contains(searchText)
                    );
                }

                if (request.DoctorId != null && request.DoctorId.Any())
                {
                    query = query.Where(c => request.DoctorId.Contains(c.DoctorId));
                }

                if (request.PatientTypeId != null && request.PatientTypeId.Any())
                {
                    query = query.Where(c => request.PatientTypeId.Contains(c.PatientTypeId));
                }

                if (request.RoomTypeId != null && request.RoomTypeId.Any())
                {
                    query = query.Where(c => request.RoomTypeId.Contains(c.RoomTypeId));
                }

                if (request.AdmitDate.HasValue)
                {
                    var date = request.AdmitDate.Value.Date;
                    query = query.Where(c => c.AdmitDate.Date == date);
                }

                if (request.DischargeDate.HasValue)
                {
                    var date = request.DischargeDate.Value.Date;
                    query = query.Where(c => c.DischargeDate.HasValue && c.DischargeDate.Value.Date == date);
                }

                var totalRecords = await _context.PatientEncounters.CountAsync();
                var filteredRecords = await query.CountAsync();

                var projectedQuery = query.Select(pe => new PatientEncounterDto
                {
                    Id = pe.Id,
                    AdmitDate = pe.AdmitDate,
                    AdmitTime = pe.AdmitTime,
                    DischargeDate = pe.DischargeDate,
                    DischargeTime = pe.DischargeTime,
                    DoctorId = pe.DoctorId,
                    DoctorName = pe.Doctor.Name,
                    PatientTypeId = pe.PatientTypeId,
                    PatientTypeName = pe.PatientType.Name,
                    AdmitNumber = pe.AdmitNumber,
                    RoomTypeId = pe.RoomTypeId,
                    RoomTypeName = pe.RoomType.Name,
                    PatientTypeSegments = pe.PatientTypeSegments.Select(pts => new PatientTypeSegmentDto
                    {
                        Id = pts.Id,
                        PatientTypeId = pts.PatientTypeId,
                        TransferInDate = pts.TransferInDate,
                        TransferInTime = pts.TransferInTime,
                    }).ToList(),
                });

                if (!string.IsNullOrEmpty(request.SortColumn))
                {
                    var orderColumn = request.SortColumn;
                    var orderDirection = request.SortDirection;

                    switch (orderColumn)
                    {
                        case "id":
                            projectedQuery = orderDirection == "desc" 
                                ? projectedQuery.OrderByDescending(p => p.Id) 
                                : projectedQuery.OrderBy(p => p.Id); 
                        break;

                        case "admitDate":
                            projectedQuery = orderDirection == "desc"
                                ? projectedQuery.OrderByDescending(p => p.AdmitDate)
                                : projectedQuery.OrderBy(p => p.AdmitDate);
                            break;
                        case "dischargeDate":
                            projectedQuery = orderDirection == "desc"
                                ? projectedQuery.OrderByDescending(p => p.DischargeDate)
                                : projectedQuery.OrderBy(p => p.DischargeDate);
                            break;
                        case "doctorId":
                            projectedQuery = orderDirection == "desc"
                                ? projectedQuery.OrderByDescending(p => p.DoctorName) 
                                : projectedQuery.OrderBy(p => p.DoctorName);
                            break;
                        case "patientTypeId":
                            projectedQuery = orderDirection == "desc"
                                ? projectedQuery.OrderByDescending(p => p.PatientTypeName)
                                : projectedQuery.OrderBy(p => p.PatientTypeName);
                            break;
                        case "roomTypeId":
                            projectedQuery = orderDirection == "desc"
                                ? projectedQuery.OrderByDescending(p => p.RoomTypeName)
                                : projectedQuery.OrderBy(p => p.RoomTypeName);
                            break;
                        default:
                            projectedQuery = orderDirection == "desc"
                                 ? projectedQuery.OrderByDescending(p => p.AdmitDate)
                                 : projectedQuery.OrderBy(p => p.AdmitDate);
                            break;
                    }
                }
                else
                {
                    projectedQuery = projectedQuery.OrderBy(dto => dto.AdmitDate);
                }

                var encounters = await projectedQuery
                    .Skip((request.Page - 1) * request.Limit)
                    .Take(request.Limit)
                    .ToListAsync();

                return new DataTableResponse<PatientEncounterDto>
                {
                    Success = true,
                    Data = encounters,
                    TotalRecords = totalRecords,
                    FilteredRecords = filteredRecords
                };
            }
            catch (Exception ex)
            {
                return new DataTableResponse<PatientEncounterDto>
                {
                    Success = false,
                    Message = $"Error retrieving encounters: {ex.Message}",
                    Data = null,
                    TotalRecords = 0,
                    FilteredRecords = 0
                };
            }
        }

        public async Task<ResponseModel<bool>> AddPatientEncounter(PatientEncounter patientEncounterDto)
        {
            try
            {
                using var transaction = await _context.Database.BeginTransactionAsync();

                var patient = await _context.Patients.FindAsync(patientEncounterDto.PatientId);
                if (patient == null)
                {
                    return ResponseModel<bool>.Failure("Patient not found. Invalid patient id.");
                }

                if (patient.DOB > DateOnly.FromDateTime(patientEncounterDto.AdmitDate))
                {
                    return ResponseModel<bool>.Failure("Admit date cannot be before patient's date of birth.");
                }

                // Add the encounter first
                _context.PatientEncounters.Add(patientEncounterDto);
                await _context.SaveChangesAsync();

                // Then add the initial segment
                var initialSegment = new PatientTypeSegment
                {
                    PatientEncounterId = patientEncounterDto.Id,
                    PatientTypeId = patientEncounterDto.PatientTypeId,
                    TransferInDate = patientEncounterDto.AdmitDate,
                    TransferInTime = patientEncounterDto.AdmitTime,
                    TransferOutDate = null, 
                    TransferOutTime = null
                };
                _context.PatientTypeSegments.Add(initialSegment);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return ResponseModel<bool>.SuccessResult(true, "Patient encounter added successfully.");
            }
            catch (Exception ex)
            {
                return ResponseModel<bool>.Failure($"Error adding patient encounter: {ex.Message}");
            }
        }

        public async Task<ResponseModel<bool>> UpdatePatientEncounter(PatientEncounterDto encounterDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var patient = await _context.Patients.FindAsync(encounterDto.PatientId);
                if (patient == null)
                {
                    return ResponseModel<bool>.Failure("Patient not found. Invalid patient id.");
                }

                if (patient.DOB > DateOnly.FromDateTime(encounterDto.AdmitDate))
                {
                    return ResponseModel<bool>.Failure("Admit date cannot be before patient's date of birth.");
                }

                var encounter = await _context.PatientEncounters.Include(pe => pe.PatientTypeSegments)
                                    .FirstOrDefaultAsync(pe => pe.Id == encounterDto.Id);
                if (encounter == null)
                {
                    return ResponseModel<bool>.Failure("Patient encounter not found.");
                }

                encounter.AdmitDate = encounterDto.AdmitDate;
                encounter.AdmitTime = encounterDto.AdmitTime;
                encounter.DischargeDate = encounterDto.DischargeDate;
                encounter.DischargeTime = encounterDto.DischargeTime;
                encounter.DoctorId = encounterDto.DoctorId;
                encounter.PatientId = encounterDto.PatientId;
                encounter.AdmitNumber = encounterDto.AdmitNumber;
                encounter.PatientTypeId = encounterDto.PatientTypeId;
                encounter.RoomTypeId = encounterDto.RoomTypeId;

                _context.PatientEncounters.Update(encounter);

                if (encounterDto.PatientTypeSegments != null)
                {
                    if (encounterDto.PatientTypeSegments.Any())
                    {
                        var incomingSegmentIds = encounterDto.PatientTypeSegments
                            .Where(s => s.Id > 0)
                            .Select(s => s.Id)
                            .ToList();

                        var segmentsToRemove = encounter.PatientTypeSegments
                            .Where(s => !incomingSegmentIds.Contains(s.Id))
                            .ToList();

                        foreach (var segment in segmentsToRemove)
                        {
                            _context.PatientTypeSegments.Remove(segment);
                        }

                        foreach (var segmentDto in encounterDto.PatientTypeSegments.Where(s => s.Id > 0))
                        {
                            var existingSegment = encounter.PatientTypeSegments
                                .FirstOrDefault(s => s.Id == segmentDto.Id);

                            if (existingSegment != null)
                            {
                                existingSegment.PatientTypeId = segmentDto.PatientTypeId;
                                existingSegment.TransferInDate = segmentDto.TransferInDate;
                                existingSegment.TransferInTime = segmentDto.TransferInTime;
                            }
                        }

                        var newSegments = new List<PatientTypeSegment>();
                        foreach (var segmentDto in encounterDto.PatientTypeSegments.Where(s => s.Id == 0))
                        {
                            var newSegment = new PatientTypeSegment
                            {
                                PatientEncounterId = encounter.Id,
                                PatientTypeId = segmentDto.PatientTypeId,
                                TransferInDate = segmentDto.TransferInDate,
                                TransferInTime = segmentDto.TransferInTime
                            };
                            newSegments.Add(newSegment);
                            _context.PatientTypeSegments.Add(newSegment);
                        }

                        await _context.SaveChangesAsync();

                        var allCurrentSegments = encounter.PatientTypeSegments.ToList();

                        for (int i = 0; i < encounterDto.PatientTypeSegments.Count - 1; i++)
                        {
                            var currentSegmentDto = encounterDto.PatientTypeSegments[i];
                            var nextSegmentDto = encounterDto.PatientTypeSegments[i + 1];

                            PatientTypeSegment currentSegment = null;

                            if (currentSegmentDto.Id > 0)
                            {
                                currentSegment = allCurrentSegments.FirstOrDefault(s => s.Id == currentSegmentDto.Id);
                            }
                            else
                            {
                                var newSegmentIndex = encounterDto.PatientTypeSegments
                                    .Take(i + 1)
                                    .Count(s => s.Id == 0) - 1;
                                currentSegment = newSegments.ElementAtOrDefault(newSegmentIndex);
                            }

                            if (currentSegment != null)
                            {
                                currentSegment.TransferOutDate = nextSegmentDto.TransferInDate;
                                currentSegment.TransferOutTime = nextSegmentDto.TransferInTime;
                            }
                        }

                        //if (encounterDto.PatientTypeSegments.Count == 1)
                        //{
                        //    var incomingSegment = encounterDto.PatientTypeSegments[0];

                        //    var previousSegment = allCurrentSegments
                        //        .Where(s => s.Id != incomingSegment.Id)
                        //        .OrderByDescending(s => s.TransferInDate)
                        //        .ThenByDescending(s => s.TransferInTime)
                        //        .FirstOrDefault();

                        //    if (previousSegment != null)
                        //    {
                        //        previousSegment.TransferOutDate = incomingSegment.TransferInDate;
                        //        previousSegment.TransferOutTime = incomingSegment.TransferInTime;
                        //    }
                        //}
                    }
                    else
                    {
                        foreach (var segment in encounter.PatientTypeSegments.ToList())
                        {
                            _context.PatientTypeSegments.Remove(segment);
                        }
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return ResponseModel<bool>.SuccessResult(true, "Patient encounter updated successfully.");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return ResponseModel<bool>.Failure($"Error updating patient encounter: {ex.Message}");
            }
        }

        public async Task<ResponseModel<bool>> DeletePatientEncounter(int id)
        {
            try
            {
                var patientEncounter = await _context.PatientEncounters.FindAsync(id);
                if (patientEncounter == null)
                {
                    return ResponseModel<bool>.Failure("Patient encounter not found.");
                }
                _context.PatientEncounters.Remove(patientEncounter);
                await _context.SaveChangesAsync();
                return ResponseModel<bool>.SuccessResult(true, "Patient encounter deleted successfully.");
            }
            catch (Exception)
            {
                return ResponseModel<bool>.Failure("Error deleting patient encounter.");
            }
        }
    }
}
