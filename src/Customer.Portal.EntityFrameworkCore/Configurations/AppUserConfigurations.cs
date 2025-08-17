using Customer.Portal.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace Customer.Portal.Configurations;

public class AppUserConfigurations : IEntityTypeConfiguration<AppUser>
{
    public void Configure(EntityTypeBuilder<AppUser> builder)
    {
        builder.ConfigureByConvention();
        
        builder.Property(x => x.Email).IsRequired().HasMaxLength(128);
        
        builder.Property(x => x.Name).IsRequired().HasMaxLength(256);
        
        builder.Property(x => x.UserType).IsRequired();
        
        builder.Property(x => x.PhoneNumber).HasMaxLength(15);
        
        builder.Property(x => x.IsActive).IsRequired();
        
        builder.HasAlternateKey(x => x.Email);
        
        builder.HasOne(x => x.IdentityUser)
            .WithOne()
            .HasForeignKey<AppUser>(x => x.IdentityUserId)
            .IsRequired();
        
        builder.HasMany(x => x.SupportTickets)
            .WithOne(x => x.AppUser)
            .HasForeignKey(x => x.AppUserId)
            .OnDelete(DeleteBehavior.NoAction);
        
        builder.HasMany(x => x.UserServicePlans)
            .WithOne(x => x.AppUser)
            .HasForeignKey(x => x.AppUserId)
            .OnDelete(DeleteBehavior.NoAction);
        
        builder.ToTable("AppUsers");
    }
}