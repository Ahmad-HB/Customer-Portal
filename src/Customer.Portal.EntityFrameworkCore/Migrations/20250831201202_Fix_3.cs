using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Customer.Portal.Migrations
{
    /// <inheritdoc />
    public partial class Fix_3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "SuspensionReason",
                table: "UserServicePlans",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "UserServicePlans",
                keyColumn: "SuspensionReason",
                keyValue: null,
                column: "SuspensionReason",
                value: "");

            migrationBuilder.AlterColumn<string>(
                name: "SuspensionReason",
                table: "UserServicePlans",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");
        }
    }
}
