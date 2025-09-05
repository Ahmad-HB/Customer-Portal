using Customer.Portal.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace Customer.Portal.Configurations;

public class SupportTicketConfiguration : IEntityTypeConfiguration<SupportTicket>
{
    public void Configure(EntityTypeBuilder<SupportTicket> builder)
    {
        builder.ConfigureByConvention();
        
        builder.Property(x => x.Subject)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(x => x.Description)
            .IsRequired()
            .HasMaxLength(1024);

        builder.Property(x => x.Status)
            .IsRequired();

        builder.Property(x => x.Priority);

        builder.Property(x => x.CreatedAt)
            .IsRequired()
            .HasColumnType("date");
        
        builder.Property(x => x.ResolvedAt)
            .HasColumnType("date");

        builder.HasOne(x => x.AppUser)
            .WithMany(x => x.SupportTickets)
            .HasForeignKey(x => x.AppUserId)
            .OnDelete(DeleteBehavior.NoAction);
        
        builder.HasOne(x => x.Supportagent)
            .WithMany()
            .HasForeignKey(x => x.SupportagentId)
            .OnDelete(DeleteBehavior.NoAction);
        
        builder.HasOne(x => x.Technician)
            .WithMany()
            .HasForeignKey(x => x.TechnicianId)
            .OnDelete(DeleteBehavior.NoAction);
        
        builder.HasOne(x => x.ServicePlan)
            .WithMany()
            .HasForeignKey(x => x.ServicePlanId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.ToTable("SupportTickets");
    }
}