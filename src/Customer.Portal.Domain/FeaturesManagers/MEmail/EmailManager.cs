using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Customer.Portal.Entities;
using Customer.Portal.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;
using Volo.Abp.Emailing;
using Volo.Abp.Guids;
using Volo.Abp.Identity;
using Volo.Abp.TextTemplating;

namespace Customer.Portal.FeaturesManagers.MEmail;

public class EmailManager : DomainService, IEmailManager
{
    #region Fields

    private readonly IRepository<Email, Guid> _emailRepository;
    private readonly IRepository<EmailTemplate, Guid> _emailTemplateRepository;
    private readonly IRepository<IdentityUser, Guid> _identityUserRepository;
    private readonly IEmailSender _emailSender;
    private readonly ITemplateRenderer _templateRenderer;
    private readonly IGuidGenerator _guidGenerator;
    private readonly ILogger<EmailManager> _logger;

    #endregion

    #region Constructor

    public EmailManager(
        IRepository<Email, Guid> emailRepository,
        IRepository<EmailTemplate, Guid> emailTemplateRepository,
        IRepository<IdentityUser, Guid> identityUserRepository,
        IEmailSender emailSender,
        ITemplateRenderer templateRenderer,
        IGuidGenerator guidGenerator,
        ILogger<EmailManager> logger)
    {
        _emailRepository = emailRepository;
        _emailTemplateRepository = emailTemplateRepository;
        _identityUserRepository = identityUserRepository;
        _emailSender = emailSender;
        _templateRenderer = templateRenderer;
        _guidGenerator = guidGenerator;
        _logger = logger;
    }

    #endregion

    #region Methods
    
    

    #endregion
    
}