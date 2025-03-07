import React, { useEffect, useState } from 'react';
import './hativa.css';

const Hativa = () => {
    const [ammoData, setAmmoData] = useState<any[]>([]);  
    const [newAmmo, setNewAmmo] = useState({ id: '', name: '', quantity: '' });
    const [selectedAmmo, setSelectedAmmo] = useState<{ id: string, name: string } | null>(null);
    const [orderQuantity, setOrderQuantity] = useState('');
    const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({});
    const [editedQuantity, setEditedQuantity] = useState<{ [key: string]: string }>({});

    const companyStatus = localStorage.getItem('company') === 'himosh'; 

    const getData = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/hativa');
            const data = await response.json();
            setAmmoData(data);
        } catch (err) {
            console.log(err);
        }
    };
    const editClick = (id:string , quantity : string ) => {
         setEditMode((prev) =>({...prev , [id] : true}));
         setEditedQuantity((prev) =>({...prev , [id]:quantity}));
    };
    const saveClick = async(id:string) => {
        try {
            const response = await fetch(`http://localhost:3001/api/hativa/${id}` , {
                method : 'PUT',
                headers:{'Content-Type' : 'application/json'},
                body : JSON.stringify( {value : Number(editedQuantity[id])}),
            });
            if (response.ok){
                alert('successfull') ;
                setEditMode((prev)=>({...prev , [id] : false}));
                window.location.reload();
            }
        }
        catch(err) {
             console.log('error : ' , err);
        }
    };

    const handleAddRow = async () => {
        const { id, name, quantity } = newAmmo;
    
        if (!id || !name || !quantity) {
            alert('Please fill in all fields');
            return;
        }
    
        try {
            const response = await fetch('http://localhost:3001/api/hativa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, name, quantity }),
            });
    
            if (response.ok) {
                const newRow = await response.json();
                setAmmoData((prev) => [...prev, newRow]);
                setNewAmmo({ id: '', name: '', quantity: '' });
            } else {
                console.error('Failed to add ammo');
            }
        } catch (error) {
            console.error('Error adding ammo:', error);
        }
    };

    const handleOrderClick = (ammo: { id: string, name: string }) => {
        setSelectedAmmo(ammo); 
        setOrderQuantity(''); 
    };

    const handleOrderSubmit = async () => {
        if (!orderQuantity) {
            alert('נא להזין כמות');
            return;
        }

        const announcementData = {
            title : selectedAmmo?.name , 
            content : `quantity : ${orderQuantity}` , 
            type : 'order' , 
        }
        try {
            const response = await fetch('http://localhost:3001/api/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(announcementData),
            });

            if (response.ok) {
                alert('ההזמנה נשלחה בהצלחה!');
                setSelectedAmmo(null); 
                setOrderQuantity('');
            } else {
                console.error('שגיאה בשליחת ההזמנה');
            }
        } catch (error) {
            console.error('שגיאה:', error);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    return (
        <div >
            <h1>Welcome to Hativa 215</h1>
            <table className="table_hativa">
                <thead>
                    <tr>
                        <th className='hativa-th'>ID</th>
                        <th className='hativa-th'>Name</th>
                        <th className='hativa-th'>Quantity</th>
                        <th className='hativa-th'>Last Update</th>
                        {companyStatus ? <th className='hativa-th'>Order</th> : <th className='hativa-th'>Edit Quantity</th>}
                    </tr>
                </thead>
                <tbody>
                    {ammoData.map((ammo) => (
                        <tr key={ammo.id}>
                            <td className='hativa-td'>{ammo.id}</td>
                            <td className='hativa-td'>{ammo.name}</td>
                            <td className='hativa-td'>
                                {editMode[ammo.id] ? (
                                    <><input
                                        type='number'
                                        className='input'
                                        value={editedQuantity[ammo.id] || ammo.quantity}
                                        onChange={(e) => setEditedQuantity((prev) => ({ ...prev, [ammo.id]: e.target.value }))} /><button onClick={()=>saveClick(ammo.id)}>Save</button></>
                                ) : ammo.quantity}
                            </td>
                            <td className='hativa-td'>{new Date(ammo.last_updated).toLocaleString('en-GB')}</td>
                            {companyStatus ? (
                                <td>
                                    <div className='box'>
                                    <button className='addAmmo' onClick={() => handleOrderClick(ammo)}>Order Ammo</button>
                                    </div>
                                    {selectedAmmo?.id === ammo.id && (
                                        <div className="form-popup">
                                            <div className="form-container" onSubmit={(e) => { e.preventDefault(); handleOrderSubmit(); }}>
                                                <input
                                                    type="number"
                                                    placeholder="Enter quantity"
                                                    value={orderQuantity}
                                                    onChange={(e) => setOrderQuantity(e.target.value)}
                                                />
                                                <button type="submit" onClick={handleOrderSubmit} >Save</button>
                                                <button type="button" onClick={() => setSelectedAmmo(null)}>Close</button>
                                            </div>
                                        </div>
                                    )}
                                </td>
                            ) : (
                                <td>
                                    <button className='btn-quantity' onClick={() => editClick(ammo.id , ammo.quantity)}>Edit Quantity</button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td>
                            <input
                                type="text"
                                className='input'
                                value={newAmmo.id}
                                onChange={(e) => setNewAmmo({ ...newAmmo, id: e.target.value })}
                                placeholder="Enter ID"
                            />
                        </td>
                        <td>
                            <input
                                type="text"
                                className='input'
                                value={newAmmo.name}
                                onChange={(e) => setNewAmmo({ ...newAmmo, name: e.target.value })}
                                placeholder="Enter Name"
                            />
                        </td>
                        <td>
                            <input
                                type="number"
                                className='input'
                                value={newAmmo.quantity}
                                onChange={(e) => setNewAmmo({ ...newAmmo, quantity: e.target.value })}
                                placeholder="Enter Quantity"
                            />
                        </td>
                        <td>
                            <button className="add-button" onClick={handleAddRow}><span className='span'>Add</span></button>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

export default Hativa;
