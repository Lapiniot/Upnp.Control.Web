﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;

#pragma warning disable 219, 612, 618
#nullable disable

namespace Upnp.Control.DataAccess.CompiledModels
{
    public partial class UpnpDbContextModel
    {
        partial void Initialize()
        {
            var icon = IconEntityType.Create(this);
            var service = ServiceEntityType.Create(this);
            var upnpDevice = UpnpDeviceEntityType.Create(this);

            IconEntityType.CreateForeignKey1(icon, upnpDevice);
            ServiceEntityType.CreateForeignKey1(service, upnpDevice);

            IconEntityType.CreateAnnotations(icon);
            ServiceEntityType.CreateAnnotations(service);
            UpnpDeviceEntityType.CreateAnnotations(upnpDevice);

            AddAnnotation("ProductVersion", "7.0.0-preview.7.22376.2");
        }
    }
}
