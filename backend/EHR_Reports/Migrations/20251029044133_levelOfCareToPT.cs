using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EHR_Reports.Migrations
{
    /// <inheritdoc />
    public partial class levelOfCareToPT : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PatientEncounters_PatientType_LevelOfCareId",
                table: "PatientEncounters");

            migrationBuilder.RenameColumn(
                name: "LevelOfCareId",
                table: "PatientEncounters",
                newName: "PatientTypeId");

            migrationBuilder.RenameIndex(
                name: "IX_PatientEncounters_LevelOfCareId",
                table: "PatientEncounters",
                newName: "IX_PatientEncounters_PatientTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_PatientEncounters_PatientType_PatientTypeId",
                table: "PatientEncounters",
                column: "PatientTypeId",
                principalTable: "PatientType",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PatientEncounters_PatientType_PatientTypeId",
                table: "PatientEncounters");

            migrationBuilder.RenameColumn(
                name: "PatientTypeId",
                table: "PatientEncounters",
                newName: "LevelOfCareId");

            migrationBuilder.RenameIndex(
                name: "IX_PatientEncounters_PatientTypeId",
                table: "PatientEncounters",
                newName: "IX_PatientEncounters_LevelOfCareId");

            migrationBuilder.AddForeignKey(
                name: "FK_PatientEncounters_PatientType_LevelOfCareId",
                table: "PatientEncounters",
                column: "LevelOfCareId",
                principalTable: "PatientType",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
