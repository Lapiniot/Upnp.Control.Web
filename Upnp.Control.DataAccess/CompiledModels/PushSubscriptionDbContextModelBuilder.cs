﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;

#pragma warning disable 219, 612, 618
#nullable disable

namespace Upnp.Control.DataAccess.CompiledModels
{
    public partial class PushSubscriptionDbContextModel
    {
        partial void Initialize()
        {
            var pushNotificationSubscription = PushNotificationSubscriptionEntityType.Create(this);

            PushNotificationSubscriptionEntityType.CreateAnnotations(pushNotificationSubscription);

            AddAnnotation("ProductVersion", "6.0.0");
        }
    }
}