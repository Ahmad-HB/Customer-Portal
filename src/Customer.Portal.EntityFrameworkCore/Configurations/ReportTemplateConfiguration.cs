using Customer.Portal.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace Customer.Portal.Configurations;

public class ReportTemplateConfiguration : IEntityTypeConfiguration<ReportTemplate>
{
    public void Configure(EntityTypeBuilder<ReportTemplate> builder)
    {
        
        builder.ConfigureByConvention();

        builder.Property(x => x.TemplateType)
            .IsRequired();

        builder.Property(x => x.ReportType)
            .IsRequired();

        builder.Property(x => x.Name)
            .IsRequired();

        builder.Property(x => x.Format)
            .IsRequired();
        
        
        
        builder.ToTable("ReportTemplates");
    }
}