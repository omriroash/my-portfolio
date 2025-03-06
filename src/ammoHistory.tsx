import React, { useState, useEffect } from "react";
import './ammoHistory.css';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface AmmoHistory {
  id: number;
  ammo_id: number;
  ammo_name: string;
  quantity: number;
  updated_by: string;
  updated_at: string;
  action_type: "INSERT" | "UPDATE" | "DELETE";
  old_quantity: number | null;
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
const AmmoHistory: React.FC = () => {
  const [history, setHistory] = useState<AmmoHistory[]>([]);
  const [error, setError] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  
  const fetchHistoryByMonth = async (month: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/ammo-history?month=${month}`);
      if (!response.ok) throw new Error("Failed to fetch history");
      const data: AmmoHistory[] = await response.json();
      setHistory(data); 
    } catch (err) {
      console.error("Error fetching ammo history:", err);
      setError("Failed to load data");
    }
  };

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const month = event.target.value;
    setSelectedMonth(month);
    fetchHistoryByMonth(month); 
  };

  const exportToExcel = async () => { 
    const worksheet = XLSX.utils.json_to_sheet(history);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook , worksheet , "Ammo Data");
    const excelBuffer = XLSX.write(workbook , {bookType:"xlsx" , type : "array"});
    const excelBlob = new Blob([excelBuffer] , {type:"application/octet-stream"});
    saveAs(excelBlob , getNameExcel());
    }
    const getNameExcel = () => {
      return selectedMonth + ".xlsx" ;
    }
  return (
    <div>
      
      <h2>Ammo History</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="choose_date">
        <select name="month" id="month" onChange={handleMonthChange}>
          <option value="">Select Month</option>
          <option value="1">January</option>
          <option value="2">February</option>
          <option value="3">March</option>
          <option value="4">April</option>
          <option value="5">May</option>
          <option value="6">June</option>
          <option value="7">July</option>
          <option value="8">August</option>
          <option value="9">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>
      </div>

      <div className="hiatory-contanier">
      <table className="history-table">
        <thead className="history-thead">
          <tr className="history-tr">
            <th className="history-th">Ammo Name</th>
            <th className="history-th">Quantity</th>
            <th className="history-th">Old Quantity</th>
            <th className="history-th">Updated At</th>
            <th className="history-th">Action</th>
          </tr>
        </thead>
        <tbody className="history-tbody">
          {history.length > 0 ? (
            history.map((record) => (
              <tr className="history-tr" key={record.id}>
                <td className="history-td">{record.ammo_name}</td>
                <td className="history-td">{record.quantity}</td>
                <td className="history-td">{record.old_quantity ?? "N/A"}</td>
                <td className="history-td">{new Date(record.updated_at).toLocaleString()}</td>
                <td className="history-td">{record.action_type}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} style={{ textAlign: "center" }}>
                No records found
              </td>
            </tr>
          )}
        </tbody>
<div className="button" data-tooltip="Size: 20Mb" onClick={exportToExcel}>
<div className="button-wrapper">
  <div className="text">Download</div>
    <span className="icon">
      <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="2em" height="2em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"></path></svg>
    </span>
  </div>
</div>
      </table>
      </div>
      <img className="img-history" src="https://img.haarets.co.il/bs/00000185-0104-da38-a7fd-b18f1bf20000/e9/a9/747123244dca9d68241b08c8ff09/49878444.JPG" alt=""></img>
    </div>
  );
};

export default AmmoHistory;
