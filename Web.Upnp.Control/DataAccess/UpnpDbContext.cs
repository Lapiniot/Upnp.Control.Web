﻿using System.Diagnostics.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using Web.Upnp.Control.Models;

namespace Web.Upnp.Control.DataAccess
{
    public class UpnpDbContext : DbContext
    {
        public UpnpDbContext(DbContextOptions<UpnpDbContext> options) : base(options) { }

        public DbSet<UpnpDevice> UpnpDevices { get; set; }

        [SuppressMessage("Microsoft.Design", "CA1062: Validate arguments of public methods")]
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfiguration(new DeviceEntityTypeConfiguration());
        }
    }
}