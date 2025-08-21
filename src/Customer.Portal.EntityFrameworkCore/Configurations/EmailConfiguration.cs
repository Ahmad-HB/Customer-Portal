using Customer.Portal.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace Customer.Portal.Configurations;

public class EmailConfiguration : IEntityTypeConfiguration<Email>
{
    public void Configure(EntityTypeBuilder<Email> builder)
    {
        
        builder.ConfigureByConvention();

        builder.Property(x => x.Subject)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(x => x.Body)
            .IsRequired()
            .HasMaxLength(2048);

        builder.Property(x => x.EmailAddress)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(x => x.SentAt)
            .IsRequired()
            .HasColumnType("datetime");

        builder.Property(x => x.IsSuccess);
        
        builder.Property(x => x.ErrorMessage)
            .HasMaxLength(512);
        
        builder.HasOne(x => x.IdentityUser)
            .WithMany()
            .HasForeignKey(u => u.IdentityUserId)
            .OnDelete(DeleteBehavior.NoAction);
        
        builder.HasOne(x => x.EmailTemplate)
            .WithMany()
            .HasForeignKey(u => u.EmailTemplateId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.ToTable("Emails");
    }
}