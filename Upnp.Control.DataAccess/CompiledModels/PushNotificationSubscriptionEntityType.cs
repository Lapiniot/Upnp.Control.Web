﻿// <auto-generated />
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.ChangeTracking.Internal;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.EntityFrameworkCore.Sqlite.Storage.Internal;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.EntityFrameworkCore.Storage.Json;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Upnp.Control.Models.PushNotifications;

#pragma warning disable 219, 612, 618
#nullable disable

namespace Upnp.Control.DataAccess.CompiledModels
{
    [EntityFrameworkInternal]
    public partial class PushNotificationSubscriptionEntityType
    {
        public static RuntimeEntityType Create(RuntimeModel model, RuntimeEntityType baseEntityType = null)
        {
            var runtimeEntityType = model.AddEntityType(
                "Upnp.Control.Models.PushNotifications.PushNotificationSubscription",
                typeof(PushNotificationSubscription),
                baseEntityType,
                propertyCount: 5,
                keyCount: 1);

            var endpoint = runtimeEntityType.AddProperty(
                "Endpoint",
                typeof(Uri),
                propertyInfo: typeof(PushNotificationSubscription).GetProperty("Endpoint", BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly),
                fieldInfo: typeof(PushNotificationSubscription).GetField("<Endpoint>k__BackingField", BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.DeclaredOnly),
                afterSaveBehavior: PropertySaveBehavior.Throw);
            endpoint.SetGetter(
                Uri (PushNotificationSubscription entity) => PushNotificationSubscriptionUnsafeAccessors.Endpoint(entity),
                bool (PushNotificationSubscription entity) => PushNotificationSubscriptionUnsafeAccessors.Endpoint(entity) == null,
                Uri (PushNotificationSubscription instance) => PushNotificationSubscriptionUnsafeAccessors.Endpoint(instance),
                bool (PushNotificationSubscription instance) => PushNotificationSubscriptionUnsafeAccessors.Endpoint(instance) == null);
            endpoint.SetSetter(
                (PushNotificationSubscription entity, Uri value) => PushNotificationSubscriptionUnsafeAccessors.Endpoint(entity) = value);
            endpoint.SetMaterializationSetter(
                (PushNotificationSubscription entity, Uri value) => PushNotificationSubscriptionUnsafeAccessors.Endpoint(entity) = value);
            endpoint.SetAccessors(
                Uri (InternalEntityEntry entry) => PushNotificationSubscriptionUnsafeAccessors.Endpoint(((PushNotificationSubscription)(entry.Entity))),
                Uri (InternalEntityEntry entry) => PushNotificationSubscriptionUnsafeAccessors.Endpoint(((PushNotificationSubscription)(entry.Entity))),
                Uri (InternalEntityEntry entry) => entry.ReadOriginalValue<Uri>(endpoint, 0),
                Uri (InternalEntityEntry entry) => entry.ReadRelationshipSnapshotValue<Uri>(endpoint, 0),
                object (ValueBuffer valueBuffer) => valueBuffer[0]);
            endpoint.SetPropertyIndexes(
                index: 0,
                originalValueIndex: 0,
                shadowIndex: -1,
                relationshipIndex: 0,
                storeGenerationIndex: -1);
            endpoint.TypeMapping = SqliteStringTypeMapping.Default.Clone(
                comparer: new ValueComparer<Uri>(
                    bool (Uri v1, Uri v2) => v1 == v2,
                    int (Uri v) => ((object)v).GetHashCode(),
                    Uri (Uri v) => v),
                keyComparer: new ValueComparer<Uri>(
                    bool (Uri v1, Uri v2) => v1 == v2,
                    int (Uri v) => ((object)v).GetHashCode(),
                    Uri (Uri v) => v),
                providerValueComparer: new ValueComparer<string>(
                    bool (string v1, string v2) => v1 == v2,
                    int (string v) => ((object)v).GetHashCode(),
                    string (string v) => v),
                converter: new ValueConverter<Uri, string>(
                    string (Uri v) => ((object)v).ToString(),
                    Uri (string v) => new Uri(v, UriKind.RelativeOrAbsolute)),
                jsonValueReaderWriter: new JsonConvertedValueReaderWriter<Uri, string>(
                    JsonStringReaderWriter.Instance,
                    new ValueConverter<Uri, string>(
                        string (Uri v) => ((object)v).ToString(),
                        Uri (string v) => new Uri(v, UriKind.RelativeOrAbsolute))));
            endpoint.SetCurrentValueComparer(new NullableClassCurrentProviderValueComparer<Uri, string>(endpoint));

            var authKey = runtimeEntityType.AddProperty(
                "AuthKey",
                typeof(byte[]),
                propertyInfo: typeof(PushNotificationSubscription).GetProperty("AuthKey", BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly),
                fieldInfo: typeof(PushNotificationSubscription).GetField("<AuthKey>k__BackingField", BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.DeclaredOnly));
            authKey.SetGetter(
                byte[] (PushNotificationSubscription entity) => PushNotificationSubscriptionUnsafeAccessors.AuthKey(entity),
                bool (PushNotificationSubscription entity) => PushNotificationSubscriptionUnsafeAccessors.AuthKey(entity) == null,
                byte[] (PushNotificationSubscription instance) => PushNotificationSubscriptionUnsafeAccessors.AuthKey(instance),
                bool (PushNotificationSubscription instance) => PushNotificationSubscriptionUnsafeAccessors.AuthKey(instance) == null);
            authKey.SetSetter(
                (PushNotificationSubscription entity, byte[] value) => PushNotificationSubscriptionUnsafeAccessors.AuthKey(entity) = value);
            authKey.SetMaterializationSetter(
                (PushNotificationSubscription entity, byte[] value) => PushNotificationSubscriptionUnsafeAccessors.AuthKey(entity) = value);
            authKey.SetAccessors(
                byte[] (InternalEntityEntry entry) => PushNotificationSubscriptionUnsafeAccessors.AuthKey(((PushNotificationSubscription)(entry.Entity))),
                byte[] (InternalEntityEntry entry) => PushNotificationSubscriptionUnsafeAccessors.AuthKey(((PushNotificationSubscription)(entry.Entity))),
                byte[] (InternalEntityEntry entry) => entry.ReadOriginalValue<byte[]>(authKey, 1),
                byte[] (InternalEntityEntry entry) => entry.GetCurrentValue<byte[]>(authKey),
                object (ValueBuffer valueBuffer) => valueBuffer[1]);
            authKey.SetPropertyIndexes(
                index: 1,
                originalValueIndex: 1,
                shadowIndex: -1,
                relationshipIndex: -1,
                storeGenerationIndex: -1);
            authKey.TypeMapping = SqliteByteArrayTypeMapping.Default.Clone(
                comparer: new ValueComparer<byte[]>(
                    bool (byte[] v1, byte[] v2) => StructuralComparisons.StructuralEqualityComparer.Equals(((object)(v1)), ((object)(v2))),
                    int (byte[] v) => ((object)v).GetHashCode(),
                    byte[] (byte[] v) => v),
                keyComparer: new ValueComparer<byte[]>(
                    bool (byte[] v1, byte[] v2) => StructuralComparisons.StructuralEqualityComparer.Equals(((object)(v1)), ((object)(v2))),
                    int (byte[] v) => StructuralComparisons.StructuralEqualityComparer.GetHashCode(((object)(v))),
                    byte[] (byte[] source) => source.ToArray()),
                providerValueComparer: new ValueComparer<byte[]>(
                    bool (byte[] v1, byte[] v2) => StructuralComparisons.StructuralEqualityComparer.Equals(((object)(v1)), ((object)(v2))),
                    int (byte[] v) => StructuralComparisons.StructuralEqualityComparer.GetHashCode(((object)(v))),
                    byte[] (byte[] source) => source.ToArray()));

            var created = runtimeEntityType.AddProperty(
                "Created",
                typeof(DateTimeOffset),
                propertyInfo: typeof(PushNotificationSubscription).GetProperty("Created", BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly),
                fieldInfo: typeof(PushNotificationSubscription).GetField("<Created>k__BackingField", BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.DeclaredOnly),
                sentinel: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));
            created.SetGetter(
                DateTimeOffset (PushNotificationSubscription entity) => PushNotificationSubscriptionUnsafeAccessors.Created(entity),
                bool (PushNotificationSubscription entity) => PushNotificationSubscriptionUnsafeAccessors.Created(entity).EqualsExact(default(DateTimeOffset)),
                DateTimeOffset (PushNotificationSubscription instance) => PushNotificationSubscriptionUnsafeAccessors.Created(instance),
                bool (PushNotificationSubscription instance) => PushNotificationSubscriptionUnsafeAccessors.Created(instance).EqualsExact(default(DateTimeOffset)));
            created.SetSetter(
                (PushNotificationSubscription entity, DateTimeOffset value) => PushNotificationSubscriptionUnsafeAccessors.Created(entity) = value);
            created.SetMaterializationSetter(
                (PushNotificationSubscription entity, DateTimeOffset value) => PushNotificationSubscriptionUnsafeAccessors.Created(entity) = value);
            created.SetAccessors(
                DateTimeOffset (InternalEntityEntry entry) => PushNotificationSubscriptionUnsafeAccessors.Created(((PushNotificationSubscription)(entry.Entity))),
                DateTimeOffset (InternalEntityEntry entry) => PushNotificationSubscriptionUnsafeAccessors.Created(((PushNotificationSubscription)(entry.Entity))),
                DateTimeOffset (InternalEntityEntry entry) => entry.ReadOriginalValue<DateTimeOffset>(created, 2),
                DateTimeOffset (InternalEntityEntry entry) => entry.GetCurrentValue<DateTimeOffset>(created),
                object (ValueBuffer valueBuffer) => valueBuffer[2]);
            created.SetPropertyIndexes(
                index: 2,
                originalValueIndex: 2,
                shadowIndex: -1,
                relationshipIndex: -1,
                storeGenerationIndex: -1);
            created.TypeMapping = SqliteDateTimeOffsetTypeMapping.Default;

            var p256dhKey = runtimeEntityType.AddProperty(
                "P256dhKey",
                typeof(byte[]),
                propertyInfo: typeof(PushNotificationSubscription).GetProperty("P256dhKey", BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly),
                fieldInfo: typeof(PushNotificationSubscription).GetField("<P256dhKey>k__BackingField", BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.DeclaredOnly));
            p256dhKey.SetGetter(
                byte[] (PushNotificationSubscription entity) => PushNotificationSubscriptionUnsafeAccessors.P256dhKey(entity),
                bool (PushNotificationSubscription entity) => PushNotificationSubscriptionUnsafeAccessors.P256dhKey(entity) == null,
                byte[] (PushNotificationSubscription instance) => PushNotificationSubscriptionUnsafeAccessors.P256dhKey(instance),
                bool (PushNotificationSubscription instance) => PushNotificationSubscriptionUnsafeAccessors.P256dhKey(instance) == null);
            p256dhKey.SetSetter(
                (PushNotificationSubscription entity, byte[] value) => PushNotificationSubscriptionUnsafeAccessors.P256dhKey(entity) = value);
            p256dhKey.SetMaterializationSetter(
                (PushNotificationSubscription entity, byte[] value) => PushNotificationSubscriptionUnsafeAccessors.P256dhKey(entity) = value);
            p256dhKey.SetAccessors(
                byte[] (InternalEntityEntry entry) => PushNotificationSubscriptionUnsafeAccessors.P256dhKey(((PushNotificationSubscription)(entry.Entity))),
                byte[] (InternalEntityEntry entry) => PushNotificationSubscriptionUnsafeAccessors.P256dhKey(((PushNotificationSubscription)(entry.Entity))),
                byte[] (InternalEntityEntry entry) => entry.ReadOriginalValue<byte[]>(p256dhKey, 3),
                byte[] (InternalEntityEntry entry) => entry.GetCurrentValue<byte[]>(p256dhKey),
                object (ValueBuffer valueBuffer) => valueBuffer[3]);
            p256dhKey.SetPropertyIndexes(
                index: 3,
                originalValueIndex: 3,
                shadowIndex: -1,
                relationshipIndex: -1,
                storeGenerationIndex: -1);
            p256dhKey.TypeMapping = SqliteByteArrayTypeMapping.Default.Clone(
                comparer: new ValueComparer<byte[]>(
                    bool (byte[] v1, byte[] v2) => StructuralComparisons.StructuralEqualityComparer.Equals(((object)(v1)), ((object)(v2))),
                    int (byte[] v) => ((object)v).GetHashCode(),
                    byte[] (byte[] v) => v),
                keyComparer: new ValueComparer<byte[]>(
                    bool (byte[] v1, byte[] v2) => StructuralComparisons.StructuralEqualityComparer.Equals(((object)(v1)), ((object)(v2))),
                    int (byte[] v) => StructuralComparisons.StructuralEqualityComparer.GetHashCode(((object)(v))),
                    byte[] (byte[] source) => source.ToArray()),
                providerValueComparer: new ValueComparer<byte[]>(
                    bool (byte[] v1, byte[] v2) => StructuralComparisons.StructuralEqualityComparer.Equals(((object)(v1)), ((object)(v2))),
                    int (byte[] v) => StructuralComparisons.StructuralEqualityComparer.GetHashCode(((object)(v))),
                    byte[] (byte[] source) => source.ToArray()));

            var type = runtimeEntityType.AddProperty(
                "Type",
                typeof(NotificationType),
                propertyInfo: typeof(PushNotificationSubscription).GetProperty("Type", BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly),
                fieldInfo: typeof(PushNotificationSubscription).GetField("<Type>k__BackingField", BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.DeclaredOnly));
            type.SetGetter(
                NotificationType (PushNotificationSubscription entity) => PushNotificationSubscriptionUnsafeAccessors.Type(entity),
                bool (PushNotificationSubscription entity) => object.Equals(((object)(PushNotificationSubscriptionUnsafeAccessors.Type(entity))), ((object)(NotificationType.None))),
                NotificationType (PushNotificationSubscription instance) => PushNotificationSubscriptionUnsafeAccessors.Type(instance),
                bool (PushNotificationSubscription instance) => object.Equals(((object)(PushNotificationSubscriptionUnsafeAccessors.Type(instance))), ((object)(NotificationType.None))));
            type.SetSetter(
                (PushNotificationSubscription entity, NotificationType value) => PushNotificationSubscriptionUnsafeAccessors.Type(entity) = value);
            type.SetMaterializationSetter(
                (PushNotificationSubscription entity, NotificationType value) => PushNotificationSubscriptionUnsafeAccessors.Type(entity) = value);
            type.SetAccessors(
                NotificationType (InternalEntityEntry entry) => PushNotificationSubscriptionUnsafeAccessors.Type(((PushNotificationSubscription)(entry.Entity))),
                NotificationType (InternalEntityEntry entry) => PushNotificationSubscriptionUnsafeAccessors.Type(((PushNotificationSubscription)(entry.Entity))),
                NotificationType (InternalEntityEntry entry) => entry.ReadOriginalValue<NotificationType>(type, 4),
                NotificationType (InternalEntityEntry entry) => entry.GetCurrentValue<NotificationType>(type),
                object (ValueBuffer valueBuffer) => valueBuffer[4]);
            type.SetPropertyIndexes(
                index: 4,
                originalValueIndex: 4,
                shadowIndex: -1,
                relationshipIndex: -1,
                storeGenerationIndex: -1);
            type.TypeMapping = IntTypeMapping.Default.Clone(
                comparer: new ValueComparer<NotificationType>(
                    bool (NotificationType v1, NotificationType v2) => object.Equals(((object)(v1)), ((object)(v2))),
                    int (NotificationType v) => ((object)v).GetHashCode(),
                    NotificationType (NotificationType v) => v),
                keyComparer: new ValueComparer<NotificationType>(
                    bool (NotificationType v1, NotificationType v2) => object.Equals(((object)(v1)), ((object)(v2))),
                    int (NotificationType v) => ((object)v).GetHashCode(),
                    NotificationType (NotificationType v) => v),
                providerValueComparer: new ValueComparer<int>(
                    bool (int v1, int v2) => v1 == v2,
                    int (int v) => v,
                    int (int v) => v),
                mappingInfo: new RelationalTypeMappingInfo(
                    storeTypeName: "INTEGER"),
                converter: new ValueConverter<NotificationType, int>(
                    int (NotificationType value) => ((int)(value)),
                    NotificationType (int value) => ((NotificationType)(value))),
                jsonValueReaderWriter: new JsonConvertedValueReaderWriter<NotificationType, int>(
                    JsonInt32ReaderWriter.Instance,
                    new ValueConverter<NotificationType, int>(
                        int (NotificationType value) => ((int)(value)),
                        NotificationType (int value) => ((NotificationType)(value)))));
            type.SetSentinelFromProviderValue(0);

            var key = runtimeEntityType.AddKey(
                new[] { endpoint });
            runtimeEntityType.SetPrimaryKey(key);

            return runtimeEntityType;
        }

        public static void CreateAnnotations(RuntimeEntityType runtimeEntityType)
        {
            var endpoint = runtimeEntityType.FindProperty("Endpoint");
            var authKey = runtimeEntityType.FindProperty("AuthKey");
            var created = runtimeEntityType.FindProperty("Created");
            var p256dhKey = runtimeEntityType.FindProperty("P256dhKey");
            var type = runtimeEntityType.FindProperty("Type");
            var key = runtimeEntityType.FindKey(new[] { endpoint });
            key.SetPrincipalKeyValueFactory(KeyValueFactoryFactory.CreateSimpleNullableFactory<Uri, int>(key));
            key.SetIdentityMapFactory(IdentityMapFactoryFactory.CreateFactory<Uri>(key));
            runtimeEntityType.SetOriginalValuesFactory(
                ISnapshot (InternalEntityEntry source) =>
                {
                    var entity = ((PushNotificationSubscription)(source.Entity));
                    return ((ISnapshot)(new Snapshot<Uri, byte[], DateTimeOffset, byte[], NotificationType>((source.GetCurrentValue<Uri>(endpoint) == null ? null : ((ValueComparer<Uri>)(((IProperty)endpoint).GetValueComparer())).Snapshot(source.GetCurrentValue<Uri>(endpoint))), (source.GetCurrentValue<byte[]>(authKey) == null ? null : ((ValueComparer<byte[]>)(((IProperty)authKey).GetValueComparer())).Snapshot(source.GetCurrentValue<byte[]>(authKey))), ((ValueComparer<DateTimeOffset>)(((IProperty)created).GetValueComparer())).Snapshot(source.GetCurrentValue<DateTimeOffset>(created)), (source.GetCurrentValue<byte[]>(p256dhKey) == null ? null : ((ValueComparer<byte[]>)(((IProperty)p256dhKey).GetValueComparer())).Snapshot(source.GetCurrentValue<byte[]>(p256dhKey))), ((ValueComparer<NotificationType>)(((IProperty)type).GetValueComparer())).Snapshot(source.GetCurrentValue<NotificationType>(type)))));
                });
            runtimeEntityType.SetStoreGeneratedValuesFactory(
                ISnapshot () => Snapshot.Empty);
            runtimeEntityType.SetTemporaryValuesFactory(
                ISnapshot (InternalEntityEntry source) => Snapshot.Empty);
            runtimeEntityType.SetShadowValuesFactory(
                ISnapshot (IDictionary<string, object> source) => Snapshot.Empty);
            runtimeEntityType.SetEmptyShadowValuesFactory(
                ISnapshot () => Snapshot.Empty);
            runtimeEntityType.SetRelationshipSnapshotFactory(
                ISnapshot (InternalEntityEntry source) =>
                {
                    var entity = ((PushNotificationSubscription)(source.Entity));
                    return ((ISnapshot)(new Snapshot<Uri>((source.GetCurrentValue<Uri>(endpoint) == null ? null : ((ValueComparer<Uri>)(((IProperty)endpoint).GetKeyValueComparer())).Snapshot(source.GetCurrentValue<Uri>(endpoint))))));
                });
            runtimeEntityType.Counts = new PropertyCounts(
                propertyCount: 5,
                navigationCount: 0,
                complexPropertyCount: 0,
                originalValueCount: 5,
                shadowCount: 0,
                relationshipCount: 1,
                storeGeneratedCount: 0);
            runtimeEntityType.AddAnnotation("Relational:FunctionName", null);
            runtimeEntityType.AddAnnotation("Relational:Schema", null);
            runtimeEntityType.AddAnnotation("Relational:SqlQuery", null);
            runtimeEntityType.AddAnnotation("Relational:TableName", "Subscriptions");
            runtimeEntityType.AddAnnotation("Relational:ViewName", null);
            runtimeEntityType.AddAnnotation("Relational:ViewSchema", null);

            Customize(runtimeEntityType);
        }

        static partial void Customize(RuntimeEntityType runtimeEntityType);
    }
}