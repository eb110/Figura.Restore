using Microsoft.AspNetCore.Mvc;

namespace Figura.Restore.API.Controllers
{
    public class BuggyController : BaseApiController
    {
        [HttpGet("not-found")]
        public IActionResult GetNoFound()
        {
            return NotFound();
        }

        [HttpGet("bad-request")]
        public IActionResult GetBadRequest()
        {
            return BadRequest("This is a bad request");
        }

        [HttpGet("unauthorized")]
        public IActionResult GetUnauthorized()
        {
            return Unauthorized();
        }

        [HttpGet("validation-error")]
        public IActionResult GetValidationError()
        {
            //We will set up service to trigger this endpoint
            //modelstate will be populated with custom msg's
            ModelState.AddModelError("Problem1", "This is the first error");
            ModelState.AddModelError("Problem2", "This is the second error");
            return ValidationProblem();
        }

        [HttpGet("server-error")]
        public IActionResult GetServerError()
        {
            throw new Exception("this is the server error");
        }
    }
}
