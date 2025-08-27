using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Customer.Portal.Entities;
using Customer.Portal.Enums;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Guids;

namespace Customer.Portal.DbMigrator.DataSeeders;

public class ReportTemplateDataSeedContributor : IDataSeedContributor, ITransientDependency
{
    #region Fields

    private readonly IRepository<ReportTemplate, Guid> _reportTemplateRepository;
    private readonly IGuidGenerator _guidGenerator;

    #endregion


    #region Ctor

    public ReportTemplateDataSeedContributor(IGuidGenerator guidGenerator,
        IRepository<ReportTemplate, Guid> reportTemplateRepository)
    {
        _guidGenerator = guidGenerator;
        _reportTemplateRepository = reportTemplateRepository;
    }

    #endregion


    public async Task SeedAsync(DataSeedContext context)
    {
        if (await _reportTemplateRepository.GetCountAsync() > 0)
        {
            return;
        }
        //
        //
        // var reportTemplates = new List<ReportTemplate>
        // {
        //     new ReportTemplate(
        //         _guidGenerator.Create(),
        //         TemplateType.Report,
        //         ReportTypes.CustomerReport,
        //         "Customer Report",
        //         "Hi {CustomerName},\n\nThis is your report for the month of {Month}.\n\nBest regards,\nCustomer Portal Team"
        //     ),
        //     new ReportTemplate(
        //         _guidGenerator.Create(),
        //         TemplateType.Report,
        //         ReportTypes.TicketReport,
        //         "Ticket Report",
        //         "Hi {CustomerName},\n\nThis is your ticket report for the month of {Month}.\n\nBest regards,\nCustomer Portal Team"
        //     ),
        //     new ReportTemplate(
        //         _guidGenerator.Create(),
        //         TemplateType.Report,
        //         ReportTypes.EmailNotificationReport,
        //         "Email Notification Report",
        //         "Hi {CustomerName},\n\nThis is your email notification report for the month of {Month}.\n\nBest regards,\nCustomer Portal Team"
        //     ),
        //     new ReportTemplate(
        //         _guidGenerator.Create(),
        //         TemplateType.Report,
        //         ReportTypes.MonthlySummaryReport,
        //         "Monthly Summary Report",
        //         "Hi {CustomerName},\n\nThis is your monthly summary report for the month of {Month}.\n\nBest regards,\nCustomer Portal Team"
        //     )
        // };
        //
        // await _reportTemplateRepository.InsertManyAsync(reportTemplates);

        await _reportTemplateRepository
            .InsertAsync(new ReportTemplate
            (
                _guidGenerator.Create(),
                TemplateType.Report,
                ReportTypes.MonthlySummaryReport,
                "Monthly Summary Report",
                @"
                <h1>Monthly Summary Report</h1>
                <p>Report Period: {{StartDate}} to {{EndDate}}</p>
                <ul>
                    <li>Total Tickets: {{TotalTickets}}</li>
                    <li>Resolved Tickets: {{ResolvedTickets}}</li>
                    <li>In Progress Tickets: {{InProgressTickets}}</li>
                    <li>Closed Tickets: {{ClosedTickets}}</li>
                </ul>
                <p>Generated At: {{Now}}</p>"
            ));
    }
}