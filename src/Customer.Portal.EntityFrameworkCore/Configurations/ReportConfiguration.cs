using Customer.Portal.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace Customer.Portal.Configurations;

public class ReportConfiguration : IEntityTypeConfiguration<Report>
{
    public void Configure(EntityTypeBuilder<Report> builder)
    {
        builder.ConfigureByConvention();
        
        builder.HasOne(x => x.ReportTemplate)
            .WithMany()
            .HasForeignKey(x => x.ReportTemplateId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.Property(x => x.Subject)
            .IsRequired();

        builder.Property(x => x.Content);

        builder.Property(x => x.GeneratedAt)
            .IsRequired()
            .HasColumnType("date");

        builder.ToTable("Reports");
    }
}