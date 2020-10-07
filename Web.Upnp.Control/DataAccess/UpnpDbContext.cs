﻿using Microsoft.EntityFrameworkCore;
using Web.Upnp.Control.Models;

namespace Web.Upnp.Control.DataAccess
{
    public class UpnpDbContext : DbContext
    {
        public UpnpDbContext(DbContextOptions options) : base(options) {}

        public DbSet<Device> UpnpDevices { get; set; }
    }
}