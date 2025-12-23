using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EHR_Reports.Migrations
{
    /// <inheritdoc />
    public partial class PatientTypeSegment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PatientTypeSegments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PatientEncounterId = table.Column<int>(type: "int", nullable: false),
                    PatientTypeId = table.Column<int>(type: "int", nullable: false),
                    TransferInDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TransferInTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    TransferOutDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TransferOutTime = table.Column<TimeOnly>(type: "time", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PatientTypeSegments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PatientTypeSegments_PatientEncounters_PatientEncounterId",
                        column: x => x.PatientEncounterId,
                        principalTable: "PatientEncounters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PatientTypeSegments_PatientType_PatientTypeId",
                        column: x => x.PatientTypeId,
                        principalTable: "PatientType",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PatientTypeSegments_PatientEncounterId",
                table: "PatientTypeSegments",
                column: "PatientEncounterId");

            migrationBuilder.CreateIndex(
                name: "IX_PatientTypeSegments_PatientTypeId",
                table: "PatientTypeSegments",
                column: "PatientTypeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PatientTypeSegments");
        }
    }
}
