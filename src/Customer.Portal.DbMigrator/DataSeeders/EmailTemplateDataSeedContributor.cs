using System;
using System.Threading.Tasks;
using Customer.Portal.Entities;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Guids;

namespace Customer.Portal.DbMigrator.DataSeeders;

public class EmailTemplateDataSeedContributor : IDataSeedContributor, ITransientDependency
{

    #region Fields
    
    private readonly IRepository<EmailTemplate, Guid> _emailTemplateRepository;
    private readonly IGuidGenerator _guidGenerator;

    #endregion
    
    #region Ctor

    public EmailTemplateDataSeedContributor(IRepository<EmailTemplate, Guid> emailTemplateRepository, IGuidGenerator guidGenerator)
    {
        _emailTemplateRepository = emailTemplateRepository;
        _guidGenerator = guidGenerator;
    }
    
    #endregion
    
    
    public Task SeedAsync(DataSeedContext context)
    {
        throw new System.NotImplementedException();
    }
}