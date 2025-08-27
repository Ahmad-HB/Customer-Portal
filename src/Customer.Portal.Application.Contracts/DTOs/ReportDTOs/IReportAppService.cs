using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Customer.Portal.Enums;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Customer.Portal.DTOs.ReportDTOs;

public interface IReportAppService : IApplicationService
{
    public Task GenerateReportAsync(ReportTypes reportType, Guid ticketId, DateTime? startDate, DateTime? endDate);
}