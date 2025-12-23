using EHR_Reports.Data;
using EHR_Reports.DTOs.Report;
using EHR_Reports.Interfaces;
using EHR_Reports.Models;
using EHR_Reports.Utilities;
using Microsoft.EntityFrameworkCore;
using static EHR_Reports.DTOs.Report.PdfReport;

namespace EHR_Reports.Services
{
    public class ReportsService : IReportsService
    {
        private readonly ApplicationDbContext _context;
        public ReportsService(ApplicationDbContext context)
        {
            _context = context;
        }


        #region Reports

        public async Task<DataTableResponse<DailyCensusDTO>> GetDailyCensusReport(DailyCensusRequest request)
        {
            try
            {
                var reportDate = request.StartDate?.Date ?? DateTime.Today;

                var query = _context.PatientEncounters
                                    .AsNoTracking()
                                    .AsSplitQuery()
                                    .Include(pe => pe.Patient)
                                    .ThenInclude(p => p.PatientInsurances)
                                    .ThenInclude(pi => pi.FinancialClass)
                                    .Include(pe => pe.Doctor)
                                    .Where(pe => !pe.Patient.IsDeleted)
                                    .Where(pe => pe.AdmitDate.Date <= reportDate &&
                                               (pe.DischargeDate == null || pe.DischargeDate.Value.Date > reportDate))
                                    .AsQueryable();

                if (!string.IsNullOrEmpty(request.Search))
                {
                    query = query.Where(pe =>
                        pe.Patient.MRN.Contains(request.Search)
                    );
                }

                // Additional filters if provided
                if (request.PatientId != null && request.PatientId.Any())
                {
                    query = query.Where(c => request.PatientId.Contains(c.PatientId));
                }

                if (request.DoctorId != null && request.DoctorId.Any())
                {
                    query = query.Where(c => request.DoctorId.Contains(c.DoctorId));
                }

                if (request.FinancialClassId != null && request.FinancialClassId.Any())
                {
                    query = query.Where(c => request.FinancialClassId.Contains(c.Patient.PatientInsurances.FirstOrDefault().FinancialId));
                }

                //if (request.AdmitDate.HasValue)
                //{
                //    var date = request.AdmitDate.Value.Date;
                //    query = query.Where(c => c.AdmitDate.Date == date);
                //}

                if (request.DOB.HasValue)
                {
                    var date = request.DOB.Value;
                    query = query.Where(c => c.Patient.DOB == date);
                }

                var totalRecords = await _context.PatientEncounters.CountAsync();
                var filteredRecords = await query.CountAsync();

                var result = query.Select(pe => new DailyCensusDTO
                {
                    MRN = pe.Patient.MRN,
                    PatientName = pe.Patient.Name,
                    PatientId = pe.Patient.Id,
                    DoctorName = pe.Doctor.Name,
                    DoctorId = pe.Doctor.Id,
                    AdmitDate = pe.AdmitDate,
                    DischargeDate = pe.DischargeDate,
                    DOB = pe.Patient.DOB,
                    Age = Utils.CalculateAge(pe.Patient.DOB),
                    FinancialClass = pe.Patient.PatientInsurances
                .Select(pi => pi.FinancialClass.Name)
                .FirstOrDefault(),
                    FinancialClassId = pe.Patient.PatientInsurances
                .Select(pi => pi.FinancialId)
                .FirstOrDefault()
                });

                if (!string.IsNullOrEmpty(request.SortColumn))
                {
                    var orderColumn = request.SortColumn;
                    var orderDirection = request.SortDirection;

                    result = orderDirection == "asc"
                        ? result.OrderByDynamic(orderColumn, true)
                        : result.OrderByDynamic(orderColumn, false);
                }
                var dailyCensus = await result.ToListAsync();
                if (request.Limit > 0)
                {
                    dailyCensus = await result
                    .Skip((request.Page - 1) * request.Limit)
                    .Take(request.Limit)
                    .ToListAsync();
                }

                return new DataTableResponse<DailyCensusDTO>
                {
                    Success = true,
                    Data = dailyCensus,
                    TotalRecords = totalRecords,
                    FilteredRecords = filteredRecords
                };
            }
            catch (Exception ex)
            {
                return new DataTableResponse<DailyCensusDTO>
                {
                    Success = false,
                    Message = $"Error retrieving encounters: {ex.Message}",
                    Data = null,
                    TotalRecords = 0,
                    FilteredRecords = 0
                };
            }
        }

        public async Task<DataTableResponse<AdmissionsDTO>> GetAdmissionsReport(AdmissionsRequest request)
        {
            try
            {
                var startDate = request.AdmitStartDate?.Date ?? DateTime.Today.AddDays(-30);
                var endDate = request.AdmitEndDate?.Date ?? DateTime.Today;

                var query = _context.PatientEncounters
                                    .AsNoTracking()
                                    .AsSplitQuery()
                                    .Include(pe => pe.PatientType)
                                    .Include(pe => pe.Patient)
                                    .ThenInclude(p => p.PatientInsurances)
                                    .ThenInclude(pi => pi.FinancialClass)
                                    .Include(pe => pe.Doctor)
                                    .Where(pe => !pe.Patient.IsDeleted)
                                    .Where(pe => pe.AdmitDate.Date >= startDate && pe.AdmitDate <= endDate);

                if (!string.IsNullOrEmpty(request.Search))
                {
                    query = query.Where(pe =>
                        pe.Patient.MRN.Contains(request.Search)
                    );
                }

                // Additional filters if provided
                if (request.PatientId != null && request.PatientId.Any())
                {
                    query = query.Where(c => request.PatientId.Contains(c.PatientId));
                }

                if (request.DoctorId != null && request.DoctorId.Any())
                {
                    query = query.Where(c => request.DoctorId.Contains(c.DoctorId));
                }

                if (request.FinancialClassId != null && request.FinancialClassId.Any())
                {
                    query = query.Where(pe => pe.Patient.PatientInsurances.All(pi => request.FinancialClassId.Contains(pi.FinancialId))
                            && pe.Patient.PatientInsurances.Any(pi => request.FinancialClassId.Contains(pi.FinancialId))
                    );
                }

                if (request.PatientTypeId != null && request.PatientTypeId.Any())
                {
                    query = query.Where(pe => request.PatientTypeId.Contains(pe.PatientTypeId));
                }

                if (request.DOB.HasValue)
                {
                    var date = request.DOB.Value;
                    query = query.Where(c => c.Patient.DOB == date);
                }

                if (request.AdmitDate.HasValue)
                {
                    var date = request.AdmitDate.Value.Date;
                    query = query.Where(c => c.AdmitDate.Date == date);
                }

                var totalRecords = await _context.PatientEncounters.CountAsync();
                var filteredRecords = await query.CountAsync();

                var result = query.Select(pe => new AdmissionsDTO
                {
                    MRN = pe.Patient.MRN,
                    PatientName = pe.Patient.Name,
                    PatientId = pe.Patient.Id,
                    DoctorName = pe.Doctor.Name,
                    DoctorId = pe.Doctor.Id,
                    AdmitDate = pe.AdmitDate,
                    PatientType = pe.PatientType.Name,
                    PatientTypeId = pe.PatientTypeId,
                    DOB = pe.Patient.DOB,
                    Age = Utils.CalculateAge(pe.Patient.DOB),
                    FinancialClass = pe.Patient.PatientInsurances
                .Select(pi => pi.FinancialClass.Name)
                .FirstOrDefault(),
                    FinancialClassId = pe.Patient.PatientInsurances
                .Select(pi => pi.FinancialId)
                .FirstOrDefault()
                });

                if (!string.IsNullOrEmpty(request.SortColumn))
                {
                    var orderColumn = request.SortColumn;
                    var orderDirection = request.SortDirection;

                    result = orderDirection == "asc"
                        ? result.OrderByDynamic(orderColumn, true)
                        : result.OrderByDynamic(orderColumn, false);
                }
                var admissions = await result.ToListAsync();
                if (request.Limit > 0)
                {
                    admissions = await result
                    .Skip((request.Page - 1) * request.Limit)
                    .Take(request.Limit)
                    .ToListAsync();
                }

                return new DataTableResponse<AdmissionsDTO>
                {
                    Success = true,
                    Data = admissions,
                    TotalRecords = totalRecords,
                    FilteredRecords = filteredRecords
                };
            }
            catch (Exception)
            {
                return new DataTableResponse<AdmissionsDTO>
                {
                    Success = false,
                    Message = "Error retrieving admissions",
                    Data = null,
                    TotalRecords = 0,
                    FilteredRecords = 0
                };
            }
        }

        public async Task<DataTableResponse<DischargesDto>> GetDischargesReport(DischargesRequest request)
        {
            try
            {
                var startDate = request.DischargeStartDate?.Date ?? DateTime.Today.AddDays(-30);
                var endDate = request.DischargeEndDate?.Date ?? DateTime.Today;

                var query = _context.PatientEncounters
                                    .AsNoTracking()
                                    .AsSplitQuery()
                                    .Include(pe => pe.PatientType)
                                    .Include(pe => pe.Patient)
                                    .ThenInclude(p => p.PatientInsurances)
                                    .ThenInclude(pi => pi.FinancialClass)
                                    .Include(pe => pe.Doctor)
                                    .Where(pe => !pe.Patient.IsDeleted)
                                    .Where(pe => pe.DischargeDate >= startDate && pe.DischargeDate <= endDate);

                if (!string.IsNullOrEmpty(request.Search))
                {
                    query = query.Where(pe =>
                        pe.Patient.MRN.Contains(request.Search)
                    );
                }

                // Additional filters if provided
                if (request.PatientId != null && request.PatientId.Any())
                {
                    query = query.Where(c => request.PatientId.Contains(c.PatientId));
                }

                if (request.DoctorId != null && request.DoctorId.Any())
                {
                    query = query.Where(c => request.DoctorId.Contains(c.DoctorId));
                }

                if (request.FinancialClassId != null && request.FinancialClassId.Any())
                {
                    query = query.Where(pe => pe.Patient.PatientInsurances.All(pi => request.FinancialClassId.Contains(pi.FinancialId))
                           && pe.Patient.PatientInsurances.Any(pi => request.FinancialClassId.Contains(pi.FinancialId))
                   );
                }

                if (request.PatientTypeId != null && request.PatientTypeId.Any())
                {
                    query = query.Where(pe => request.PatientTypeId.Contains(pe.PatientTypeId));
                }

                if (request.DOB.HasValue)
                {
                    var date = request.DOB.Value;
                    query = query.Where(c => c.Patient.DOB == date);
                }

                if (request.DischargeDate.HasValue)
                {
                    var date = request.DischargeDate.Value.Date;
                    query = query.Where(c => c.DischargeDate == date);
                }

                var totalRecords = await _context.PatientEncounters.CountAsync();
                var filteredRecords = await query.CountAsync();

                var result = query.Select(pe => new DischargesDto
                {
                    MRN = pe.Patient.MRN,
                    PatientName = pe.Patient.Name,
                    PatientId = pe.Patient.Id,
                    DoctorName = pe.Doctor.Name,
                    DoctorId = pe.Doctor.Id,
                    DischargeDate = pe.DischargeDate.Value,
                    PatientType = pe.PatientType.Name,
                    PatientTypeId = pe.PatientTypeId,
                    DOB = pe.Patient.DOB,
                    Age = Utils.CalculateAge(pe.Patient.DOB),
                    FinancialClass = pe.Patient.PatientInsurances
                .Select(pi => pi.FinancialClass.Name)
                .FirstOrDefault(),
                    FinancialClassId = pe.Patient.PatientInsurances
                .Select(pi => pi.FinancialId)
                .FirstOrDefault()
                });

                if (!string.IsNullOrEmpty(request.SortColumn))
                {
                    var orderColumn = request.SortColumn;
                    var orderDirection = request.SortDirection;

                    result = orderDirection == "asc"
                        ? result.OrderByDynamic(orderColumn, true)
                        : result.OrderByDynamic(orderColumn, false);
                }
                var discharges = await result.ToListAsync();
                if (request.Limit > 0)
                {
                    discharges = await result
                    .Skip((request.Page - 1) * request.Limit)
                    .Take(request.Limit)
                    .ToListAsync();
                }

                return new DataTableResponse<DischargesDto>
                {
                    Success = true,
                    Data = discharges,
                    TotalRecords = totalRecords,
                    FilteredRecords = filteredRecords
                };
            }
            catch (Exception)
            {
                return new DataTableResponse<DischargesDto>
                {
                    Success = false,
                    Message = "Error retrieving discharges",
                    Data = null,
                    TotalRecords = 0,
                    FilteredRecords = 0
                };
            }
        }

        public async Task<DataTableResponse<ReadmissionsDto>> GetReadmissionsReport(ReadmissionsRequest request)
        {
            try
            {
                var endDate = request.AdmitEndDate?.Date ?? DateTime.Today;
                var startDate = request.AdmitStartDate?.Date ?? DateTime.Today.AddDays(-30);

                var query = _context.PatientEncounters
                    .AsNoTracking()
                    .AsSplitQuery()
                    .Include(pe => pe.Patient)
                    .Include(pe => pe.Doctor)
                    .Include(pe => pe.PatientTypeSegments)
                    .Where(pe => !pe.Patient.IsDeleted)
                    .Where(pe => pe.DischargeDate != null)
                    .Where(pe => pe.AdmitDate.Date >= startDate && pe.AdmitDate <= endDate);

                if (!string.IsNullOrEmpty(request.Search))
                {
                    query = query.Where(pe =>
                        pe.Patient.MRN.Contains(request.Search));
                }

                if (request.DoctorId != null && request.DoctorId.Any())
                {
                    query = query.Where(pe =>
                        request.DoctorId.Contains(pe.DoctorId));
                }

                if (request.PatientId != null && request.PatientId.Any())
                {
                    query = query.Where(pe =>
                        request.PatientId.Contains(pe.PatientId));
                }

                if (request.AdmitDate.HasValue)
                {
                    query = query.Where(pe =>
                        pe.AdmitDate.Date == request.AdmitDate.Value.Date);
                }

                if (request.DischargeDate.HasValue)
                {
                    query = query.Where(pe =>
                        pe.DischargeDate.Value.Date == request.DischargeDate.Value.Date);
                }

                if (request.DOB.HasValue)
                {
                    query = query.Where(pe =>
                        pe.Patient.DOB == request.DOB.Value);
                }

                if (request.AdmitStartDate.HasValue)
                {
                    query = query.Where(pe =>
                        pe.AdmitDate.Date >= request.AdmitStartDate.Value.Date);
                }

                if (request.AdmitEndDate.HasValue)
                {
                    query = query.Where(pe =>
                        pe.AdmitDate.Date <= request.AdmitEndDate.Value.Date);
                }

                if (request.DischargeStartDate.HasValue)
                {
                    query = query.Where(pe =>
                        pe.DischargeDate.Value.Date >= request.DischargeStartDate.Value.Date);
                }

                if (request.DischargeEndDate.HasValue)
                {
                    query = query.Where(pe =>
                        pe.DischargeDate.Value.Date <= request.DischargeEndDate.Value.Date);
                }

                var readmissionsQuery = from current in query
                                        join previous in _context.PatientEncounters
                                            on current.PatientId equals previous.PatientId
                                            into previousEncounters
                                        from prev in previousEncounters
                                            .Where(p => p.PatientTypeId == 1 &&
                                                       p.DischargeDate.HasValue &&
                                                       p.DischargeDate < current.AdmitDate)
                                            .OrderByDescending(p => p.DischargeDate)
                                            .Take(1)
                                            .DefaultIfEmpty()
                                        select new
                                        {
                                            Current = current,
                                            PreviousDischargeDate = prev != null ? prev.DischargeDate : null,
                                            DaysBetween = prev != null ?
                                                EF.Functions.DateDiffDay(prev.DischargeDate.Value, current.AdmitDate) :
                                                (int?)null
                                        };

                var allData = await readmissionsQuery.ToListAsync();

                var result = allData.Where(item => item.DaysBetween.HasValue && item.DaysBetween.Value <= 30)
                        .Select(item =>
                        {
                            int daysSinceReadmission = item.DaysBetween.Value;

                            int? lengthOfStay = item.Current.DischargeDate.HasValue
                                ? (int)(item.Current.DischargeDate.Value - item.Current.AdmitDate).TotalDays
                                : null;

                            return new ReadmissionsDto
                            {
                                MRN = item.Current.Patient.MRN,
                                PatientName = item.Current.Patient.Name,
                                DOB = item.Current.Patient.DOB,
                                AdmitDate = item.Current.AdmitDate,
                                DischargeDate = item.Current.DischargeDate ?? DateTime.MinValue,
                                TimeSinceReadmission = daysSinceReadmission,
                                LengthOfStay = lengthOfStay ?? 0,
                                DoctorName = item.Current.Doctor.Name,
                                DoctorId = item.Current.DoctorId,
                                IsReadmission = true
                            };
                        })
                        .ToList();

                // Apply sorting
                if (!string.IsNullOrEmpty(request.SortColumn))
                {
                    result = request.SortDirection == "asc"
                        ? result.AsQueryable().OrderByDynamic(request.SortColumn, true).ToList()
                        : result.AsQueryable().OrderByDynamic(request.SortColumn, false).ToList();
                }

                var totalRecords = result.Count;
                var filteredRecords = result.Count;

                // Apply pagination
                var pagedResult = (request.Limit > 0 && request.Page > 0)
                    ? result.Skip((request.Page - 1) * request.Limit).Take(request.Limit).ToList()
                    : result;

                return new DataTableResponse<ReadmissionsDto>
                {
                    Success = true,
                    Message = "Readmissions retrieved successfully.",
                    Data = pagedResult,
                    TotalRecords = totalRecords,
                    FilteredRecords = filteredRecords
                };

            }
            catch (Exception)
            {
                return new DataTableResponse<ReadmissionsDto>
                {
                    Success = false,
                    Message = "Error retrieving readmissions",
                    Data = null,
                    TotalRecords = 0,
                    FilteredRecords = 0
                };
            }
        }

        public async Task<DataTableResponse<ObservationHoursDto>> GetObservationHoursReport(ObservationHoursRequest request)
        {
            try
            {
                var endDate = request.AdmitEndDate?.Date ?? DateTime.Today;
                var startDate = request.AdmitStartDate?.Date ?? DateTime.Today.AddDays(-30);

                var query = _context.PatientEncounters
                    .AsNoTracking()
                    .AsSplitQuery()
                    .Include(pe => pe.Patient)
                    .Include(pe => pe.Doctor)
                    .Include(pe => pe.PatientTypeSegments)
                    .Where(pe => !pe.Patient.IsDeleted)
                    .Where(pe => pe.DischargeDate != null)
                    .Where(pe => pe.AdmitDate.Date >= startDate && pe.AdmitDate <= endDate);

                if (!string.IsNullOrEmpty(request.Search))
                {
                    query = query.Where(pe =>
                        pe.Patient.MRN.Contains(request.Search));
                }

                if (request.PatientId != null && request.PatientId.Any())
                {
                    query = query.Where(pe =>
                        request.PatientId.Contains(pe.PatientId));
                }

                if (request.DOB.HasValue)
                {
                    query = query.Where(pe =>
                        pe.Patient.DOB == request.DOB.Value);
                }

                if (request.AdmitDate.HasValue)
                {
                    query = query.Where(pe =>
                        pe.AdmitDate.Date == request.AdmitDate.Value.Date);
                }

                if (request.DischargeDate.HasValue)
                {
                    query = query.Where(pe =>
                        pe.DischargeDate.Value.Date == request.DischargeDate.Value.Date);
                }

                if (request.AdmitStartDate.HasValue)
                {
                    query = query.Where(pe =>
                        pe.AdmitDate.Date >= request.AdmitStartDate.Value.Date);
                }

                if (request.AdmitEndDate.HasValue)
                {
                    query = query.Where(pe =>
                        pe.AdmitDate.Date <= request.AdmitEndDate.Value.Date);
                }

                if (request.DischargeStartDate.HasValue)
                {
                    query = query.Where(pe =>
                        pe.DischargeDate.Value.Date >= request.DischargeStartDate.Value.Date);
                }

                if (request.DischargeEndDate.HasValue)
                {
                    query = query.Where(pe =>
                        pe.DischargeDate.Value.Date <= request.DischargeEndDate.Value.Date);
                }

                var totalRecords = await _context.PatientEncounters.CountAsync();
                var filteredRecords = await query.CountAsync();

                var intermediateResult = await query.Select(pe => new
                {
                    MRN = pe.Patient.MRN,
                    PatientName = pe.Patient.Name,
                    PatientId = pe.Patient.Id,
                    AdmitDate = pe.AdmitDate,
                    AdmitTime = pe.AdmitTime,
                    DischargeDate = pe.DischargeDate.Value,
                    DischargeTime = pe.DischargeTime.Value,
                    DOB = pe.Patient.DOB,
                    pe.PatientTypeSegments
                }).ToListAsync();

                var observationHours = intermediateResult.Select(pe => new ObservationHoursDto
                {
                    MRN = pe.MRN,
                    PatientName = pe.PatientName,
                    PatientId = pe.PatientId,
                    AdmitDate = pe.AdmitDate,
                    AdmitTime = pe.AdmitTime,
                    DischargeDate = pe.DischargeDate,
                    DischargeTime = pe.DischargeTime,
                    DOB = pe.DOB,
                    LengthOfStay = CalculateLengthOfStay(
                        pe.AdmitDate,
                        pe.AdmitTime,
                        pe.DischargeDate,
                        pe.DischargeTime).ToString(),
                    PatientDays = CalculatePatientDays(pe.AdmitDate, pe.DischargeDate, pe.PatientTypeSegments).ToString(),
                }).ToList();

                if (!string.IsNullOrEmpty(request.SortColumn))
                {
                    var orderColumn = request.SortColumn;
                    var orderDirection = request.SortDirection;

                    switch (orderColumn)
                    {
                        case "mrn":
                            observationHours = orderDirection == "desc"
                                ? observationHours.OrderByDescending(dto => dto.MRN).ToList()
                                : observationHours.OrderBy(dto => dto.MRN).ToList();
                            break;
                        case "patientName":
                            observationHours = orderDirection == "desc"
                                ? observationHours.OrderByDescending(dto => dto.PatientName).ToList()
                                : observationHours.OrderBy(dto => dto.PatientName).ToList();
                            break;
                        case "dob":
                            observationHours = orderDirection == "desc"
                                ? observationHours.OrderByDescending(dto => dto.DOB).ToList()
                                : observationHours.OrderBy(dto => dto.DOB).ToList();
                            break;
                        case "admitDate":
                            observationHours = orderDirection == "desc"
                                ? observationHours.OrderByDescending(dto => dto.AdmitDate).ToList()
                                : observationHours.OrderBy(dto => dto.AdmitDate).ToList();
                            break;
                        case "dischargeDate":
                            observationHours = orderDirection == "desc"
                                ? observationHours.OrderByDescending(dto => dto.DischargeDate).ToList()
                                : observationHours.OrderBy(dto => dto.DischargeDate).ToList();
                            break;
                        case "lengthOfStay":
                            observationHours = orderDirection == "desc"
                                ? observationHours.OrderByDescending(dto => long.Parse(dto.LengthOfStay)).ToList()
                                : observationHours.OrderBy(dto => long.Parse(dto.LengthOfStay)).ToList();
                            break;
                        default:
                            observationHours = orderDirection == "desc"
                                ? observationHours.OrderByDescending(dto => dto.PatientName).ToList()
                                : observationHours.OrderBy(dto => dto.PatientName).ToList();
                            break;
                    }
                }

                if (request.Limit > 0)
                {
                    observationHours = observationHours
                        .Skip((request.Page - 1) * request.Limit)
                        .Take(request.Limit)
                        .ToList();
                }


                return new DataTableResponse<ObservationHoursDto>
                {
                    Success = true,
                    Data = observationHours,
                    TotalRecords = totalRecords,
                    FilteredRecords = filteredRecords
                };
            }
            catch (Exception ex)
            {
                return new DataTableResponse<ObservationHoursDto>
                {
                    Success = false,
                    Message = $"Error retrieving observation hours: {ex.Message}",
                    Data = null,
                    TotalRecords = 0,
                    FilteredRecords = 0
                };
            }
        }

        public async Task<DataTableResponse<InpatientCensusDays>> GetInpatientCensusReport(InpatientCensusDaysRequest request)
        {
            try
            {
                var endDate = request.AdmitEndDate?.Date ?? DateTime.Today;
                var startDate = request.AdmitStartDate?.Date ?? DateTime.Today.AddDays(-30);

                var query = _context.PatientEncounters
                    .AsNoTracking()
                    .AsSplitQuery()
                    .Include(pe => pe.PatientType)
                    .Include(pe => pe.Patient)
                    .ThenInclude(p => p.PatientInsurances)
                    .ThenInclude(pi => pi.FinancialClass)
                    .Include(pe => pe.Doctor)
                    .Include(pe => pe.PatientTypeSegments)
                    .Where(pe => !pe.Patient.IsDeleted)
                    .Where(pe => pe.DischargeDate != null)
                    .Where(pe => pe.AdmitDate.Date >= startDate && pe.AdmitDate <= endDate);

                if (!string.IsNullOrEmpty(request.Search))
                {
                    query = query.Where(pe =>
                        pe.Patient.MRN.Contains(request.Search));
                }

                if (request.PatientId != null && request.PatientId.Any())
                {
                    query = query.Where(pe =>
                        request.PatientId.Contains(pe.PatientId));
                }

                if (request.DOB.HasValue)
                {
                    query = query.Where(pe =>
                        pe.Patient.DOB == request.DOB.Value);
                }

                if (request.AdmitDate.HasValue)
                {
                    query = query.Where(pe =>
                        pe.AdmitDate.Date == request.AdmitDate.Value.Date);
                }

                if (request.DischargeDate.HasValue)
                {
                    query = query.Where(pe =>
                        pe.DischargeDate.Value.Date == request.DischargeDate.Value.Date);
                }

                if (request.FinancialClassId != null && request.FinancialClassId.Any())
                {
                    query = query.Where(p => p.Patient.PatientInsurances.Any() &&
                           p.Patient.PatientInsurances.All(pi => request.FinancialClassId.Contains(pi.FinancialId)));
                }

                if (request.PatientTypeId != null && request.PatientTypeId.Any())
                {
                    query = query.Where(pe => request.PatientTypeId.Contains(pe.PatientTypeId));
                }

                if (request.AdmitStartDate.HasValue)
                {
                    query = query.Where(pe =>
                        pe.AdmitDate.Date >= request.AdmitStartDate.Value.Date);
                }

                if (request.AdmitEndDate.HasValue)
                {
                    query = query.Where(pe =>
                        pe.AdmitDate.Date <= request.AdmitEndDate.Value.Date);
                }

                if (request.DischargeStartDate.HasValue)
                {
                    query = query.Where(pe =>
                        pe.DischargeDate.Value.Date >= request.DischargeStartDate.Value.Date);
                }

                if (request.DischargeEndDate.HasValue)
                {
                    query = query.Where(pe =>
                        pe.DischargeDate.Value.Date <= request.DischargeEndDate.Value.Date);
                }

                var totalRecords = await _context.PatientEncounters.CountAsync();
                var filteredRecords = await query.CountAsync();

                var result = await query.Select(pe => new
                {
                    pe.Patient.MRN,
                    PatientName = pe.Patient.Name,
                    pe.Patient.Id,
                    pe.AdmitDate,
                    pe.AdmitTime,
                    DischargeDate = pe.DischargeDate.Value,
                    DischargeTime = pe.DischargeTime.Value,
                    pe.Patient.DOB,
                    pe.Patient.PatientInsurances,
                    PatientTypeName = pe.PatientType.Name,
                    pe.PatientTypeSegments
                }).ToListAsync();

                var inpatientCensus = result.Select(x => new InpatientCensusDays
                {
                    MRN = x.MRN,
                    PatientName = x.PatientName,
                    PatientId = x.Id,
                    AdmitDate = x.AdmitDate,
                    AdmitTime = x.AdmitTime,
                    DischargeDate = x.DischargeDate,
                    DischargeTime = x.DischargeTime,
                    DOB = x.DOB,
                    LengthOfStay = CalculateLengthOfStay(x.AdmitDate, x.AdmitTime,x.DischargeDate,x.DischargeTime).ToString(),
                    FinancialClass = x.PatientInsurances
                            .Select(pi => pi.FinancialClass.Name)
                            .FirstOrDefault(),
                    //PatientDays = x.PatientTypeSegments.Any()
                    //        ? x.PatientTypeSegments
                    //            .Sum(seg => (seg.TransferOutDate.HasValue ? seg.TransferOutDate.Value : x.DischargeDate)
                    //                .Subtract(seg.TransferInDate).Days)
                    //            .ToString()
                    //        : (x.DischargeDate - x.AdmitDate).Days.ToString(),
                    PatientDays = CalculatePatientDays(x.AdmitDate, x.DischargeDate, x.PatientTypeSegments).ToString(),
                    PatientType = x.PatientTypeName,
                }).ToList();


                if (!string.IsNullOrEmpty(request.SortColumn))
                {
                    var orderColumn = request.SortColumn;
                    var orderDirection = request.SortDirection;

                    switch (orderColumn)
                    {
                        case "mrn":
                            inpatientCensus = orderDirection == "desc"
                                ? inpatientCensus.OrderByDescending(dto => dto.MRN).ToList()
                                : inpatientCensus.OrderBy(dto => dto.MRN).ToList();
                            break;
                        case "patientName":
                            inpatientCensus = orderDirection == "desc"
                                ? inpatientCensus.OrderByDescending(dto => dto.PatientName).ToList()
                                : inpatientCensus.OrderBy(dto => dto.PatientName).ToList();
                            break;
                        case "dob":
                            inpatientCensus = orderDirection == "desc"
                                ? inpatientCensus.OrderByDescending(dto => dto.DOB).ToList()
                                : inpatientCensus.OrderBy(dto => dto.DOB).ToList();
                            break;
                        case "admitDate":
                            inpatientCensus = orderDirection == "desc"
                                ? inpatientCensus.OrderByDescending(dto => dto.AdmitDate).ToList()
                                : inpatientCensus.OrderBy(dto => dto.AdmitDate).ToList();
                            break;
                        case "dischargeDate":
                            inpatientCensus = orderDirection == "desc"
                                ? inpatientCensus.OrderByDescending(dto => dto.DischargeDate).ToList()
                                : inpatientCensus.OrderBy(dto => dto.DischargeDate).ToList();
                            break;
                        case "lengthOfStay":
                            inpatientCensus = orderDirection == "desc"
                                ? inpatientCensus.OrderByDescending(dto => long.Parse(dto.LengthOfStay)).ToList()
                                : inpatientCensus.OrderBy(dto => long.Parse(dto.LengthOfStay)).ToList();
                            break;
                        case "patientDays":
                            inpatientCensus = orderDirection == "desc"
                                ? inpatientCensus.OrderByDescending(dto => long.Parse(dto.PatientDays)).ToList()
                                : inpatientCensus.OrderBy(dto => long.Parse(dto.PatientDays)).ToList();
                            break;
                        case "financialClass":
                            inpatientCensus = orderDirection == "desc"
                                ? inpatientCensus.OrderByDescending(dto => dto.FinancialClass).ToList()
                                : inpatientCensus.OrderBy(dto => dto.FinancialClass).ToList();
                            break;
                        case "patientType":
                            inpatientCensus = orderDirection == "desc"
                                ? inpatientCensus.OrderByDescending(dto => dto.PatientType).ToList()
                                : inpatientCensus.OrderBy(dto => dto.PatientType).ToList();
                            break;
                        default:
                            inpatientCensus = orderDirection == "desc"
                                ? inpatientCensus.OrderByDescending(dto => dto.PatientName).ToList()
                                : inpatientCensus.OrderBy(dto => dto.PatientName).ToList();
                            break;
                    }
                }

                if (request.Limit > 0)
                {
                    inpatientCensus = inpatientCensus
                        .Skip((request.Page - 1) * request.Limit)
                        .Take(request.Limit)
                        .ToList();
                }


                return new DataTableResponse<InpatientCensusDays>
                {
                    Success = true,
                    Data = inpatientCensus,
                    TotalRecords = totalRecords,
                    FilteredRecords = filteredRecords
                };
            }
            catch (Exception ex)
            {
                return new DataTableResponse<InpatientCensusDays>
                {
                    Success = false,
                    Message = $"Error retrieving inpatient census report: {ex.Message}",
                    Data = null,
                    TotalRecords = 0,
                    FilteredRecords = 0
                };
            }
        }

        private long CalculateLengthOfStay(DateTime admitDate, TimeOnly admitTime, DateTime dischargeDate, TimeOnly dischargeTime)
        {
            var admitDateTime = admitDate.Add(admitTime.ToTimeSpan());
            var dischargeDateTime = dischargeDate.Add(dischargeTime.ToTimeSpan());
            var difference = dischargeDateTime - admitDateTime;
            return (long)difference.TotalHours;
        }

        private int CalculatePatientDays(DateTime admitDate, DateTime dischargeDate, IEnumerable<PatientTypeSegment> patientTypeSegments)
        {
            if (patientTypeSegments?.Any() == true)
            {
                return patientTypeSegments.Sum(seg =>
                    ((seg.TransferOutDate ?? dischargeDate) - seg.TransferInDate).Days);
            }

            return (dischargeDate - admitDate).Days;
        }

        #endregion

        #region PDF Generation
        public async Task<byte[]> GenerateDailyCensusPdf(DailyCensusRequest dataTableRequest)
        {
            var data = (await GetDailyCensusReport(dataTableRequest)).Data;

            var pdfGenerator = new PdfReportGenerator();

            var columns = new List<PdfColumnDefinition>
            {
                new PdfColumnDefinition
                {
                    PropertyName = nameof(DailyCensusDTO.MRN),
                    HeaderText = "MRN",
                    Width = 65
                },
                new PdfColumnDefinition
                {
                    PropertyName = nameof(DailyCensusDTO.PatientName),
                    HeaderText = "Patient Name",
                    Width = 95
                },
                new PdfColumnDefinition
                {
                    PropertyName = nameof(DailyCensusDTO.DoctorName),
                    HeaderText = "Doctor Name",
                    Width = 95
                },
                new PdfColumnDefinition
                {
                    PropertyName = nameof(DailyCensusDTO.AdmitDate),
                    HeaderText = "Admit Date",
                    Width = 75,
                    ValueFormatter = (value) => value is DateTime dt ? dt.ToString("MM/dd/yyyy") : "-"
                },
                new PdfColumnDefinition
                {
                    PropertyName = nameof(DailyCensusDTO.DischargeDate),
                    HeaderText = "Discharge Date",
                    Width = 85,
                    ValueFormatter = (value) => value is DateTime dt ? dt.ToString("MM/dd/yyyy") : "-"
                },
                new PdfColumnDefinition
                {
                    PropertyName = nameof(DailyCensusDTO.DOB),
                    HeaderText = "DOB",
                    Width = 75,
                    ValueFormatter = (value) => value is DateOnly dt ? dt.ToString("MM/dd/yyyy") : "-"
                },
                new PdfColumnDefinition
                {
                    PropertyName = nameof(DailyCensusDTO.Age),
                    HeaderText = "Age",
                    Width = 40
                },
                new PdfColumnDefinition
                {
                    PropertyName = nameof(DailyCensusDTO.FinancialClass),
                    HeaderText = "Financial Class",
                    Width = 95
                }
            };

            var options = new PdfReportOptions
            {
                ReportTitle = "Daily Census Report",
                ReportDate = DateTime.Today,
                PageSize = PdfSharpCore.PageSize.A4,
                Orientation = PdfSharpCore.PageOrientation.Landscape,
                StartX = 110,
                StartY = 55,
                RowHeight = 18,
                BottomMargin = 50
            };

            return pdfGenerator.GeneratePdf(data, columns, options);
        }

        public async Task<byte[]> GenerateAdmissionPdf(AdmissionsRequest dataTableRequest)
        {
            var data = (await GetAdmissionsReport(dataTableRequest)).Data;

            var startDate = dataTableRequest.AdmitStartDate?.Date ?? DateTime.Today.AddDays(-30);
            var endDate = dataTableRequest.AdmitEndDate?.Date ?? DateTime.Today;

            var pdfGenerator = new PdfReportGenerator();

            var columns = new List<PdfColumnDefinition>
            {
                new PdfColumnDefinition
                {
                    PropertyName = nameof(AdmissionsDTO.MRN),
                    HeaderText = "MRN",
                    Width = 65
                },
                new PdfColumnDefinition
                {
                    PropertyName = nameof(AdmissionsDTO.PatientName),
                    HeaderText = "Patient Name",
                    Width = 95
                },
                new PdfColumnDefinition
                {
                    PropertyName = nameof(AdmissionsDTO.DoctorName),
                    HeaderText = "Doctor Name",
                    Width = 95
                },
                new PdfColumnDefinition
                {
                    PropertyName = nameof(AdmissionsDTO.AdmitDate),
                    HeaderText = "Admit Date",
                    Width = 75,
                    ValueFormatter = (value) => value is DateTime dt ? dt.ToString("MM/dd/yyyy") : "-"
                },
                new PdfColumnDefinition
                {
                    PropertyName = nameof(AdmissionsDTO.PatientType),
                    HeaderText = "Patient Type",
                    Width = 85,
                },
                new PdfColumnDefinition
                {
                    PropertyName = nameof(AdmissionsDTO.DOB),
                    HeaderText = "DOB",
                    Width = 75,
                    ValueFormatter = (value) => value is DateOnly dt ? dt.ToString("MM/dd/yyyy") : "-"
                },
                new PdfColumnDefinition
                {
                    PropertyName = nameof(AdmissionsDTO.Age),
                    HeaderText = "Age",
                    Width = 40
                },
                new PdfColumnDefinition
                {
                    PropertyName = nameof(AdmissionsDTO.FinancialClass),
                    HeaderText = "Financial Class",
                    Width = 95
                }
            };

            var options = new PdfReportOptions
            {
                ReportTitle = "Admissions Report",
                HospitalName = "RICHLAND PARISH HOSPITAL",
                StartDate = startDate,
                EndDate = endDate,
                PageSize = PdfSharpCore.PageSize.A4,
                Orientation = PdfSharpCore.PageOrientation.Landscape,
                StartX = 110,
                StartY = 45,
                RowHeight = 16,
                BottomMargin = 50,
                TotalsContent = "",
                ShowGrandTotal = false
            };

            return pdfGenerator.GeneratePdf(data, columns, options);
        }

        public async Task<byte[]> GenerateDischargePdf(DischargesRequest dataTableRequest)
        {
            var data = (await GetDischargesReport(dataTableRequest)).Data;
            var startDate = dataTableRequest.DischargeStartDate?.Date ?? DateTime.Today.AddDays(-30);
            var endDate = dataTableRequest.DischargeEndDate?.Date ?? DateTime.Today;

            var pdfGenerator = new PdfReportGenerator();

            var columns = new List<PdfColumnDefinition>
            {
                new PdfColumnDefinition
                {
                    PropertyName = nameof(DischargesDto.MRN),
                    HeaderText = "MRN",
                    Width = 65
                },
                new PdfColumnDefinition
                {
                    PropertyName = nameof(DischargesDto.PatientName),
                    HeaderText = "Patient Name",
                    Width = 95
                },
                new PdfColumnDefinition
                {
                    PropertyName = nameof(DischargesDto.DoctorName),
                    HeaderText = "Doctor Name",
                    Width = 95
                },
                new PdfColumnDefinition
                {
                    PropertyName = nameof(DischargesDto.DischargeDate),
                    HeaderText = "Discharge Date",
                    Width = 75,
                    ValueFormatter = (value) => value is DateTime dt ? dt.ToString("MM/dd/yyyy") : "-"
                },
                new PdfColumnDefinition
                {
                    PropertyName = nameof(DischargesDto.PatientType),
                    HeaderText = "Patient Type",
                    Width = 85,
                },
                new PdfColumnDefinition
                {
                    PropertyName = nameof(DischargesDto.DOB),
                    HeaderText = "DOB",
                    Width = 75,
                    ValueFormatter = (value) => value is DateOnly dt ? dt.ToString("MM/dd/yyyy") : "-"
                },
                new PdfColumnDefinition
                {
                    PropertyName = nameof(DischargesDto.Age),
                    HeaderText = "Age",
                    Width = 40
                },
                new PdfColumnDefinition
                {
                    PropertyName = nameof(DischargesDto.FinancialClass),
                    HeaderText = "Financial Class",
                    Width = 95
                }
            };

            var options = new PdfReportOptions
            {
                ReportTitle = "Discharges Report",
                HospitalName = "RICHLAND PARISH HOSPITAL",
                StartDate = startDate,
                EndDate = endDate,
                PageSize = PdfSharpCore.PageSize.A4,
                Orientation = PdfSharpCore.PageOrientation.Landscape,
                StartX = 110,
                StartY = 45,
                RowHeight = 16,
                BottomMargin = 50,
                TotalsContent = "",
                ShowGrandTotal = false
            };

            return pdfGenerator.GeneratePdf(data, columns, options);
        }

        public async Task<byte[]> GenerateReadmissionsPdf(ReadmissionsRequest dataTableRequest)
        {
            var data = (await GetReadmissionsReport(dataTableRequest)).Data;

            DateTime today = DateTime.Today;
            var endDate = dataTableRequest.EndDate?.Date ?? DateTime.Today;
            var startDate = dataTableRequest.StartDate?.Date ?? DateTime.Today.AddDays(-30);

            //DateTime startDate = dataTableRequest.AdmitStartDate?.Date ?? today;
            //DateTime endDate = dataTableRequest.DischargeEndDate?.Date ?? startDate;

            var pdfGenerator = new PdfReportGenerator();

            var columns = new List<PdfColumnDefinition>
            {
                new PdfColumnDefinition
                {
                    PropertyName = nameof(ReadmissionsDto.MRN),
                    HeaderText = "MRN",
                    Width = 65
                },
                new PdfColumnDefinition
                {
                    PropertyName = nameof(ReadmissionsDto.PatientName),
                    HeaderText = "Patient Name",
                    Width = 95
                },
                new PdfColumnDefinition
                {
                    PropertyName = nameof(ReadmissionsDto.DOB),
                    HeaderText = "DOB",
                    Width = 75,
                    ValueFormatter = (value) => value is DateOnly dt ? dt.ToString("MM/dd/yyyy") : "-"
                },
                 new PdfColumnDefinition
                {
                    PropertyName = nameof(ReadmissionsDto.AdmitDate),
                    HeaderText = "Admit Date",
                    Width = 75,
                    ValueFormatter = (value) => value is DateTime dt ? dt.ToString("MM/dd/yyyy") : "-"
                },
                 new PdfColumnDefinition
                {
                    PropertyName = nameof(ReadmissionsDto.DischargeDate),
                    HeaderText = "Discharge Date",
                    Width = 85,
                    ValueFormatter = (value) => value is DateTime dt ? dt.ToString("MM/dd/yyyy") : "-"
                },
                new PdfColumnDefinition
                {
                    PropertyName = nameof(ReadmissionsDto.TimeSinceReadmission),
                    HeaderText = "Time since Re-admission",
                    Width = 115,
                    ValueFormatter = (value) => $"{value} days"
                },

                new PdfColumnDefinition
                {
                    PropertyName = nameof(ReadmissionsDto.LengthOfStay),
                    HeaderText = "Length of Stay",
                    Width = 85,
                    ValueFormatter = (value) => $"{value} days"
                },
                new PdfColumnDefinition
                {
                    PropertyName = nameof(ReadmissionsDto.DoctorName),
                    HeaderText = "Attending Doctor",
                    Width = 85,
                },
            };

            var options = new PdfReportOptions
            {
                ReportTitle = "Readmissions Report",
                HospitalName = "RICHLAND PARISH HOSPITAL",
                StartDate = startDate,
                EndDate = endDate,
                PageSize = PdfSharpCore.PageSize.A4,
                Orientation = PdfSharpCore.PageOrientation.Landscape,
                StartX = 80,
                StartY = 45,
                RowHeight = 16,
                BottomMargin = 50,
                TotalsContent = "",
                ShowGrandTotal = false
            };

            return pdfGenerator.GeneratePdf(data, columns, options);
        }

        public async Task<byte[]> GenerateObservationHoursPdf(ObservationHoursRequest dataTableRequest)
        {
            var data = (await GetObservationHoursReport(dataTableRequest)).Data;
            var endDate = dataTableRequest.EndDate?.Date ?? DateTime.Today;
            var startDate = dataTableRequest.StartDate?.Date ?? DateTime.Today.AddDays(-30);

            long totalLOS = 0;
            decimal totalPatientDays = 0;

            foreach (var record in data)
            {
                if (long.TryParse(record.LengthOfStay, out long los))
                {
                    totalLOS += los;
                }
                if(decimal.TryParse(record.PatientDays, out decimal patientDays))
                {
                    totalPatientDays += patientDays;
                }
            }
            string totalRecords = $"LOS: {totalLOS} Hours and Patient {totalPatientDays} Days";

            var pdfGenerator = new PdfReportGenerator();

            var columns = new List<PdfColumnDefinition>
            {
                new PdfColumnDefinition
                {
                    PropertyName = nameof(ObservationHoursDto.MRN),
                    HeaderText = "MRN",
                    Width = 65
                },
                new PdfColumnDefinition
                {
                    PropertyName = nameof(ObservationHoursDto.PatientName),
                    HeaderText = "Patient Name",
                    Width = 95
                },
                new PdfColumnDefinition
                {
                    PropertyName = nameof(ObservationHoursDto.DOB),
                    HeaderText = "DOB",
                    Width = 75,
                    ValueFormatter = (value) => value is DateOnly dt ? dt.ToString("MM/dd/yyyy") : "-"
                },
                 new PdfColumnDefinition
                {
                    PropertyName = nameof(ObservationHoursDto.AdmitDate),
                    HeaderText = "Admit Date",
                    Width = 75,
                    ValueFormatter = (value) => value is DateTime dt ? dt.ToString("MM/dd/yyyy") : "-"
                },
                 new PdfColumnDefinition
                {
                    PropertyName = nameof(ObservationHoursDto.AdmitTime),
                    HeaderText = "Admit Time",
                    Width = 75,
                },
                 new PdfColumnDefinition
                {
                    PropertyName = nameof(ObservationHoursDto.DischargeDate),
                    HeaderText = "Discharge Date",
                    Width = 85,
                    ValueFormatter = (value) => value is DateTime dt ? dt.ToString("MM/dd/yyyy") : "-"
                },
                new PdfColumnDefinition
                {
                    PropertyName = nameof(ObservationHoursDto.DischargeTime),
                    HeaderText = "Discharge Time",
                    Width = 85
                },

                new PdfColumnDefinition
                {
                    PropertyName = nameof(ObservationHoursDto.LengthOfStay),
                    HeaderText = "Length of Stay",
                    Width = 85,
                    ValueFormatter = (value) => $"{value} Hours"
                },
            };

            var options = new PdfReportOptions
            {
                ReportTitle = "Observation Hours Report",
                HospitalName = "RICHLAND PARISH HOSPITAL",
                StartDate = startDate,
                EndDate = endDate,
                PageSize = PdfSharpCore.PageSize.A4,
                Orientation = PdfSharpCore.PageOrientation.Landscape,
                StartX = 110,
                StartY = 45,
                RowHeight = 16,
                BottomMargin = 50,
                TotalsContent = totalRecords,
                ShowGrandTotal = false
            };

            return pdfGenerator.GeneratePdf(data, columns, options);
        }

        public async Task<byte[]> GenerateInpatientCensusPdf(InpatientCensusDaysRequest dataTableRequest)
        {
            var data = (await GetInpatientCensusReport(dataTableRequest)).Data;

            long totalLOS = 0;
            decimal totalPatientDays = 0;

            foreach (var record in data)
            {
                if (long.TryParse(record.LengthOfStay, out long los))
                {
                    totalLOS += los;
                }
                if (decimal.TryParse(record.PatientDays, out decimal patientDays))
                {
                    totalPatientDays += patientDays;
                }
            }

            string totalRecords = $"LOS: {totalLOS} Hours and Patient {totalPatientDays} Days";

            var pdfGenerator = new PdfReportGenerator();

            var columns = new List<PdfColumnDefinition>
            {
                new PdfColumnDefinition
                {
                    PropertyName = nameof(InpatientCensusDays.MRN),
                    HeaderText = "MRN",
                    Width = 65
                },
                new PdfColumnDefinition
                {
                    PropertyName = nameof(InpatientCensusDays.PatientName),
                    HeaderText = "Patient Name",
                    Width = 95
                },
                 new PdfColumnDefinition
                {
                    PropertyName = nameof(InpatientCensusDays.DOB),
                    HeaderText = "DOB",
                    Width = 75,
                    ValueFormatter = (value) => value is DateOnly dt ? dt.ToString("MM/dd/yyyy") : "-"
                },
                new PdfColumnDefinition
                {
                    PropertyName = nameof(InpatientCensusDays.PatientType),
                    HeaderText = "Patient Type",
                    Width = 95
                },
                  new PdfColumnDefinition
                {
                    PropertyName = nameof(InpatientCensusDays.AdmitDate),
                    HeaderText = "Admit Date",
                    Width = 75,
                    ValueFormatter = (value) => value is DateTime dt ? dt.ToString("MM/dd/yyyy") : "-"
                },
                  new PdfColumnDefinition
                {
                    PropertyName = nameof(InpatientCensusDays.AdmitTime),
                    HeaderText = "Admit Time",
                    Width = 75,
                },
               
                 new PdfColumnDefinition
                {
                    PropertyName = nameof(InpatientCensusDays.DischargeDate),
                    HeaderText = "Discharge Date",
                    Width = 85,
                    ValueFormatter = (value) => value is DateTime dt ? dt.ToString("MM/dd/yyyy") : "-"
                },
                    new PdfColumnDefinition
                {
                    PropertyName = nameof(InpatientCensusDays.FinancialClass),
                    HeaderText = "Financial Class",
                    Width = 75,
                },
                new PdfColumnDefinition
                {
                    PropertyName = nameof(InpatientCensusDays.LengthOfStay),
                    HeaderText = "Length of Stay",
                    Width = 85,
                    ValueFormatter = (value) => $"{value} Hours"
                },
                new PdfColumnDefinition
                {
                    PropertyName = nameof(InpatientCensusDays.PatientDays),
                    HeaderText = "Patient Days",
                    Width = 85,
                    ValueFormatter = (value) => $"{value} Days"
                },
            };

            var options = new PdfReportOptions
            {
                ReportTitle = "Inpatient Census Report",
                ReportDate = DateTime.Today,
                PageSize = PdfSharpCore.PageSize.A4,
                Orientation = PdfSharpCore.PageOrientation.Landscape,
                TotalsContent = totalRecords,
                StartX = 15,
                StartY = 55,
                RowHeight = 18,
                BottomMargin = 50
            };

            return pdfGenerator.GeneratePdf(data, columns, options);
        }
        #endregion
    }
}
