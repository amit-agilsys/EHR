using PdfSharpCore.Drawing;
using PdfSharpCore.Pdf;
using static EHR_Reports.DTOs.Report.PdfReport;

namespace EHR_Reports.Utilities
{
    public class PdfReportGenerator
    {
        private XFont dateFont = new XFont("Arial", 8, XFontStyle.Regular);
        private XFont pageNumberFont = new XFont("Arial", 8, XFontStyle.Regular);
        private XFont hospitalNameFont = new XFont("Arial", 11, XFontStyle.Bold);
        private XFont reportTitleFont = new XFont("Arial", 10, XFontStyle.Bold);
        private XFont dateRangeFont = new XFont("Arial", 8, XFontStyle.Regular);
        private XFont columnHeaderFont = new XFont("Arial", 8, XFontStyle.Bold);
        private XFont dataFont = new XFont("Arial", 8, XFontStyle.Regular);
        private XFont subtotalFont = new XFont("Arial", 8, XFontStyle.Regular);
        private XFont grandTotalFont = new XFont("Arial", 8, XFontStyle.Regular);

        public byte[] GeneratePdf<T>(List<T> data, List<PdfColumnDefinition> columns, PdfReportOptions options)
        {
            using (var stream = new MemoryStream())
            {
                var document = new PdfDocument();
                var currentPage = document.AddPage();
                currentPage.Size = options.PageSize;
                currentPage.Orientation = options.Orientation;

                var gfx = XGraphics.FromPdfPage(currentPage);
                double currentY = options.StartY;
                int pageNumber = 1;

                currentY = DrawHeader(gfx, options, pageNumber);
                currentY = DrawColumnHeaders(gfx, columns, options, currentY);

                foreach (var item in data)
                {
                    if (currentY + options.RowHeight > currentPage.Height - options.BottomMargin)
                    {
                        currentPage = document.AddPage();
                        currentPage.Size = options.PageSize;
                        currentPage.Orientation = options.Orientation;
                        gfx = XGraphics.FromPdfPage(currentPage);
                        pageNumber++;
                        currentY = 65;

                        DrawHeader(gfx, options, pageNumber);
                        currentY = DrawColumnHeaders(gfx, columns, options, currentY);
                    }

                    currentY = DrawDataRow(gfx, item, columns, options, currentY);
                }

                if (!string.IsNullOrEmpty(options.TotalsContent))
                {
                    double totalSectionTop = currentY + 5;
                    double leftX = options.StartX;
                    double totalWidth = columns.Sum(c => c.Width);
                    double rightX = leftX + totalWidth;

                    gfx.DrawLine(XPens.Black, leftX, totalSectionTop, rightX, totalSectionTop);

                    currentY = totalSectionTop + 5;

                    XFont boldTotalsFont = new XFont("Arial", 8, XFontStyle.Bold);

                    //gfx.DrawString(options.TotalsContent, boldTotalsFont, XBrushes.Black,
                    //    new XRect(leftX, currentY, totalWidth, 12), XStringFormats.TopRight);
                    gfx.DrawString($"Totals: {options.TotalsContent}", boldTotalsFont, XBrushes.Black,
                        new XRect(leftX, currentY, totalWidth, 12), XStringFormats.TopRight);

                    currentY += 15;
                }

                if (options.ShowGrandTotal)
                {
                    currentY += 5;

                    double leftX = options.StartX;
                    double totalWidth = columns.Sum(c => c.Width);
                    double rightX = leftX + totalWidth;

                    XFont boldGrandTotalFont = new XFont("Arial", 8, XFontStyle.Bold);

                    gfx.DrawString("Grand Totals:", boldGrandTotalFont, XBrushes.Black,
                        new XRect(leftX, currentY, totalWidth, 12), XStringFormats.TopRight);
                    currentY += 15;
                }

                document.Save(stream, false);
                return stream.ToArray();
            }
        }

        private double DrawHeader(XGraphics gfx, PdfReportOptions options, int pageNumber)
        {
            var page = gfx.PdfPage;
            double pageWidth = page.Width;
            double leftMargin = 30;
            double rightMargin = 30;
            double topMargin = 10;

            string generationDate = "Date: " +  DateTime.Now.ToString("MM/dd/yyyy");
            string generationTime = "Time: " + DateTime.Now.ToString("h:mm tt");

            gfx.DrawString(generationDate, dateFont, XBrushes.Black,
                new XRect(leftMargin, topMargin, 100, 8), XStringFormats.TopLeft);
            gfx.DrawString(generationTime, dateFont, XBrushes.Black,
                new XRect(leftMargin, topMargin + 8, 2 + 100, 8), XStringFormats.TopLeft);

            string pageText = $"Page {pageNumber}";
            gfx.DrawString(pageText, pageNumberFont, XBrushes.Black,
                new XRect(leftMargin, topMargin, pageWidth - rightMargin - leftMargin, 8),
                XStringFormats.TopRight);

            double hospitalY = topMargin + 12;
            gfx.DrawString(options.HospitalName, hospitalNameFont, XBrushes.Black,
                new XRect(leftMargin, hospitalY, pageWidth - leftMargin - rightMargin, 11),
                XStringFormats.TopCenter);

            double reportTitleY = hospitalY + 15;
            gfx.DrawString(options.ReportTitle, reportTitleFont, XBrushes.Black,
                new XRect(leftMargin, reportTitleY, pageWidth - leftMargin - rightMargin, 10),
                XStringFormats.TopCenter);

            string dateRange = "";
            if (options.StartDate.HasValue && options.EndDate.HasValue)
            {
                dateRange = $"{options.ReportTitle} From: {options.StartDate.Value:MM/dd/yyyy} To: {options.EndDate.Value:MM/dd/yyyy}";
            }

            double bottomY = reportTitleY + 10; 

            if (!string.IsNullOrEmpty(dateRange))
            {
                double dateRangeSpacing = 5;
                double dateRangeY = reportTitleY + 10 + dateRangeSpacing;

                gfx.DrawString(dateRange, dateRangeFont, XBrushes.Black,
                    new XRect(leftMargin, dateRangeY, pageWidth - leftMargin - rightMargin, 8),
                    XStringFormats.TopCenter);

                return dateRangeY + 20;
            }
            else
            {
                return reportTitleY + 20;
            }
        }

        private double DrawColumnHeaders(XGraphics gfx, List<PdfColumnDefinition> columns,
            PdfReportOptions options, double startY)
        {
            double currentX = options.StartX;
            double headerY = startY;
            double totalWidth = columns.Sum(c => c.Width);
            double headerSpacing = 5;

            foreach (var column in columns)
            {
                var textRect = new XRect(currentX, headerY, column.Width, options.RowHeight);
                gfx.DrawString(column.HeaderText, columnHeaderFont, XBrushes.Black, textRect,
                    XStringFormats.TopLeft);

                currentX += column.Width;
            }

            gfx.DrawLine(XPens.Black, options.StartX, headerY + options.RowHeight,
                options.StartX + totalWidth, headerY + options.RowHeight);

            return headerY + options.RowHeight + headerSpacing;
        }

        private double DrawDataRow<T>(XGraphics gfx, T item, List<PdfColumnDefinition> columns,
            PdfReportOptions options, double startY)
        {
            double currentX = options.StartX;
            var type = typeof(T);

            foreach (var column in columns)
            {
                var property = type.GetProperty(column.PropertyName);
                if (property != null)
                {
                    var value = property.GetValue(item);
                    string displayValue = value?.ToString() ?? "-";

                    if (column.ValueFormatter != null)
                    {
                        displayValue = column.ValueFormatter(value);
                    }

                    var textRect = new XRect(currentX, startY, column.Width, options.RowHeight);
                    gfx.DrawString(displayValue, dataFont, XBrushes.Black, textRect,
                        XStringFormats.TopLeft);
                }

                currentX += column.Width;
            }

            return startY + options.RowHeight;
        }
    }
}
