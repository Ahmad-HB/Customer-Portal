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
        if (_servicePlanRepository.CountAsync().Result > 0)
        {
            return;
        }

        var servicePlans = new List<ServicePlan>
        {
            new ServicePlan
            (
                _guidGenerator.Create(),
                "Basic",
                @"Perfect for small businesses and startups looking for essential support services.
• Up to 5 support tickets per month
• Email support with 24-hour response time
• Basic troubleshooting and issue resolution
• Access to knowledge base and documentation
• Standard business hours support (9 AM - 6 PM EST)
• Monthly support summary reports
• Basic account management assistance

Ideal for businesses with minimal technical requirements and basic support needs.",
                new decimal(9.99)
            ),
            new ServicePlan
            (
                _guidGenerator.Create(),
                "Standard",
                @"Comprehensive support solution for growing businesses with moderate technical needs.

• Up to 20 support tickets per month
• Priority email and phone support with 8-hour response time
• Advanced troubleshooting and technical consultation
• Full access to knowledge base, documentation, and training materials
• Extended support hours (8 AM - 8 PM EST, Monday-Friday)
• Weekly support summary reports with detailed analytics
• Dedicated support agent assignment
• Custom account setup and configuration assistance
• Basic system monitoring and alert notifications
• Quarterly business review meetings

Perfect for businesses experiencing growth and requiring more comprehensive technical support.",
                new decimal(19.99)
            ),
            new ServicePlan
            (
                _guidGenerator.Create(),
                "Premium",
                @"Enterprise-grade support solution for businesses requiring maximum uptime and dedicated assistance.

• Unlimited support tickets with priority processing
• 24/7 phone, email, and live chat support with 2-hour response time
• Advanced technical consultation and strategic planning
• Full access to premium knowledge base, documentation, and exclusive training resources
• Round-the-clock support availability (24/7/365)
• Daily support summary reports with advanced analytics and insights
• Dedicated senior support engineer with direct contact
• Custom account setup, configuration, and optimization
• Advanced system monitoring with proactive issue detection
• Monthly business review meetings with strategic recommendations
• Custom integration support and API assistance
• Priority feature request consideration
• Dedicated account manager for relationship management
• Custom SLA agreements and performance guarantees

Designed for enterprise-level businesses requiring maximum support coverage and strategic technical partnership.",
                new decimal(29.99)
            )
        };

        await _servicePlanRepository.InsertManyAsync(servicePlans);

        return;
    }

    #endregion
}