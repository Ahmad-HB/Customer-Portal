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
            // await CreateRolesAsync();
            
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

    // private async Task CreateRolesAsync()
    // {
    //     var roles = new[] { "Admin", "Customer", "SupportAgent", "Technician" };
    //
    //     foreach (var roleName in roles)
    //     {
    //         var existingRole = await _identityRoleRepository.FirstOrDefaultAsync(r => r.Name == roleName);
    //         if (existingRole == null)
    //         {
    //             var role = new IdentityRole(_guidGenerator.Create(), roleName);
    //             await _roleManager.CreateAsync(role);
    //         }
    //     }
    // }

    private async Task CreateUsersAsync()
    {
        // Create Admin User (1 user)
        await CreateAdminUserAsync();

        // Create Support Agents (4 users)
        await CreateSupportAgentsAsync();

        // Create Technicians (4 users)
        await CreateTechniciansAsync();

        // Create Customers (8 users)
        await CreateCustomersAsync();
    }

    private async Task CreateAdminUserAsync()
    {
        var adminEmail = "admin@customerportal.com";
        var existingAdmin = await _identityUserRepository.FirstOrDefaultAsync(u => u.Email == adminEmail);
        
        if (existingAdmin == null)
        {
            var adminUser = new IdentityUser(_guidGenerator.Create(), "admin", adminEmail);
            adminUser.SetPhoneNumber("+1234567890", false);
            adminUser.Name = "System Administrator";
            
            await _userManager.CreateAsync(adminUser, "Admin123!");
            
            // Create AppUser record directly (bypassing event handler)
            // var appUser = new AppUser(
            //     _guidGenerator.Create(),
            //     "System Administrator",
            //     adminEmail,
            //     "+1234567890",
            //     true,
            //     UserType.Admin,
            //     adminUser.Id
            // );
            //
            // await _appUserRepository.InsertAsync(appUser);
            
            // Assign Admin role directly
            var adminRole = await _identityRoleRepository.FirstOrDefaultAsync(r => r.Name == "Admin");
            if (adminRole != null)
            {
                await _userManager.AddToRoleAsync(adminUser, adminRole.Name);
            }
        }
    }

    private async Task CreateSupportAgentsAsync()
    {
        var supportAgents = new[]
        {
            new { Name = "Sarah Johnson", Email = "sarah.johnson@customerportal.com", Phone = "+1234567891" },
            new { Name = "Michael Chen", Email = "michael.chen@customerportal.com", Phone = "+1234567892" },
            new { Name = "Emily Rodriguez", Email = "emily.rodriguez@customerportal.com", Phone = "+1234567893" },
            new { Name = "David Thompson", Email = "david.thompson@customerportal.com", Phone = "+1234567894" }
        };

        foreach (var agent in supportAgents)
        {
            var existingUser = await _identityUserRepository.FirstOrDefaultAsync(u => u.Email == agent.Email);
            
            if (existingUser == null)
            {
                var userName = agent.Email.Split('@')[0];
                var user = new IdentityUser(_guidGenerator.Create(), userName, agent.Email);
                user.SetPhoneNumber(agent.Phone, false);
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
            new { Name = "Alex Martinez", Email = "alex.martinez@customerportal.com", Phone = "+1234567895" },
            new { Name = "Lisa Wang", Email = "lisa.wang@customerportal.com", Phone = "+1234567896" },
            new { Name = "James Wilson", Email = "james.wilson@customerportal.com", Phone = "+1234567897" },
            new { Name = "Maria Garcia", Email = "maria.garcia@customerportal.com", Phone = "+1234567898" }
        };

        foreach (var technician in technicians)
        {
            var existingUser = await _identityUserRepository.FirstOrDefaultAsync(u => u.Email == technician.Email);
            
            if (existingUser == null)
            {
                var userName = technician.Email.Split('@')[0];
                var user = new IdentityUser(_guidGenerator.Create(), userName, technician.Email);
                user.SetPhoneNumber(technician.Phone, false);
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
            new { Name = "John Smith", Email = "john.smith@example.com", Phone = "+1234567901" },
            new { Name = "Jane Doe", Email = "jane.doe@example.com", Phone = "+1234567902" },
            new { Name = "Robert Brown", Email = "robert.brown@example.com", Phone = "+1234567903" },
            new { Name = "Alice Johnson", Email = "alice.johnson@example.com", Phone = "+1234567904" },
            new { Name = "Charlie Davis", Email = "charlie.davis@example.com", Phone = "+1234567905" },
            new { Name = "Diana Miller", Email = "diana.miller@example.com", Phone = "+1234567906" },
            new { Name = "Edward Wilson", Email = "edward.wilson@example.com", Phone = "+1234567907" },
            new { Name = "Fiona Taylor", Email = "fiona.taylor@example.com", Phone = "+1234567908" }
        };

        foreach (var customer in customers)
        {
            var existingUser = await _identityUserRepository.FirstOrDefaultAsync(u => u.Email == customer.Email);
            
            if (existingUser == null)
            {
                var userName = customer.Email.Split('@')[0];
                var user = new IdentityUser(_guidGenerator.Create(), userName, customer.Email);
                user.SetPhoneNumber(customer.Phone, false);
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