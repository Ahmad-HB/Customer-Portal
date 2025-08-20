using Customer.Portal.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace Customer.Portal.Configurations;

public class EmailTemplateConfiguration : IEntityTypeConfiguration<EmailTemplate>
{
    public void Configure(EntityTypeBuilder<EmailTemplate> builder)
    {
        
        builder.ConfigureByConvention();
        
        builder.Property(x => x.TemplateType)
            .IsRequired();

        builder.Property(x => x.EmailType)
            .IsRequired();
        
        
        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(256);
        
        
        builder.Property(x => x.Format)
            .IsRequired()
            .HasMaxLength(256);
        
        builder.ToTable("EmailTemplates");
    }
}