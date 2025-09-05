using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Customer.Portal.Entities;
using Customer.Portal.Enums;
using Volo.Abp.Domain.Services;

namespace Customer.Portal.FeaturesManagers.MEmail;

public interface IEmailManager : IDomainService
{

        public Task SendEmailTestAsync(string adress, EmailType emailType);
        
        public Task SendTicketCreatedEmailtAsync(string adress, Guid ticketId, Guid identityUserId);
        
        public Task SendTicketUpdatedEmailAsync(string adress, Guid ticketId, Guid identityUserId, UpdateType updateType, string? previousValue = null, string? newValue = null);
        
        public Task SendCustomerRegistrationEmailAsync(string adress, Guid identityUserId);
        
        public Task SendConfirmationEmailAsync(string adress, Guid identityUserId, string actionType, string actionDetails);
    
}