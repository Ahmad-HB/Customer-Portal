using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Customer.Portal.Migrations
{
    /// <inheritdoc />
    public partial class Fix_EmailTemplate_Fix_ReportTemplate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "TemplateType",
                table: "ReportTemplates",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<int>(
                name: "ReportType",
                table: "ReportTemplates",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<Guid>(
                name: "EmailTemplateId",
                table: "Emails",
                type: "char(36)",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                collation: "ascii_general_ci");

            migrationBuilder.CreateIndex(
                name: "IX_Emails_EmailTemplateId",
                table: "Emails",
                column: "EmailTemplateId");

            migrationBuilder.AddForeignKey(
                name: "FK_Emails_EmailTemplates_EmailTemplateId",
                table: "Emails",
                column: "EmailTemplateId",
                principalTable: "EmailTemplates",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Emails_EmailTemplates_EmailTemplateId",
                table: "Emails");

            migrationBuilder.DropIndex(
                name: "IX_Emails_EmailTemplateId",
                table: "Emails");

            migrationBuilder.DropColumn(
                name: "EmailTemplateId",
                table: "Emails");

            migrationBuilder.AlterColumn<string>(
                name: "TemplateType",
                table: "ReportTemplates",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "ReportType",
                table: "ReportTemplates",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("MySql:CharSet", "utf8mb4");
        }
    }
}
