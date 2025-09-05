using System;
using System.ComponentModel.DataAnnotations;

namespace Customer.Portal.DTOs.UserServicePlanDTOs;

public class SuspendUserServicePlanDto
{
    public Guid Id { get; set; }
    public string? SuspensionReason { get; set; }
}
