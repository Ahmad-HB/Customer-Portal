using Customer.Portal.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace Customer.Portal.Configurations;

public class ServicePlanConfigurations : IEntityTypeConfiguration<ServicePlan>
{
    public void Configure(EntityTypeBuilder<ServicePlan> builder)
    {
        builder.ConfigureByConvention();

        builder.Property(x => x.Name).IsRequired().HasMaxLength(256);
        
        builder.Property(x => x.Description).HasMaxLength(1024);
        
        builder.Property(x => x.Price).HasColumnType("decimal(18,2)");

        builder.Property(x => x.IsActive).IsRequired();
        
        builder.ToTable("ServicePlans");
    }
}