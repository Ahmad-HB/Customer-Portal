using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Customer.Portal.Entities;
using Customer.Portal.Enums;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Guids;
using Volo.Abp.Identity;
using Volo.Abp.Uow;

namespace Customer.Portal.DbMigrator.DataSeeders;

public class IdentityUserDataSeedContributor : IDataSeedContributor, ITransientDependency
{
    #region Fields

    private readonly IdentityUserManager _userManager;
    private readonly IdentityRoleManager _roleManager;
    private readonly IRepository<IdentityUser, Guid> _identityUserRepository;
    private readonly IRepository<IdentityRole, Guid> _identityRoleRepository;
    private readonly IRepository<AppUser, Guid> _appUserRepository;
    private readonly IGuidGenerator _guidGenerator;
    private readonly IUnitOfWorkManager _unitOfWorkManager;

    #endregion

    #region Constructor

    public IdentityUserDataSeedContributor(
        IdentityUserManager userManager,
        IdentityRoleManager roleManager,
        IRepository<IdentityUser, Guid> identityUserRepository,
        IRepository<IdentityRole, Guid> identityRoleRepository,
        IRepository<AppUser, Guid> appUserRepository,
        IGuidGenerator guidGenerator,
        IUnitOfWorkManager unitOfWorkManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _identityUserRepository = identityUserRepository;
        _identityRoleRepository = identityRoleRepository;
        _appUserRepository = appUserRepository;
        _guidGenerator = guidGenerator;
        _unitOfWorkManager = unitOfWorkManager;
    }

    #endregion

    public async Task SeedAsync(DataSeedContext context)
    {
        
        using var uow = _unitOfWorkManager.Begin(requiresNew: true, isTransactional: true);
        
        try
        {
            // Create roles first
            await CreateRolesAsync();
            
            // Create users with their respective roles
            await CreateUsersAsync();
            
            await uow.CompleteAsync();
        }
        catch
        {
            await uow.RollbackAsync();
            throw;
        }
    }

    private async Task CreateRolesAsync()
    {
        var roles = new[] { "Customer", "SupportAgent", "Technician" };

        foreach (var roleName in roles)
        {
            var existingRole = await _identityRoleRepository.FirstOrDefaultAsync(r => r.Name == roleName);
            if (existingRole == null)
            {
                var role = new IdentityRole(_guidGenerator.Create(), roleName);
                role.IsPublic = true;
                role.IsStatic = true;
                await _roleManager.CreateAsync(role);
            }
        }
    }

    private async Task CreateUsersAsync()
    {
        // Admin User is now handled by CustomIdentityDataSeedContributor
        // Create Support Agents (4 users)
        await CreateSupportAgentsAsync();

        // Create Technicians (4 users)
        await CreateTechniciansAsync();

        // Create Customers (8 users)
        await CreateCustomersAsync();
    }


    private async Task CreateSupportAgentsAsync()
    {
        var supportAgents = new[]
        {
            new { Name = "Sarah Johnson", Email = "sarah.johnson@support.com", Phone = "+1234567891" },
            new { Name = "Michael Chen", Email = "michael.chen@support.com", Phone = "+1234567892" },
            new { Name = "Emily Rodriguez", Email = "emily.rodriguez@support.com", Phone = "+1234567893" },
            new { Name = "David Thompson", Email = "david.thompson@support.com", Phone = "+1234567894" }
        };

        foreach (var agent in supportAgents)
        {
            var existingUser = await _identityUserRepository.FirstOrDefaultAsync(u => u.Email == agent.Email);
            
            if (existingUser == null)
            {
                var userName = agent.Email.Split('@')[0];
                var user = new IdentityUser(_guidGenerator.Create(), userName, agent.Email);
                user.SetPhoneNumber(agent.Phone, true);
                user.Name = agent.Name;
                
                await _userManager.CreateAsync(user, "Support123!");
                
                // Create AppUser record directly (bypassing event handler)
                // var appUser = new AppUser(
                //     _guidGenerator.Create(),
                //     agent.Name,
                //     agent.Email,
                //     agent.Phone,
                //     true,
                //     UserType.SupportAgent,
                //     user.Id
                // );
                //
                // await _appUserRepository.InsertAsync(appUser);
                
                // Assign SupportAgent role directly
                var supportAgentRole = await _identityRoleRepository.FirstOrDefaultAsync(r => r.Name == "SupportAgent");
                if (supportAgentRole != null)
                {
                    await _userManager.AddToRoleAsync(user, supportAgentRole.Name);
                }
            }
        }
    }

    private async Task CreateTechniciansAsync()
    {
        var technicians = new[]
        {
            new { Name = "Alex Martinez", Email = "alex.martinez@technician.com", Phone = "+1234567895" },
            new { Name = "Lisa Wang", Email = "lisa.wang@technician.com", Phone = "+1234567896" },
            new { Name = "James Wilson", Email = "james.wilson@technician.com", Phone = "+1234567897" },
            new { Name = "Maria Garcia", Email = "maria.garcia@technician.com", Phone = "+1234567898" }
        };

        foreach (var technician in technicians)
        {
            var existingUser = await _identityUserRepository.FirstOrDefaultAsync(u => u.Email == technician.Email);
            
            if (existingUser == null)
            {
                var userName = technician.Email.Split('@')[0];
                var user = new IdentityUser(_guidGenerator.Create(), userName, technician.Email);
                user.SetPhoneNumber(technician.Phone, true);
                user.Name = technician.Name;
                
                await _userManager.CreateAsync(user, "Tech123!");
                
                // Create AppUser record directly (bypassing event handler)
                // var appUser = new AppUser(
                //     _guidGenerator.Create(),
                //     technician.Name,
                //     technician.Email,
                //     technician.Phone,
                //     true,
                //     UserType.Technician,
                //     user.Id
                // );
                //
                // await _appUserRepository.InsertAsync(appUser);
                
                // Assign Technician role directly
                var technicianRole = await _identityRoleRepository.FirstOrDefaultAsync(r => r.Name == "Technician");
                if (technicianRole != null)
                {
                    await _userManager.AddToRoleAsync(user, technicianRole.Name);
                }
            }
        }
    }

    private async Task CreateCustomersAsync()
    {
        var customers = new[]
        {
            new { Name = "John Smith", Email = "john.smith@customer.com", Phone = "+1234567901" },
            new { Name = "Jane Doe", Email = "jane.doe@customer.com", Phone = "+1234567902" },
            new { Name = "Robert Brown", Email = "robert.brown@customer.com", Phone = "+1234567903" },
            new { Name = "Alice Johnson", Email = "alice.johnson@customer.com", Phone = "+1234567904" },
            new { Name = "Charlie Davis", Email = "charlie.davis@customer.com", Phone = "+1234567905" },
            new { Name = "Diana Miller", Email = "diana.miller@customer.com", Phone = "+1234567906" },
            new { Name = "Edward Wilson", Email = "edward.wilson@customer.com", Phone = "+1234567907" },
            new { Name = "Fiona Taylor", Email = "fiona.taylor@customer.com", Phone = "+1234567908" }
        };

        foreach (var customer in customers)
        {
            var existingUser = await _identityUserRepository.FirstOrDefaultAsync(u => u.Email == customer.Email);
            
            if (existingUser == null)
            {
                var userName = customer.Email.Split('@')[0];
                var user = new IdentityUser(_guidGenerator.Create(), userName, customer.Email);
                user.SetPhoneNumber(customer.Phone, true);
                user.Name = customer.Name;
                
                await _userManager.CreateAsync(user, "Customer123!");
                
                // Create AppUser record directly (bypassing event handler)
                // var appUser = new AppUser(
                //     _guidGenerator.Create(),
                //     customer.Name,
                //     customer.Email,
                //     customer.Phone,
                //     true,
                //     UserType.Customer,
                //     user.Id
                // );
                //
                // await _appUserRepository.InsertAsync(appUser);
                
                // Assign Customer role directly
                var customerRole = await _identityRoleRepository.FirstOrDefaultAsync(r => r.Name == "Customer");
                if (customerRole != null)
                {
                    await _userManager.AddToRoleAsync(user, customerRole.Name);
                }
            }
        }
    }
}