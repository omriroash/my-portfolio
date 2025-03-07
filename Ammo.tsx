import React, { useEffect, useState } from 'react';
import './Ammo.css';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const AmmoList = () => {
  const [ammoData, setAmmoData] = useState<any[]>([]); 
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: string } | null>(null);
  const [newAmmo, setNewAmmo] = useState({ id: '', name: '', quantity: '', location: '' });
  const company  = localStorage.getItem('company');
  

  useEffect(() => {
    const fetchAmmoData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/ammo');
        if (response.ok) {
          const data = await response.json();
          
          if (Array.isArray(data)) {
            setAmmoData(data);
          } else if (data && data.ammo && Array.isArray(data.ammo)) {
            setAmmoData(data.ammo);
          } else {
            console.error('Fetched data is not an array:', data);
            setAmmoData([]); 
          }
        } else {
          console.error('Failed to fetch ammo data');
          setAmmoData([]); 
        }
      } catch (error) {
        console.error('Error fetching ammo data:', error);
        setAmmoData([]); 
      }
    };

    fetchAmmoData();
  }, []);

  const handleEditClick = (rowId: string, field: string ) => {
    setEditingCell({ rowId, field });
  };

  const deleteAmmo =async (rowId: string, p0: string , nameAmmo : string , quantityAmmo : string) => {
    const response = await fetch(`http://localhost:3001/api/ammo/${rowId}` , { 
      method : 'delete' , 
      headers: { 'Content-Type': 'application/json' },
      body : JSON.stringify({nameAmmo , quantityAmmo})
    });
    if(response.ok){
      alert('delete ammo successfully');
      window.location.reload();
    }
    else{
      console.log('error');
    }
  
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, rowId: string, field: string) => {
    const { value } = e.target;
    setAmmoData((prevAmmoData) =>
      prevAmmoData.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row
      )
    );
  };

  const handleSaveClick = async (rowId: string) => {
    const updatedRow = ammoData.find((row) => row.id === rowId);
    const updatedField = editingCell?.field;

    if (!updatedRow || !updatedField) {
      console.error('Invalid data to update');
      return;
    }

    const updatedValue = updatedRow[updatedField];

    try {
      const response = await fetch(`http://localhost:3001/api/ammo/${rowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: updatedField, value: updatedValue }),
      });

      if (response.ok) {
        console.log('Row updated successfully');
      } else {
        console.error('Failed to update row');
      }
    } catch (error) {
      console.error('Error updating row:', error);
    }

    setEditingCell(null);
  };

  const handleAddRow = async () => {
    const { id, name, quantity, location } = newAmmo;
    const updatedBy = localStorage.getItem('username');
    if (!id || !name || !quantity || !location) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/ammo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, quantity, location , updatedBy }),
      });

      if (response.ok) {
        const newRow = await response.json();
        setAmmoData((prev) => [...prev, newRow]);
        setNewAmmo({ id: '', name: '', quantity: '', location: '' });
        
      } else {
        console.error('Failed to add ammo');
      }
    } catch (error) {
      console.error('Error adding ammo:', error);
    }
  };
  const getExcelName = () => {
    const currentMonth = new Date().getMonth() + 1; 
    return `AMMO${currentMonth}.xlsx`;
  };
  
  
  const exportToExcel = async () => { 
  const worksheet = XLSX.utils.json_to_sheet(ammoData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook , worksheet , "Ammo Data");
  const excelBuffer = XLSX.write(workbook , {bookType:"xlsx" , type : "array"});
  const excelBlob = new Blob([excelBuffer] , {type:"application/octet-stream"});
  saveAs(excelBlob , getExcelName());
  }

  return (
    <div className="ammo-list">
      <h1>Ammo List</h1>
      <table className='ammo-table'>
        <thead className='ammo-thead'>
          <tr className='ammo-tr'>
            <th className='ammo-th'>ID</th>
            <th className='ammo-th'>Name</th>
            <th className='ammo-th'>Quantity</th>
            <th className='ammo-th'>Location</th>
            <th className='ammo-th'>Last Update</th>
            <th className='ammo-th'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {ammoData.length > 0 ? (
            ammoData.map((ammo) => (
              <tr className='ammo-tr' key={ammo.id}>
                <td className='ammo-td' id='id'>
                  {ammo.id}
                </td>
                <td className='ammo-td'>
                  {editingCell?.rowId === ammo.id && editingCell?.field === 'name' ? (
                    <input
                      type="text"
                      value={ammo.name}
                      onChange={(e) => handleInputChange(e, ammo.id, 'name')}
                    />
                  ) : (
                    ammo.name
                  )}
                </td>
                <td className='ammo-td'>
                  {editingCell?.rowId === ammo.id && editingCell?.field === 'quantity' ? (
                    <input
                      type="number"
                      value={ammo.quantity}
                      onChange={(e) => handleInputChange(e, ammo.id, 'quantity')}
                    />
                  ) : (
                    ammo.quantity
                  )}
                </td>
                <td className='ammo-td'>
                  {editingCell?.rowId === ammo.id && editingCell?.field === 'location' ? (
                    <input
                      type="text"
                      value={ammo.location}
                      onChange={(e) => handleInputChange(e, ammo.id, 'location')}
                    />
                  ) : (
                    ammo.location
                  )}
                </td>
                <td className='ammo-td'>{new Date(ammo.last_updated).toLocaleString('en-GB')}</td>
                <td className='ammo-td'>
                  {editingCell?.rowId === ammo.id ? (
                    <div className='box'>
                    <button className='addAmmo' onClick={() => handleSaveClick(ammo.id)}>Save</button>
                    </div>
                  ) : (
                    <>
                    {(company === ammo.location || company === 'himosh' || company === 'hativa') &&
                    
                    <><div className='box'>
                            <button className='addAmmo' onClick={() => handleEditClick(ammo.id, 'quantity')}>Edit Quantity</button>
                          </div><div className='box'>
                              <button className='addAmmo' onClick={() => handleEditClick(ammo.id, 'location')}>Edit Location</button>
                            </div><div className='box'>
                              <button className='addAmmo' onClick={() => deleteAmmo(ammo.id, 'id' , ammo.name , ammo.quantity)}>Delete</button>
                            </div></>}
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6}>No data available</td>
            </tr>
          )}
          <tr>
            <div className='addammo'>
            <td>
              <input
                type="text"
                value={newAmmo.id}
                onChange={(e) => setNewAmmo({ ...newAmmo, id: e.target.value })}
                placeholder="Enter ID"
              />
            </td>
            <td>
              <input
                type="text"
                value={newAmmo.name}
                onChange={(e) => setNewAmmo({ ...newAmmo, name: e.target.value })}
                placeholder="Enter Name"
              />
            </td>
            <td>
              <input
                type="number"
                value={newAmmo.quantity}
                onChange={(e) => setNewAmmo({ ...newAmmo, quantity: e.target.value })}
                placeholder="Enter Quantity"
              />
            </td>
            <td>
              <input
                type="text"
                value={newAmmo.location}
                onChange={(e) => setNewAmmo({ ...newAmmo, location: e.target.value })}
                placeholder="Enter Location"
              />
            </td>
            <td colSpan={2}>
              <div className='box'>
              <button className='addAmmo' onClick={handleAddRow}>Add</button>
              </div>
            </td>
            </div>
          </tr>
          <div className="button" data-tooltip="Size: 20Mb" onClick={exportToExcel}>
<div className="button-wrapper">
  <div className="text">Download</div>
    <span className="icon">
      <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="2em" height="2em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"></path></svg>
    </span>
  </div>
</div>
        </tbody>
      </table>
    </div>
  );
};

export default AmmoList;
