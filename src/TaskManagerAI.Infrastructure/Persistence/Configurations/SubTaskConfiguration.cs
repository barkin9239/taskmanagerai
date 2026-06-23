using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManagerAI.Domain.Entities;

namespace TaskManagerAI.Infrastructure.Persistence.Configurations;

public class SubTaskConfiguration : IEntityTypeConfiguration<SubTask>
{
    public void Configure(EntityTypeBuilder<SubTask> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.Title)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(s => s.IsCompleted)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(s => s.CreatedAt)
            .IsRequired();

        builder.HasOne(s => s.AppTask)
            .WithMany(t => t.SubTasks)
            .HasForeignKey(s => s.AppTaskId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
