using System;
using System.Threading.Tasks;
using Customer.Portal.Entities;
using Customer.Portal.Enums;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Guids;
using Volo.Abp.Uow;

namespace Customer.Portal.Data;

public class TemplateDataSeedContributor : IDataSeedContributor, ITransientDependency
{
    private readonly IRepository<EmailTemplate, Guid> _emailTemplateRepository;
    private readonly IRepository<ReportTemplate, Guid> _reportTemplateRepository;
    private readonly IGuidGenerator _guidGenerator;

    public TemplateDataSeedContributor(
        IRepository<EmailTemplate, Guid> emailTemplateRepository,
        IRepository<ReportTemplate, Guid> reportTemplateRepository,
        IGuidGenerator guidGenerator)
    {
        _emailTemplateRepository = emailTemplateRepository;
        _reportTemplateRepository = reportTemplateRepository;
        _guidGenerator = guidGenerator;
    }

    // [UnitOfWork]
    public async Task SeedAsync(DataSeedContext context)
    {
        // await SeedEmailTemplatesAsync();
        // await SeedReportTemplatesAsync();
        return;
        
    }

//     private async Task SeedEmailTemplatesAsync()
//     {
//         // Welcome Email Template
//         await CreateEmailTemplateIfNotExistsAsync(
//             EmailType.CustomerRegistration,
//             "Welcome Email",
//             @"<!DOCTYPE html>
// <html>
// <head>
//     <title>Welcome to Customer Portal</title>
//     <style>
//         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//         .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//         .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
//         .content { padding: 20px; background-color: #f8f9fa; }
//         .footer { background-color: #6c757d; color: white; padding: 10px; text-align: center; font-size: 12px; }
//     </style>
// </head>
// <body>
//     <div class=""container"">
//         <div class=""header"">
//             <h1>Welcome to Customer Portal!</h1>
//         </div>
//         <div class=""content"">
//             <h2>Hello {{ user_name }}!</h2>
//             <p>Thank you for registering with our Customer Portal. We're excited to have you on board.</p>
//             <p>Your account details:</p>
//             <ul>
//                 <li><strong>Username:</strong> {{ user_name }}</li>
//                 <li><strong>Email:</strong> {{ email }}</li>
//                 <li><strong>Registration Date:</strong> {{ registration_date | date.to_string '%Y-%m-%d' }}</li>
//             </ul>
//             <p>{{ welcome_message }}</p>
//             <p>If you have any questions, please don't hesitate to contact our support team.</p>
//         </div>
//         <div class=""footer"">
//             <p>&copy; {{ date.now | date.to_string '%Y' }} Customer Portal. All rights reserved.</p>
//         </div>
//     </div>
// </body>
// </html>"
//         );
//
//         // Ticket Created Email Template
//         await CreateEmailTemplateIfNotExistsAsync(
//             EmailType.TicketCreated,
//             "Ticket Created Notification",
//             @"<!DOCTYPE html>
// <html>
// <head>
//     <title>Support Ticket Created</title>
//     <style>
//         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//         .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//         .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
//         .content { padding: 20px; background-color: #f8f9fa; }
//         .ticket-info { background-color: white; padding: 15px; border-left: 4px solid #28a745; margin: 15px 0; }
//         .priority-high { border-left-color: #dc3545; }
//         .priority-critical { border-left-color: #ff0000; }
//     </style>
// </head>
// <body>
//     <div class=""container"">
//         <div class=""header"">
//             <h1>Support Ticket Created</h1>
//         </div>
//         <div class=""content"">
//             <h2>Hello {{ customer_name }}!</h2>
//             <p>Your support ticket has been successfully created and assigned ticket ID: <strong>{{ ticket_id }}</strong></p>
//             
//             <div class=""ticket-info {{ if priority == 'High' }}priority-high{{ elsif priority == 'Critical' }}priority-critical{{ end }}"">
//                 <h3>Ticket Details:</h3>
//                 <ul>
//                     <li><strong>Subject:</strong> {{ subject }}</li>
//                     <li><strong>Priority:</strong> {{ priority }}</li>
//                     <li><strong>Status:</strong> {{ status }}</li>
//                     <li><strong>Created At:</strong> {{ created_at | date.to_string '%Y-%m-%d %H:%M' }}</li>
//                     {{ if assigned_agent }}
//                     <li><strong>Assigned Agent:</strong> {{ assigned_agent }}</li>
//                     {{ end }}
//                 </ul>
//                 <p><strong>Description:</strong></p>
//                 <p>{{ description }}</p>
//             </div>
//             
//             <p>We'll keep you updated on the progress of your ticket. You can track its status in your customer portal.</p>
//         </div>
//         <div class=""footer"">
//             <p>Customer Portal Support Team</p>
//         </div>
//     </div>
// </body>
// </html>"
//         );
//
//         // Ticket Updated Email Template
//         await CreateEmailTemplateIfNotExistsAsync(
//             EmailType.TicketUpdated,
//             "Ticket Updated Notification",
//             @"<!DOCTYPE html>
// <html>
// <head>
//     <title>Support Ticket Updated</title>
//     <style>
//         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//         .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//         .header { background-color: #ffc107; color: #212529; padding: 20px; text-align: center; }
//         .content { padding: 20px; background-color: #f8f9fa; }
//         .update-info { background-color: white; padding: 15px; border-left: 4px solid #ffc107; margin: 15px 0; }
//     </style>
// </head>
// <body>
//     <div class=""container"">
//         <div class=""header"">
//             <h1>Ticket Update</h1>
//         </div>
//         <div class=""content"">
//             <h2>Hello {{ customer_name }}!</h2>
//             <p>Your support ticket <strong>{{ ticket_id }}</strong> has been updated.</p>
//             
//             <div class=""update-info"">
//                 <h3>Update Details:</h3>
//                 <ul>
//                     <li><strong>Subject:</strong> {{ subject }}</li>
//                     <li><strong>New Status:</strong> {{ new_status }}</li>
//                     {{ if old_status != new_status }}
//                     <li><strong>Previous Status:</strong> {{ old_status }}</li>
//                     {{ end }}
//                     <li><strong>Updated At:</strong> {{ updated_at | date.to_string '%Y-%m-%d %H:%M' }}</li>
//                     {{ if updated_by }}
//                     <li><strong>Updated By:</strong> {{ updated_by }}</li>
//                     {{ end }}
//                 </ul>
//                 
//                 {{ if comment }}
//                 <p><strong>Latest Comment:</strong></p>
//                 <p>{{ comment }}</p>
//                 {{ end }}
//             </div>
//             
//             <p>You can view the full ticket details in your customer portal.</p>
//         </div>
//         <div class=""footer"">
//             <p>Customer Portal Support Team</p>
//         </div>
//     </div>
// </body>
// </html>"
//         );
//
//         // Monthly Summary Email Template
//         await CreateEmailTemplateIfNotExistsAsync(
//             EmailType.MonthlySummary,
//             "Monthly Summary Report",
//             @"<!DOCTYPE html>
// <html>
// <head>
//     <title>Monthly Summary</title>
//     <style>
//         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//         .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//         .header { background-color: #6f42c1; color: white; padding: 20px; text-align: center; }
//         .content { padding: 20px; background-color: #f8f9fa; }
//         .summary-section { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
//         .metric { display: inline-block; background-color: #e9ecef; padding: 10px; margin: 5px; border-radius: 3px; }
//     </style>
// </head>
// <body>
//     <div class=""container"">
//         <div class=""header"">
//             <h1>Monthly Summary - {{ month_name }} {{ year }}</h1>
//         </div>
//         <div class=""content"">
//             <h2>Hello {{ customer_name }}!</h2>
//             <p>Here's your activity summary for {{ month_name }} {{ year }}:</p>
//             
//             <div class=""summary-section"">
//                 <h3>Support Tickets</h3>
//                 <div class=""metric"">Total Tickets: <strong>{{ total_tickets }}</strong></div>
//                 <div class=""metric"">Resolved: <strong>{{ resolved_tickets }}</strong></div>
//                 <div class=""metric"">Open: <strong>{{ open_tickets }}</strong></div>
//             </div>
//             
//             <div class=""summary-section"">
//                 <h3>Service Plans</h3>
//                 <div class=""metric"">Active Plans: <strong>{{ active_plans }}</strong></div>
//                 <div class=""metric"">Total Usage: <strong>{{ total_usage }}</strong></div>
//             </div>
//             
//             {{ if recommendations }}
//             <div class=""summary-section"">
//                 <h3>Recommendations</h3>
//                 {{ for recommendation in recommendations }}
//                 <p>• {{ recommendation }}</p>
//                 {{ end }}
//             </div>
//             {{ end }}
//         </div>
//         <div class=""footer"">
//             <p>Customer Portal Team</p>
//         </div>
//     </div>
// </body>
// </html>"
//         );
//     }
//
//     private async Task SeedReportTemplatesAsync()
//     {
//         // Ticket Report Template
//         await CreateReportTemplateIfNotExistsAsync(
//             ReportTypes.TicketReport,
//             "Support Ticket Report",
//             @"# Support Ticket Report
// **Report Period:** {{ start_date | date.to_string '%Y-%m-%d' }} to {{ end_date | date.to_string '%Y-%m-%d' }}
// **Generated On:** {{ date.now | date.to_string '%Y-%m-%d %H:%M:%S' }}
//
// ## Summary Statistics
// - **Total Tickets:** {{ total_tickets }}
// - **Open Tickets:** {{ open_tickets }}
// - **In Progress:** {{ in_progress_tickets }}
// - **Resolved Tickets:** {{ resolved_tickets }}
// - **Closed Tickets:** {{ closed_tickets }}
// - **Average Resolution Time:** {{ average_resolution_time | math.round 2 }} hours
//
// ## Priority Breakdown
// - **Critical:** {{ critical_tickets }}
// - **High:** {{ high_priority_tickets }}
// - **Medium:** {{ medium_priority_tickets }}
// - **Low:** {{ low_priority_tickets }}
//
// ## Detailed Ticket List
// {{ for ticket in tickets }}
// ### Ticket #{{ ticket.id }}
// - **Subject:** {{ ticket.subject }}
// - **Status:** {{ ticket.status }}
// - **Priority:** {{ ticket.priority }}
// - **Created:** {{ ticket.created_at | date.to_string '%Y-%m-%d %H:%M' }}
// - **Customer:** {{ ticket.customer_name }}
// {{ if ticket.resolved_at }}
// - **Resolved:** {{ ticket.resolved_at | date.to_string '%Y-%m-%d %H:%M' }}
// {{ end }}
//
// ---
// {{ end }}"
//         );
//
//         // Customer Report Template
//         await CreateReportTemplateIfNotExistsAsync(
//             ReportTypes.CustomerReport,
//             "Customer Activity Report",
//             @"# Customer Activity Report
// **Report Period:** {{ start_date | date.to_string '%Y-%m-%d' }} to {{ end_date | date.to_string '%Y-%m-%d' }}
// **Generated On:** {{ date.now | date.to_string '%Y-%m-%d %H:%M:%S' }}
//
// ## Summary Statistics
// - **Total Customers:** {{ total_customers }}
// - **Active Customers:** {{ active_customers }}
// - **Inactive Customers:** {{ inactive_customers }}
// - **New Customers This Period:** {{ new_customers_this_period }}
//
// ## Customer List
// {{ for customer in customers }}
// ### {{ customer.name }}
// - **Email:** {{ customer.email }}
// - **Phone:** {{ customer.phone_number }}
// - **Status:** {{ if customer.is_active }}Active{{ else }}Inactive{{ end }}
// - **User Type:** {{ customer.user_type }}
// - **Registration Date:** {{ customer.creation_time | date.to_string '%Y-%m-%d' }}
//
// ---
// {{ end }}"
//         );
//
//         // Email Notification Report Template
//         await CreateReportTemplateIfNotExistsAsync(
//             ReportTypes.EmailNotificationReport,
//             "Email Notification Report",
//             @"# Email Notification Report
// **Report Period:** {{ start_date | date.to_string '%Y-%m-%d' }} to {{ end_date | date.to_string '%Y-%m-%d' }}
// **Generated On:** {{ date.now | date.to_string '%Y-%m-%d %H:%M:%S' }}
//
// ## Summary Statistics
// - **Total Emails Sent:** {{ total_emails }}
// - **Successful Deliveries:** {{ successful_emails }}
// - **Failed Deliveries:** {{ failed_emails }}
// - **Success Rate:** {{ success_rate | math.round 2 }}%
//
// ## Email Breakdown by Type
// {{ for email_type in email_types }}
// - **{{ email_type.name }}:** {{ email_type.count }} emails
// {{ end }}
//
// ## Failed Email Details
// {{ if failed_emails > 0 }}
// {{ for email in emails }}
// {{ if !email.is_success }}
// ### Failed Email
// - **Recipient:** {{ email.email_address }}
// - **Subject:** {{ email.subject }}
// - **Sent At:** {{ email.sent_at | date.to_string '%Y-%m-%d %H:%M' }}
// - **Error:** {{ email.error_message }}
//
// ---
// {{ end }}
// {{ end }}
// {{ else }}
// No failed emails in this period.
// {{ end }}"
//         );
//
//         // Monthly Summary Report Template
//         await CreateReportTemplateIfNotExistsAsync(
//             ReportTypes.MonthlySummaryReport,
//             "Monthly Summary Report",
//             @"# Monthly Summary Report
// **Month:** {{ month }} {{ year }}
// **Generated On:** {{ date.now | date.to_string '%Y-%m-%d %H:%M:%S' }}
//
// ## Overview
// This report provides a comprehensive summary of all activities for the specified month.
//
// ## Ticket Summary
// {{ with ticket_summary }}
// - **Total Tickets:** {{ total_tickets }}
// - **Open:** {{ open_tickets }}
// - **In Progress:** {{ in_progress_tickets }}
// - **Resolved:** {{ resolved_tickets }}
// - **Closed:** {{ closed_tickets }}
// - **Average Resolution Time:** {{ average_resolution_time | math.round 2 }} hours
// {{ end }}
//
// ## Customer Summary
// {{ with customer_summary }}
// - **Total Customers:** {{ total_customers }}
// - **Active:** {{ active_customers }}
// - **New This Month:** {{ new_customers_this_period }}
// {{ end }}
//
// ## Email Summary
// {{ with email_summary }}
// - **Total Emails Sent:** {{ total_emails }}
// - **Success Rate:** {{ success_rate | math.round 2 }}%
// - **Failed Emails:** {{ failed_emails }}
// {{ end }}
//
// ## Key Metrics
// - **Customer Satisfaction:** Based on resolved tickets and feedback
// - **Response Time:** Average first response time
// - **Resolution Rate:** Percentage of tickets resolved within SLA"
//         );
//     }
//
//     private async Task CreateEmailTemplateIfNotExistsAsync(EmailType emailType, string name, string format)
//     {
//         if (await _emailTemplateRepository.FirstOrDefaultAsync(x => x.EmailType == emailType) != null)
//             return;
//
//         var template = new EmailTemplate
//         (
//             _guidGenerator.Create(),
//             emailType,
//             TemplateType.Email,
//             name,
//             format
//         );
//
//         await _emailTemplateRepository.InsertAsync(template);
//     }
//
//     private async Task CreateReportTemplateIfNotExistsAsync(ReportTypes reportType, string name, string format)
//     {
//         if (await _reportTemplateRepository.FirstOrDefaultAsync(x => x.ReportType == reportType) != null)
//             return;
//
//         var template = new ReportTemplate(
//             _guidGenerator.Create(),
//             TemplateType.Report,
//             reportType,
//             name,
//             format
//         );
//
//         await _reportTemplateRepository.InsertAsync(template);
//     }
}