using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace Customer.Portal.DTOs.SupportTicketDTOs;

public interface ISupportTicketAppService : IApplicationService
{
    public Task<Task> CreateSupportTicketAsync(CreateUpdateSupportTicketDto input);
}