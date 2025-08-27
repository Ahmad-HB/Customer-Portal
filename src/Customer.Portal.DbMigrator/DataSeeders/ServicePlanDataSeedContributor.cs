using System.Collections.Generic;
using System.Threading.Tasks;
using Customer.Portal.Entities;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Guids;
using Volo.Abp.Identity;

namespace Customer.Portal.DbMigrator.DataSeeders;

public class ServicePlanDataSeedContributor : IDataSeedContributor, ITransientDependency
{
    #region Feilds

    private readonly IRepository<ServicePlan> _servicePlanRepository;
    private readonly IGuidGenerator _guidGenerator;

    #endregion


    #region Ctor

    public ServicePlanDataSeedContributor(IRepository<ServicePlan> servicePlanRepository, IGuidGenerator guidGenerator)
    {
        _servicePlanRepository = servicePlanRepository;
        _guidGenerator = guidGenerator;
    }

    #endregion


    #region Methods

    public async Task SeedAsync(DataSeedContext context)
    {
        // if (_servicePlanRepository.CountAsync().Result > 0)
        // {
        //     return;
        // }
        //
        // var servicePlans = new List<ServicePlan>
        // {
        //     new ServicePlan
        //     (
        //         _guidGenerator.Create(),
        //         "Basic",
        //         "Basic Service Plan",
        //         new decimal(9.99)
        //     ),
        //     new ServicePlan
        //     (
        //         _guidGenerator.Create(),
        //         "Standard",
        //         "Standard Service Plan",
        //         new decimal(19.99)
        //     ),
        //     new ServicePlan
        //     (
        //         _guidGenerator.Create(),
        //         "Premium",
        //         "Premium Service Plan",
        //         new decimal(29.99)
        //     )
        // };
        //
        // await _servicePlanRepository.InsertManyAsync(servicePlans);
        
        return;


    }

    #endregion
}