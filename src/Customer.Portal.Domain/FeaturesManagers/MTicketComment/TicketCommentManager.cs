using System.Threading.Tasks;
using Customer.Portal.Entities;
using Volo.Abp.Domain.Services;

namespace Customer.Portal.FeaturesManagers.MTicketComment;

public class TicketCommentManager : DomainService, ITicketCommentManager
{
    public Task CreateTicketCommentAsync(TicketComment input)
    {
        throw new System.NotImplementedException();
    }
}