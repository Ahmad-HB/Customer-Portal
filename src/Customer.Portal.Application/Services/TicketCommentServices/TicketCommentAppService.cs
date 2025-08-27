using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Customer.Portal.DTOs.TicketCommentDTOs;
using Customer.Portal.Entities;
using Customer.Portal.FeaturesManagers.MTicketComment;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Users;

namespace Customer.Portal.Services.TicketCommentServices;

public class TicketCommentAppService : PortalAppService, ITicketCommentAppService
{

    #region Feilds

    private readonly ITicketCommentManager _ticketCommentManager;
    private readonly ICurrentUser _currentUser;

    #endregion

    #region Ctor

    public TicketCommentAppService(ITicketCommentManager ticketCommentManager, ICurrentUser currentUser)
    {
        _ticketCommentManager = ticketCommentManager;
        _currentUser = currentUser;
    }

    #endregion

    #region Methods

    public async Task<TicketCommentDto> GetTicketCommentAsync(Guid id)
    {
        Guid identityUserId = _currentUser.Id ?? throw new UserFriendlyException("User is not logged in.");
        
        var ticketcomment = await _ticketCommentManager.GetTicketCommentAsync(id);
        
        return ObjectMapper.Map<TicketComment, TicketCommentDto>(ticketcomment);
        
    }

    public async Task<PagedResultDto<TicketCommentDto>> GetTicketCommentsAsync(Guid ticketId)
    {
        Guid identityUserId = _currentUser.Id ?? throw new UserFriendlyException("User is not logged in.");
        
        var ticketcomments = await  _ticketCommentManager.GetTicketCommentsAsync(ticketId);
        
        return new PagedResultDto<TicketCommentDto>(ticketcomments.Count, ObjectMapper.Map<List<TicketComment>, List<TicketCommentDto>>(ticketcomments));
    }

    #endregion
    
}