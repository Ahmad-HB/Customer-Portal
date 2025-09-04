using System.Threading.Tasks;
using Customer.Portal.Enums;
using Volo.Abp.Application.Services;

namespace Customer.Portal.DTOs.EmailDTOs;

public interface IEmailAppService : IApplicationService
{
    // public Task SendEmailAsync(Guid userId, EmailType emailType, object model);
    public Task SendEmailTestAsync(string adress, EmailType emailType);
    
}