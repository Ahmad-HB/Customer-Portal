using System;
using Volo.Abp.Application.Dtos;

namespace Customer.Portal.DTOs.TicketCommentDTOs;

public class CreateUpdateTicketCommentDto : EntityDto<Guid>
{
    public string Name { get; set; }

    public string Description { get; set; }

    public decimal Price { get; set; }
}