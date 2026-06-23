using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManagerAI.Domain.Entities;
using TaskManagerAI.Domain.Enums;

namespace TaskManagerAI.Infrastructure.Persistence.Configurations;

public class AppTaskConfiguration : IEntityTypeConfiguration<AppTask>
{
    public void Configure(EntityTypeBuilder<AppTask> builder)
    {
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Title)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(t => t.Description)
            .HasMaxLength(2048);

        // Store enums as strings for readability in DB
        builder.Property(t => t.Priority)
            .HasConversion<string>()
            .HasMaxLength(32);

        builder.Property(t => t.Status)
            .HasConversion<string>()
            .HasMaxLength(32);

        builder.Property(t => t.DueDate)
            .IsRequired(false);

        builder.Property(t => t.CreatedAt)
            .IsRequired();

        builder.HasOne(t => t.User)
            .WithMany(u => u.Tasks)
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(t => t.AssignedToUser)
            .WithMany(u => u.AssignedTasks)
            .HasForeignKey(t => t.AssignedToUserId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        builder.HasMany(t => t.SubTasks)
            .WithOne(s => s.AppTask)
            .HasForeignKey(s => s.AppTaskId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
