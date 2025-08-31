using Customer.Portal.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace Customer.Portal.Configurations;

public class ServicePlanConfiguration : IEntityTypeConfiguration<ServicePlan>
{
    public void Configure(EntityTypeBuilder<ServicePlan> builder)
    {
        builder.ConfigureByConvention();

        builder.Property(x => x.Count);

        builder.Property(x => x.Name).IsRequired().HasMaxLength(256);
        
        builder.Property(x => x.Description);
        
        builder.Property(x => x.Price).HasColumnType("decimal(18,2)");
        
        builder.ToTable("ServicePlans");
    }
}