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

        var reportTemplates = new List<ReportTemplate>
        {
            // Technician Report Template
            new ReportTemplate(
                _guidGenerator.Create(),
                TemplateType.Report,
                ReportTypes.TechnicianReport,
                "Technician Work Report",
                @"<!DOCTYPE html>
<html>
<head>
    <meta charset=""UTF-8"">
    <title>Technician Work Report</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f8f9fa;
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background-color: white; 
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 30px; 
            text-align: center;
        }
        .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 300;
        }
        .header .subtitle { 
            margin-top: 10px; 
            opacity: 0.9; 
            font-size: 16px;
        }
        .content { 
            padding: 30px;
        }
        .info-section { 
            background-color: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 25px;
            border-left: 4px solid #667eea;
        }
        .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin-top: 15px;
        }
        .info-item { 
            background-color: white; 
            padding: 15px; 
            border-radius: 6px; 
            border: 1px solid #e9ecef;
        }
        .info-item strong { 
            color: #667eea; 
            display: block; 
            margin-bottom: 5px;
        }
        .status-resolved { color: #28a745; font-weight: bold; }
        .status-pending { color: #ffc107; font-weight: bold; }
        .status-critical { color: #dc3545; font-weight: bold; }
        .footer { 
            background-color: #6c757d; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>Technician Work Report</h1>
            <div class=""subtitle"">Professional Service Summary</div>
        </div>
        
        <div class=""content"">
            <div class=""info-section"">
                <h2>Technician Information</h2>
                <div class=""info-grid"">
                    <div class=""info-item"">
                        <strong>Technician Name</strong>
                        {{ TechnicianName }}
                    </div>
                    <div class=""info-item"">
                        <strong>Report Date</strong>
                        {{ date.now }}
                    </div>
                </div>
            </div>

            <div class=""info-section"">
                <h2>Ticket Details</h2>
                <div class=""info-grid"">
                    <div class=""info-item"">
                        <strong>Ticket ID</strong>
                        #{{ TicketId }}
                    </div>
                    <div class=""info-item"">
                        <strong>Status</strong>
                        <span class=""status-{{ Status }}"">{{ Status }}</span>
                    </div>
                    <div class=""info-item"">
                        <strong>Customer</strong>
                        {{ CustomerName }}
                    </div>
                    <div class=""info-item"">
                        <strong>Created Date</strong>
                        {{ CreatedAt }}
                    </div>
                </div>
            </div>

            <div class=""info-section"">
                <h2>Issue Description</h2>
                <p>{{ IssueDescription }}</p>
            </div>

            {{ if ResolvedAt }}
            <div class=""info-section"">
                <h2>Resolution Information</h2>
                <div class=""info-grid"">
                    <div class=""info-item"">
                        <strong>Resolved Date</strong>
                        {{ ResolvedAt }}
                    </div>
                    <div class=""info-item"">
                        <strong>Resolution Time</strong>
                        Resolved
                    </div>
                </div>
            </div>
            {{ end }}
        </div>
        
        <div class=""footer"">
            <p>&copy; 2025 Customer Portal. All rights reserved.</p>
            <p>Generated on {{ date.now }}</p>
        </div>
    </div>
</body>
</html>"
            ),

            // Support Agent Report Template
            new ReportTemplate(
                _guidGenerator.Create(),
                TemplateType.Report,
                ReportTypes.SupportAgentTicketReport,
                "Support Agent Report",
                @"<!DOCTYPE html>
<html>
<head>
    <meta charset=""UTF-8"">
    <title>Support Agent Report</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f8f9fa;
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background-color: white; 
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
            color: white; 
            padding: 30px; 
            text-align: center;
        }
        .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 300;
        }
        .header .subtitle { 
            margin-top: 10px; 
            opacity: 0.9; 
            font-size: 16px;
        }
        .content { 
            padding: 30px;
        }
        .info-section { 
            background-color: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 25px;
            border-left: 4px solid #28a745;
        }
        .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin-top: 15px;
        }
        .info-item { 
            background-color: white; 
            padding: 15px; 
            border-radius: 6px; 
            border: 1px solid #e9ecef;
        }
        .info-item strong { 
            color: #28a745; 
            display: block; 
            margin-bottom: 5px;
        }
        .status-resolved { color: #28a745; font-weight: bold; }
        .status-pending { color: #ffc107; font-weight: bold; }
        .status-critical { color: #dc3545; font-weight: bold; }
        .footer { 
            background-color: #6c757d; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>Support Agent Report</h1>
            <div class=""subtitle"">Customer Service Summary</div>
        </div>
        
        <div class=""content"">
            <div class=""info-section"">
                <h2>Support Agent Information</h2>
                <div class=""info-grid"">
                    <div class=""info-item"">
                        <strong>Agent Name</strong>
                        {{ SupportAgentName }}
                    </div>
                    <div class=""info-item"">
                        <strong>Report Date</strong>
                        {{ date.now }}
                    </div>
                </div>
            </div>

            <div class=""info-section"">
                <h2>Ticket Details</h2>
                <div class=""info-grid"">
                    <div class=""info-item"">
                        <strong>Ticket ID</strong>
                        #{{ TicketId }}
                    </div>
                    <div class=""info-item"">
                        <strong>Status</strong>
                        <span class=""status-{{ Status }}"">{{ Status }}</span>
                    </div>
                    <div class=""info-item"">
                        <strong>Customer</strong>
                        {{ CustomerName }}
                    </div>
                    <div class=""info-item"">
                        <strong>Created Date</strong>
                        {{ CreatedAt }}
                    </div>
                </div>
            </div>

            <div class=""info-section"">
                <h2>Issue Description</h2>
                <p>{{ IssueDescription }}</p>
            </div>

            {{ if ResolvedAt }}
            <div class=""info-section"">
                <h2>Resolution Information</h2>
                <div class=""info-grid"">
                    <div class=""info-item"">
                        <strong>Resolved Date</strong>
                        {{ ResolvedAt }}
                    </div>
                    <div class=""info-item"">
                        <strong>Resolution Time</strong>
                        Resolved
                    </div>
                </div>
            </div>
            {{ end }}
        </div>
        
        <div class=""footer"">
            <p>&copy; 2025 Customer Portal. All rights reserved.</p>
            <p>Generated on {{ date.now }}</p>
        </div>
    </div>
</body>
</html>"
            ),

            // Support Agent with Technician Report Template
            new ReportTemplate(
                _guidGenerator.Create(),
                TemplateType.Report,
                ReportTypes.SupportAgentWithTechnicianReport,
                "Support Agent with Technician Report",
                @"<!DOCTYPE html>
<html>
<head>
    <meta charset=""UTF-8"">
    <title>Support Agent with Technician Report</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f8f9fa;
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background-color: white; 
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%); 
            color: white; 
            padding: 30px; 
            text-align: center;
        }
        .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 300;
        }
        .header .subtitle { 
            margin-top: 10px; 
            opacity: 0.9; 
            font-size: 16px;
        }
        .content { 
            padding: 30px;
        }
        .info-section { 
            background-color: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 25px;
            border-left: 4px solid #6f42c1;
        }
        .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin-top: 15px;
        }
        .info-item { 
            background-color: white; 
            padding: 15px; 
            border-radius: 6px; 
            border: 1px solid #e9ecef;
        }
        .info-item strong { 
            color: #6f42c1; 
            display: block; 
            margin-bottom: 5px;
        }
        .status-resolved { color: #28a745; font-weight: bold; }
        .status-pending { color: #ffc107; font-weight: bold; }
        .status-critical { color: #dc3545; font-weight: bold; }
        .footer { 
            background-color: #6c757d; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            font-size: 14px;
        }
        .team-section {
            background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .team-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>Support Agent with Technician Report</h1>
            <div class=""subtitle"">Collaborative Service Summary</div>
        </div>
        
        <div class=""content"">
            <div class=""team-section"">
                <h2>Team Information</h2>
                <div class=""team-grid"">
                    <div class=""info-item"">
                        <strong>Support Agent</strong>
                        {{ SupportAgentName }}
                    </div>
                    <div class=""info-item"">
                        <strong>Technician</strong>
                        {{ TechnicianName }}
                    </div>
                </div>
            </div>

            <div class=""info-section"">
                <h2>Ticket Details</h2>
                <div class=""info-grid"">
                    <div class=""info-item"">
                        <strong>Ticket ID</strong>
                        #{{ TicketId }}
                    </div>
                    <div class=""info-item"">
                        <strong>Status</strong>
                        <span class=""status-{{ Status }}"">{{ Status }}</span>
                    </div>
                    <div class=""info-item"">
                        <strong>Customer</strong>
                        {{ CustomerName }}
                    </div>
                    <div class=""info-item"">
                        <strong>Created Date</strong>
                        {{ CreatedAt }}
                    </div>
                </div>
            </div>

            <div class=""info-section"">
                <h2>Issue Description</h2>
                <p>{{ IssueDescription }}</p>
            </div>

            {{ if ResolvedAt }}
            <div class=""info-section"">
                <h2>Resolution Information</h2>
                <div class=""info-grid"">
                    <div class=""info-item"">
                        <strong>Resolved Date</strong>
                        {{ ResolvedAt }}
                    </div>
                    <div class=""info-item"">
                        <strong>Resolution Time</strong>
                        Resolved
                    </div>
                </div>
            </div>
            {{ end }}
        </div>
        
        <div class=""footer"">
            <p>&copy; 2025 Customer Portal. All rights reserved.</p>
            <p>Generated on {{ date.now }}</p>
        </div>
    </div>
</body>
</html>"
            ),

            // Monthly Summary Report Template
            new ReportTemplate(
                _guidGenerator.Create(),
                TemplateType.Report,
                ReportTypes.MonthlySummaryReport,
                "Monthly Summary Report",
                @"<!DOCTYPE html>
<html>
<head>
    <meta charset=""UTF-8"">
    <title>Monthly Summary Report</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f8f9fa;
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background-color: white; 
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #fd7e14 0%, #ff6b35 100%); 
            color: white; 
            padding: 30px; 
            text-align: center;
        }
        .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 300;
        }
        .header .subtitle { 
            margin-top: 10px; 
            opacity: 0.9; 
            font-size: 16px;
        }
        .content { 
            padding: 30px;
        }
        .info-section { 
            background-color: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 25px;
            border-left: 4px solid #fd7e14;
        }
        .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin-top: 15px;
        }
        .info-item { 
            background-color: white; 
            padding: 15px; 
            border-radius: 6px; 
            border: 1px solid #e9ecef;
        }
        .info-item strong { 
            color: #fd7e14; 
            display: block; 
            margin-bottom: 5px;
        }
        .metric-card {
            background: linear-gradient(135deg, #fd7e14 0%, #ff6b35 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 20px;
        }
        .metric-value {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .metric-label {
            font-size: 14px;
            opacity: 0.9;
        }
        .footer { 
            background-color: #6c757d; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>Monthly Summary Report</h1>
            <div class=""subtitle"">Executive Dashboard</div>
        </div>
        
        <div class=""content"">
            <div class=""info-section"">
                <h2>Report Period</h2>
                <div class=""info-grid"">
                    <div class=""info-item"">
                        <strong>Start Date</strong>
                        {{ StartDate }}
                    </div>
                    <div class=""info-item"">
                        <strong>End Date</strong>
                        {{ EndDate }}
                    </div>
                </div>
            </div>

            <div class=""metric-card"">
                <div class=""metric-value"">{{ TotalTickets }}</div>
                <div class=""metric-label"">Total Tickets</div>
            </div>

            <div class=""info-section"">
                <h2>Ticket Statistics</h2>
                <div class=""info-grid"">
                    <div class=""info-item"">
                        <strong>Resolved Tickets</strong>
                        {{ ResolvedTickets }}
                    </div>
                    <div class=""info-item"">
                        <strong>In Progress</strong>
                        {{ InProgressTickets }}
                    </div>
                    <div class=""info-item"">
                        <strong>Closed Tickets</strong>
                        {{ ClosedTickets }}
                    </div>
                    <div class=""info-item"">
                        <strong>Resolution Rate</strong>
                        {{ ResolvedTickets }}/{{ TotalTickets }}
                    </div>
                </div>
            </div>

            <div class=""info-section"">
                <h2>Performance Metrics</h2>
                <p>This report provides a comprehensive overview of support ticket activities for the specified period. 
                The data shows the distribution of tickets across different statuses and provides insights into 
                the overall performance of the support team.</p>
            </div>
        </div>
        
        <div class=""footer"">
            <p>&copy; 2025 Customer Portal. All rights reserved.</p>
            <p>Generated on {{ date.now }}</p>
        </div>
    </div>
</body>
</html>"
            )
        };

        await _reportTemplateRepository.InsertManyAsync(reportTemplates);
    }
}