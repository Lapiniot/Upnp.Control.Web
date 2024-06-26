using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Upnp.Control.DataAccess.Migrations.UpnpDb
{
    public partial class InitialCreate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UpnpDevices",
                columns: table => new
                {
                    Udn = table.Column<string>(type: "TEXT", nullable: false),
                    Location = table.Column<string>(type: "TEXT", nullable: true),
                    DeviceType = table.Column<string>(type: "TEXT", nullable: true),
                    FriendlyName = table.Column<string>(type: "TEXT", nullable: true),
                    Manufacturer = table.Column<string>(type: "TEXT", nullable: true),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    ModelName = table.Column<string>(type: "TEXT", nullable: true),
                    ModelNumber = table.Column<string>(type: "TEXT", nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ManufacturerUri = table.Column<string>(type: "TEXT", nullable: true),
                    ModelUri = table.Column<string>(type: "TEXT", nullable: true),
                    PresentationUri = table.Column<string>(type: "TEXT", nullable: true),
                    BootId = table.Column<string>(type: "TEXT", nullable: true),
                    ConfigId = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UpnpDevices", x => x.Udn);
                });

            migrationBuilder.CreateTable(
                name: "Icon",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Width = table.Column<int>(type: "INTEGER", nullable: false),
                    Height = table.Column<int>(type: "INTEGER", nullable: false),
                    Url = table.Column<string>(type: "TEXT", nullable: true),
                    Mime = table.Column<string>(type: "TEXT", nullable: true),
                    Udn = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Icon", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Icon_UpnpDevices_Udn",
                        column: x => x.Udn,
                        principalTable: "UpnpDevices",
                        principalColumn: "Udn",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Service",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UniqueServiceName = table.Column<string>(type: "TEXT", nullable: true),
                    ServiceType = table.Column<string>(type: "TEXT", nullable: true),
                    MetadataUrl = table.Column<string>(type: "TEXT", nullable: true),
                    ControlUrl = table.Column<string>(type: "TEXT", nullable: true),
                    EventsUrl = table.Column<string>(type: "TEXT", nullable: true),
                    Udn = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Service", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Service_UpnpDevices_Udn",
                        column: x => x.Udn,
                        principalTable: "UpnpDevices",
                        principalColumn: "Udn",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Icon_Udn",
                table: "Icon",
                column: "Udn");

            migrationBuilder.CreateIndex(
                name: "IX_Service_Udn",
                table: "Service",
                column: "Udn");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Icon");

            migrationBuilder.DropTable(
                name: "Service");

            migrationBuilder.DropTable(
                name: "UpnpDevices");
        }
    }
}