using System.Threading.Tasks;
using Customer.Portal.Entities;
using Volo.Abp.Domain.Services;

namespace Customer.Portal.FeaturesManagers.MTicketComment;

public interface ITicketCommentManager : IDomainService
{
    public Task CreateTicketCommentAsync(TicketComment input);
}