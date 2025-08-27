namespace Customer.Portal.DTOs;

public class FileDto
{
    public string FileName { get; set; }
    public string ContentType { get; set; }
    public byte[] FileBytes { get; set; }
}