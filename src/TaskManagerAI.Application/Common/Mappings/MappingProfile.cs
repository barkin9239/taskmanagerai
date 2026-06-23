using AutoMapper;
using TaskManagerAI.Application.DTOs;
using TaskManagerAI.Domain.Entities;

namespace TaskManagerAI.Application.Common.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<AppTask, AppTaskDto>()
            .ForMember(d => d.UserId, o => o.MapFrom(s => s.UserId))
            .ForMember(d => d.SubTasks, o => o.MapFrom(s => s.SubTasks ?? new List<SubTask>()))
            .ForMember(d => d.AssignedToUserId, o => o.MapFrom(s => s.AssignedToUserId))
            .ForMember(d => d.AssignedToUserName, o => o.MapFrom(s => s.AssignedToUser != null ? s.AssignedToUser.Name : string.Empty))
            .ForMember(d => d.CreatedByName, o => o.MapFrom(s => s.User != null ? s.User.Name : string.Empty));

        CreateMap<SubTask, SubTaskDto>();
    }
}
