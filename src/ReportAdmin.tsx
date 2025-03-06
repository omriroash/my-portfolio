import React, { useEffect, useState } from 'react';

const UploadReport = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reportContent, setReportContent] = useState<any>(null);

  // Fetch reports from server
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/reports');
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          console.log(typeof(data.generated_at));
          console.log(typeof(data[0][1][1]));
          setReports(data);
        } else {
          console.error('Failed to fetch reports');
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };
  
    fetchReports();
  }, []);
  

  // Fetch selected report's content
  const fetchReportContent = async (reportId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/reports/${reportId}`);
      if (response.ok) {
        const data = await response.json();
        setReportContent(data);
      } else {
        console.error('Failed to fetch report content');
      }
    } catch (error) {
      console.error('Error fetching report content:', error);
    }
  };

  const handleReportSelect = (reportId: string) => {
    setSelectedReport(reportId);
    fetchReportContent(reportId);
  };

  return (
    <div className="report-list">
      <h1>Reports</h1>
      <table>
        <thead>
          <tr>
            <th>File Name</th>
            <th>Generated At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
  {reports.length > 0 ? (
    reports.map((report) => (
      <tr key={report.id}>
        <td>{report.file_name }</td> 
        <td>{new Date(report.generated_at).toLocaleString('en-GB')}</td>
        <td>
          <button onClick={() => handleReportSelect(report.id)}>
            View Report
          </button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={3}>No reports available</td>
    </tr>
  )}
</tbody>


      </table>

      {selectedReport && reportContent && (
        <div className="report-content">
          <h2>Report Content</h2>
          <pre>{JSON.stringify(reportContent, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default UploadReport;
