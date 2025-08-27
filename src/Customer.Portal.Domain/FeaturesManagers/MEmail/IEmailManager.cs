using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Customer.Portal.Entities;
using Customer.Portal.Enums;
using Volo.Abp.Domain.Services;

namespace Customer.Portal.FeaturesManagers.MEmail;

public interface IEmailManager : IDomainService
{
    // public Task SendEmailAsync(Guid userId, EmailType emailType, object model);
}