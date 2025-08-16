using Customer.Portal.Enums;

namespace Customer.Portal.Entities;

public class EmailTemplate
{
    public TemplateType TemplateType { get; set; }
    
    public EmailType EmailType { get; set; }
    
    public string Name { get; set; }
    
    public string Format { get; set; }
}