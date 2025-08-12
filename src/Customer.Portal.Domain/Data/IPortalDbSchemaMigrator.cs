using System.Threading.Tasks;

namespace Customer.Portal.Data;

public interface IPortalDbSchemaMigrator
{
    Task MigrateAsync();
}
