namespace EHR_Reports.DTOs.Report
{
    public class PdfReport
    {
        public class PdfColumnDefinition
        {
            public string PropertyName { get; set; }
            public string HeaderText { get; set; }
            public double Width { get; set; }
            public Func<object, string> ValueFormatter { get; set; }
        }

        public class PdfReportOptions
        {
            public string ReportTitle { get; set; }
            public string HospitalName { get; set; } = "RICHLAND PARISH HOSPITAL";
            public DateTime ReportDate { get; set; }
            public DateTime? StartDate { get; set; }
            public DateTime? EndDate { get; set; }
            public PdfSharpCore.PageSize PageSize { get; set; } = PdfSharpCore.PageSize.A4;
            public PdfSharpCore.PageOrientation Orientation { get; set; } = PdfSharpCore.PageOrientation.Landscape;
            public double StartX { get; set; } = 30;
            public double StartY { get; set; } = 110; // Adjusted for header space
            public double RowHeight { get; set; } = 18;
            public double BottomMargin { get; set; } = 50;
            public string TotalsContent { get; set; }
            public bool ShowGrandTotal { get; set; } = false;
            public int GrandTotalColumnIndex { get; set; } = 3;
        }
    }
}
