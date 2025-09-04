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
    
    
    public async Task SeedAsync(DataSeedContext context)
    {
        // Check if templates already exist
        if (await _emailTemplateRepository.GetCountAsync() > 0)
        {
            return;
        }

        // Seed email templates
        var templates = new[]
        {
            new EmailTemplate(
                _guidGenerator.Create(),
                Enums.EmailType.TicketCreated,
                Enums.TemplateType.Email,
                "Ticket Created Notification",
                "<!doctype html>\n<html>\n<head>\n  <meta charset=\"utf-8\">\n  <title>Ticket Created</title>\n</head>\n<body style=\"margin:0; background:#f5f7fb; font-family:Arial, Helvetica, sans-serif;\">\n  <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\">\n    <tr>\n      <td align=\"center\" style=\"padding:24px;\">\n        <table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#ffffff; border-radius:12px; overflow:hidden;\">\n          <tr>\n            <td align=\"center\" style=\"background:#2563eb; color:#ffffff; padding:24px; font-size:22px; font-weight:bold;\">\n              🎫 Ticket Created\n            </td>\n          </tr>\n          <tr>\n            <td style=\"padding:24px; color:#111827; font-size:16px; line-height:24px;\">\n              <p style=\"margin:0 0 12px;\">Hello {{ UserName }},</p>\n              <p style=\"margin:0 0 12px;\">Your support ticket has been successfully created.</p>\n              <p style=\"margin:0 0 8px;\">Ticket ID: <strong>{{ TicketId }}</strong></p>\n              <p style=\"margin:0 0 8px;\">Title: <strong>{{ TicketName }}</strong></p>\n              <p style=\"margin:0;\">Description: {{ TicketDescription }}</p>\n            </td>\n          </tr>\n          <tr>\n            <td align=\"center\" style=\"padding:24px;\">\n              <a href=\"{{ ActionUrl }}\" \n                 style=\"display:inline-block; background:#2563eb; color:#ffffff; padding:12px 24px; border-radius:6px; font-weight:bold; text-decoration:none;\">\n                View Ticket\n              </a>\n            </td>\n          </tr>\n        </table>\n        <p style=\"font-size:12px; color:#6b7280; margin-top:16px;\">© 2025 Your Company</p>\n      </td>\n    </tr>\n  </table>\n</body>\n</html>\n"
            ),
            new EmailTemplate(
                _guidGenerator.Create(),
                Enums.EmailType.TicketUpdated,
                Enums.TemplateType.Email,
                "Ticket Updated Notification",
                "<!doctype html>\n<html>\n<head>\n  <meta charset=\"utf-8\">\n  <title>Ticket Updated</title>\n</head>\n<body style=\"margin:0; background:#f5f7fb; font-family:Arial, Helvetica, sans-serif;\">\n  <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\">\n    <tr>\n      <td align=\"center\" style=\"padding:24px;\">\n        <table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#ffffff; border-radius:12px; overflow:hidden;\">\n          <!-- Header -->\n          <tr>\n            <td align=\"center\" style=\"background:#f97316; color:#ffffff; padding:24px; font-size:22px; font-weight:bold;\">\n              🔔 Ticket Updated\n            </td>\n          </tr>\n\n          <!-- Body -->\n          <tr>\n            <td style=\"padding:24px; color:#111827; font-size:16px; line-height:24px;\">\n              <p style=\"margin:0 0 12px;\">Hello {{ UserName }},</p>\n              <p style=\"margin:0 0 12px;\">Your support ticket <strong>#{{ TicketId }}</strong> has been updated.</p>\n\n              <!-- Ticket Title -->\n              <p style=\"margin:0 0 8px;\">Title: <strong>{{ TicketName }}</strong></p>\n\n              <!-- Ticket Update Info -->\n              <p style=\"margin:0 0 8px;\">Update Type: <strong>{{ UpdateType }}</strong></p>\n              <p style=\"margin:0 0 8px;\">Previous Value: <strong>{{ PreviousValue }}</strong></p>\n              <p style=\"margin:0;\">New Value: <strong>{{ NewValue }}</strong></p>\n            </td>\n          </tr>\n\n          <!-- CTA -->\n          <tr>\n            <td align=\"center\" style=\"padding:24px;\">\n              <a href=\"{{ ActionUrl }}\" \n                 style=\"display:inline-block; background:#f97316; color:#ffffff; padding:12px 24px; border-radius:6px; font-weight:bold; text-decoration:none;\">\n                View Ticket\n              </a>\n            </td>\n          </tr>\n        </table>\n\n        <!-- Footer -->\n        <p style=\"font-size:12px; color:#6b7280; margin-top:16px;\">\n          © 2025 Your Company\n        </p>\n      </td>\n    </tr>\n  </table>\n</body>\n</html>\n"
            ),
            new EmailTemplate(
                _guidGenerator.Create(),
                Enums.EmailType.CustomerRegistration,
                Enums.TemplateType.Email,
                "Welcome Email",
                "<!doctype html>\n<html>\n<head>\n  <meta charset=\"utf-8\">\n  <title>Welcome</title>\n</head>\n<body style=\"margin:0; background:#f5f7fb; font-family:Arial, Helvetica, sans-serif;\">\n  <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\">\n    <tr>\n      <td align=\"center\" style=\"padding:24px;\">\n        <table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#ffffff; border-radius:12px; overflow:hidden;\">\n          <tr>\n            <td align=\"center\" style=\"background:#7c3aed; color:#ffffff; padding:24px; font-size:22px; font-weight:bold;\">\n              🎉 Welcome Aboard!\n            </td>\n          </tr>\n          <tr>\n            <td style=\"padding:24px; color:#111827; font-size:16px; line-height:24px;\">\n              <p style=\"margin:0 0 12px;\">Hello {{ UserName }},</p>\n              <p style=\"margin:0 0 12px;\">Your account has been successfully created. We're excited to have you with us!</p>\n              <p style=\"margin:0 0 8px;\">Username / Email: <strong>{{ UserEmail }}</strong></p>\n              <p style=\"margin:0;\">You can now log in and start using our services.</p>\n            </td>\n          </tr>\n          <tr>\n            <td align=\"center\" style=\"padding:24px;\">\n              <a href=\"{{ LoginUrl }}\" \n                 style=\"display:inline-block; background:#7c3aed; color:#ffffff; padding:12px 24px; border-radius:6px; font-weight:bold; text-decoration:none;\">\n                Go to Dashboard\n              </a>\n            </td>\n          </tr>\n        </table>\n        <p style=\"font-size:12px; color:#6b7280; margin-top:16px;\">\n          Need help? Visit our <a href=\"{{ HelpCenterUrl }}\" style=\"color:#7c3aed; text-decoration:underline;\">Help Center</a>.\n        </p>\n      </td>\n    </tr>\n  </table>\n</body>\n</html>\n"
            ),
            new EmailTemplate(
                _guidGenerator.Create(),
                Enums.EmailType.Confirmation,
                Enums.TemplateType.Email,
                "Email Confirmation",
                "<!doctype html>\n<html>\n<head>\n  <meta charset=\"utf-8\">\n  <title>Confirmation</title>\n</head>\n<body style=\"margin:0; background:#f5f7fb; font-family:Arial, Helvetica, sans-serif;\">\n  <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\">\n    <tr>\n      <td align=\"center\" style=\"padding:24px;\">\n        <table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#ffffff; border-radius:12px; overflow:hidden;\">\n          <tr>\n            <td align=\"center\" style=\"background:#16a34a; color:#ffffff; padding:24px; font-size:22px; font-weight:bold;\">\n              ✅ Confirmation Required\n            </td>\n          </tr>\n          <tr>\n            <td style=\"padding:24px; color:#111827; font-size:16px; line-height:24px;\">\n              <p style=\"margin:0 0 12px;\">Hello {{ UserName }},</p>\n              <p style=\"margin:0 0 12px;\">We received a request for the following action:</p>\n              <p style=\"margin:0 0 8px;\">Action: <strong>{{ ActionType }}</strong></p>\n              <p style=\"margin:0 0 8px;\">Details: <strong>{{ ActionDetails }}</strong></p>\n              <p style=\"margin:0;\">Please confirm if you would like to proceed.</p>\n            </td>\n          </tr>\n          <tr>\n            <td align=\"center\" style=\"padding:24px;\">\n              <a href=\"{{ ConfirmationUrl }}\" \n                 style=\"display:inline-block; background:#16a34a; color:#ffffff; padding:12px 24px; border-radius:6px; font-weight:bold; text-decoration:none;\">\n                Confirm\n              </a>\n            </td>\n          </tr>\n          <tr>\n            <td align=\"center\" style=\"padding:0 24px 24px;\">\n              <a href=\"{{ CancelUrl }}\" \n                 style=\"display:inline-block; margin-top:12px; background:#e11d48; color:#ffffff; padding:12px 24px; border-radius:6px; font-weight:bold; text-decoration:none;\">\n                Cancel\n              </a>\n            </td>\n          </tr>\n        </table>\n        <p style=\"font-size:12px; color:#6b7280; margin-top:16px;\">If this wasn't you, you can safely ignore this email.</p>\n      </td>\n    </tr>\n  </table>\n</body>\n</html>\n"
            )
        };

        foreach (var template in templates)
        {
            await _emailTemplateRepository.InsertAsync(template);
        }
    }
}