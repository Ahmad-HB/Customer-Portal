using System;
using Volo.Abp.Application.Dtos;

namespace Customer.Portal.DTOs.UserServicePlanDTOs;

public class CreateUpdateUserServicePlanDto : EntityDto<Guid>
{
    public string Name { get; set; }

    public string Description { get; set; }

    public decimal Price { get; set; }
}