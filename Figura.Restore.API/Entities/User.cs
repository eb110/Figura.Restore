using Microsoft.AspNetCore.Identity;

namespace Figura.Restore.API.Entities
{
    public class User : IdentityUser
    {
        public int? AddressId { get; set; }
        //one to one relation with Address
        public Address? Address { get; set; }
    }
}
