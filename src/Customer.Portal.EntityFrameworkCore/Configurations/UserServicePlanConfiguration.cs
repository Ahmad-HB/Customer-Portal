using Customer.Portal.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace Customer.Portal.Configurations;

public class UserServicePlanConfiguration : IEntityTypeConfiguration<UserServicePlan>
{
    public void Configure(EntityTypeBuilder<UserServicePlan> builder)
    {
        builder.ConfigureByConvention();
        
        builder.Property(x => x.IsActive).IsRequired();
        
        builder.Property(x => x.IsSuspended).IsRequired();
        
        builder.Property(x => x.SuspensionReason).HasMaxLength(512);
        

        builder.Property(x => x.AppUserId)
            .IsRequired();

        builder.Property(x => x.ServicePlanId)
            .IsRequired();

        builder.Property(x => x.StartDate)
            .IsRequired();

        builder.Property(x => x.EndDate)
            .IsRequired();

        builder.HasOne(x => x.AppUser)
            .WithMany(x => x.UserServicePlans)
            .HasForeignKey(x => x.AppUserId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(x => x.ServicePlan)
            .WithMany()
            .HasForeignKey(x => x.ServicePlanId)
            .OnDelete(DeleteBehavior.NoAction);
        
        builder.ToTable("UserServicePlans");
    }
}