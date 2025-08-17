using System;
using Volo.Abp.Application.Dtos;

namespace Customer.Portal.DTOs.SupportTicketDTOs;

public class CreateUpdateSupportTicketDto : EntityDto<Guid>
{
    public string Name { get; set; }

    public string Description { get; set; }

    public decimal Price { get; set; }
}