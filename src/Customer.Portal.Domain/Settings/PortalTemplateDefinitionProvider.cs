using Volo.Abp.TextTemplating;
using Volo.Abp.TextTemplating.Scriban;

namespace Customer.Portal.Settings;

public class PortalTemplateDefinitionProvider : TemplateDefinitionProvider
{
    public override void Define(ITemplateDefinitionContext context)
    {
        // Monthly Summary Report Template
        context.Add(
            new TemplateDefinition("MonthlySummaryReport")
                .WithVirtualFilePath("/Templates/MonthlySummaryReport.tpl",
                    isInlineLocalized: true)
                .WithScribanEngine()
        );

        // Technician Report Template
        context.Add(
            new TemplateDefinition("TechnicianReport")
                .WithVirtualFilePath("/Templates/TechnicianReport.tpl",
                    isInlineLocalized: true)
                .WithScribanEngine()
        );

        // Support Agent Report Template
        context.Add(
            new TemplateDefinition("SupportAgentReport")
                .WithVirtualFilePath("/Templates/SupportAgentReport.tpl",
                    isInlineLocalized: true)
                .WithScribanEngine()
        );

        // Support Agent with Technician Report Template
        context.Add(
            new TemplateDefinition("SupportAgentWithTechnicianReport")
                .WithVirtualFilePath("/Templates/SupportAgentWithTechnicianReport.tpl",
                    isInlineLocalized: true)
                .WithScribanEngine()
        );
    }
}