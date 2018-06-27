using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Web.Upnp.Control.Controllers
{
    [Route("api/[controller]")]
    public class BrowseController : Controller
    {
        // GET: api/<controller>
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new[] {"value1", "value2"};
        }

        // GET api/<controller>/5
        [HttpGet("{id}/{path?}")]
        public IEnumerable<object> Get(string id, string path)
        {
            yield return "value1";
            yield return "value2";
            yield return "value3";
            yield return "value4";
            yield return "value5";
        }

        // POST api/<controller>
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }

        // PUT api/<controller>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<controller>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}