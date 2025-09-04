using MailKit.Net.Smtp;
using MimeKit;
using Volo.Abp.DependencyInjection;

namespace Customer.Portal.FeaturesManagers.MEmail;

public class EmailManagerFactory : ITransientDependency
{
    public MimeMessage CreateMimeMessage()
    {
        return new MimeMessage();
    }

    public SmtpClient CreateSmtpClient()
    {
        return new SmtpClient();
    }
    
    public BodyBuilder CreateBodyBuilder()
    {
        return new BodyBuilder();
    }
}
