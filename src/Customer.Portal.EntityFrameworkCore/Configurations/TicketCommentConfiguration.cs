using Customer.Portal.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace Customer.Portal.Configurations;

public class TicketCommentConfiguration : IEntityTypeConfiguration<TicketComment>
{
    public void Configure(EntityTypeBuilder<TicketComment> builder)
    {
        builder.ConfigureByConvention();
        
        builder.Property(x => x.Comment)
            .IsRequired()
            .HasMaxLength(1024);

        builder.Property(x => x.CommentedAt)
            .IsRequired()
            .HasColumnType("date");

        builder.HasOne(x => x.Ticket)
            .WithMany(x => x.TicketComments)
            .HasForeignKey(x => x.TicketId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.ToTable("TicketComments");
    }
}