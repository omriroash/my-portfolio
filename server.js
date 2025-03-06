import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
// eslint-disable-next-line no-unused-vars
import cookieParser from 'cookie-parser';
// eslint-disable-next-line no-unused-vars
import path from 'path';


const app = express();
const port = 3001;

const db = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'omriroash24',
  database: 'ammo_inventory',
});



app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, 
}));
app.use(express.json());
app.use(cookieParser());
app.use((req, _res, next) => {
  console.log('Middleware reached');
    next();
});

app.post('/api/register', (req, res) => {
  const { id, username, password, email, company } = req.body;

  if (!id || !username || !password || !email || !company) {
    return res.status(400).json({ message: 'חסר שדה כלשהו' });
  }

  const query = 'INSERT INTO request_user (id, name, password, email, company) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [id, username, password, email, company], (err, result) => {
    if (err) {
      console.error("❌ שגיאה:", err);
      return res.status(500).json({ message: 'שגיאה בהוספת משתמש' });
    }

    console.log("✅ הרשמה הצליחה!");

    return res.status(200).json({ message: 'הרשמה הצליחה!' }); 
  });
});

app.post('/api/login', async (req, res) => {
  console.log('Login API called');
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Missing username or password' });
  }

  try {
    const [results] = await db.execute('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);

    if (results.length === 0) {
      console.log('Invalid credentials');
      return res.status(404).json({ message: 'Invalid username or password' });
    }

    const user = results[0]; 

    console.log('Query results:', user);

    res.cookie('isAdmin', user.admin, { httpOnly: true, secure: false, maxAge: 24 * 60 * 60 * 1000 });

    return res.status(200).json({
      message: 'Login successful',
      user: { id: user.id, username: user.username, isAdmin: user.admin, company: user.company }
    });

  } catch (err) {
    console.error('Database or server error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});



app.get('/api/ammo', async (_req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM ammo_types');
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'No ammo data found' });
    }
    
    res.status(200).json({ ammo: results });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ message: 'Error retrieving ammo data' });
  }
});



app.post('/api/ammo', (req, res) => {
  const { id, name, quantity, location, updatedBy } = req.body;

  if (!id || !name || !quantity || !location) {
    return res.status(400).json({ message: 'יש למלא את כל השדות' });
  }
  const queryHistory = `INSERT INTO ammo_history (ammo_name, quantity, updated_by, action_type) VALUES (?, ?, ?, 'INSERT')`;
  db.query(queryHistory, [name, quantity, updatedBy || 'system'], (err) => {
    if (err) {
      console.error('Error adding to history:', err);
    }
  });

  const queryAmmo = 'INSERT INTO ammo_types (id, name, quantity, location) VALUES (?, ?, ?, ?)';
  db.query(queryAmmo, [id, name, quantity, location], (err, result) => {
    if (err) {
      console.error('Error adding ammo:', err);
      return res.status(500).json({ message: 'שגיאה בהוספת תחמושת' });
    }

    res.status(201).json({ id, name, quantity, location });
  });
});

app.delete('/api/ammo/:id', async (req, res) => {
  const { id } = req.params;
  const { nameAmmo , quantityAmmo , updatedBy} = req.body; 

  try {
    const deleteQuery = `DELETE FROM ammo_types WHERE id = ?`;
    const [deleteResult] = await db.query(deleteQuery, [id]);

    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

  
    const historyQuery = `INSERT INTO ammo_history (ammo_name, quantity, updated_by, action_type, old_quantity) VALUES (?, ?, ?, 'DELETE', ?)`;
    await db.query(historyQuery, [nameAmmo, quantityAmmo, updatedBy || 'system', quantityAmmo]);

    res.status(200).json({ message: 'Delete successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/ammo/:id', async (req, res) => {
  const { id } = req.params;
  const { field, value, updatedBy } = req.body;

  const allowedFields = ['name', 'quantity', 'location'];

  if (!allowedFields.includes(field)) {
    return res.status(400).json({ message: 'Invalid field name' });
  }

  try {
    // קודם נשלוף את הערך הישן
    const getOldValueQuery = `SELECT ${field} FROM ammo_types WHERE id = ?`;
    const [oldResult] = await db.query(getOldValueQuery, [id]);

    if (!oldResult || oldResult.length === 0) {
      return res.status(404).json({ message: 'Row not found' });
    }

    const oldValue = oldResult[field];

    const historyQuery = `
    INSERT INTO ammo_history (ammo_name, quantity, updated_by, action_type, old_quantity) 
    SELECT name, quantity, ?, 'UPDATE', ? FROM ammo_types WHERE id = ?
  `;
  await db.query(historyQuery, [updatedBy || 'system', oldValue, id]);
    const updateQuery = `UPDATE ammo_types SET ${field} = ? WHERE id = ?`;
    const [updateResult] = await db.query(updateQuery, [value, id]);

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ message: 'Row not found' });
    }


    res.status(200).json({ message: 'Successfully updated' });
  } catch (error) {
    console.error('Error updating ammo:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/users', async (req, res) => {
  console.log('Fetching all users');
  
  try {
    const [results] = await db.query('SELECT * FROM users'); 

    if (results.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    res.status(200).json({ users: results });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/users/:id', (req, res) => {
  const { id } = req.params; 
  const fieldsToUpdate = req.body; 
  
  console.log("Received ID:", id);
  console.log("Fields to update:", fieldsToUpdate);

  if (!id || !fieldsToUpdate || Object.keys(fieldsToUpdate).length === 0) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  const updates = Object.keys(fieldsToUpdate)
    .map((field) => `${field} = ?`)
    .join(', ');
  const values = [...Object.values(fieldsToUpdate), id];
  const sql = `UPDATE users SET ${updates} WHERE id = ?`;

  console.log("Generated SQL:", sql);
  console.log("Values:", values);

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error('Error updating user:', err);
      return res.status(500).json({ message: 'Failed to update user' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User updated successfully' });
  });
});
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Invalid ID' });
  }

  const sql = 'DELETE FROM users WHERE id = ?';

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ message: 'Failed to delete user' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  });
});

app.get('/api/announcements', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM announcements ORDER BY created_at DESC');
    res.json(rows); 
  } catch (err) {
    console.error('Error fetching announcements:', err);
    res.status(500).send('Error fetching announcements');
  }
});


app.post('/api/announcements', async (req, res) => {
  const { title, content , type } = req.body;
  console.log(title , content , type)
  if (!title || !content) return res.status(400).send('Title and content are required');
  
  try {
      db.query('INSERT INTO announcements (title, content , type) VALUES (?, ? , ?)', [title, content , type]);
      res.status(201).send('Announcement added successfully');
  } catch (err) {
      res.status(500).send('Error adding announcement');
  }
});



app.get('/api/hativa' , async (req , res) => {
  try { 
    const response = await db.query('select * from ammo_hativa');
    if(response.length > 0 ){
      res.status(200).json(response[0]);
    }
    else {
      res.status(404).json({message : 'data not found'});
    }
  }
  catch(err){
    console.log(err)
    res.status(500).json({message : 'failed to fetch data'});
  }
});
app.post('/api/hativa', (req, res) => {
  const { id, name, quantity } = req.body;

  if (!id || !name || !quantity) {
    return res.status(400).json({ message: 'יש למלא את כל השדות' });
  }

  const query = 'INSERT INTO ammo_hativa (id, name, quantity) VALUES (?, ?, ?)';
  db.query(query, [id, name, quantity], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'שגיאה בהוספת תחמושת' });
    }

    const selectQuery = 'SELECT * FROM ammo_hativa WHERE id = ?';
    db.query(selectQuery, [id], (err, rows) => {
      if (err) {
        return res.status(500).json({ message: 'שגיאה בקבלת תחמושת חדשה' });
      }
      res.status(201).json(rows[0]);
    });
  });
});

app.put('/api/hativa/:id', async (req, res) => {
  const { id } = req.params;
  const { value } = req.body; 

  try {
    const query = `UPDATE ammo_hativa SET quantity = ? WHERE id = ?`;
    const [result] = await db.query(query, [value, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Row not found' });
    }
    console.log('successfull');
    res.status(200).json({ message: 'Successfully updated', id, newQuantity: value });
  } catch (error) {
    console.error('Error updating quantity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/request' , async (req , res) => {
  console.log('Fetching all users');
  
  try {
    const [results] = await db.query('SELECT * FROM request_user'); 

    if (results.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    res.status(200).json({ users: results });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
app.post('/api/approve' ,  async (req,res) => {
  const { id, name, password, email, company } = req.body;

  try {
    const sql = 'INSERT INTO users (id, username, password, email, company) VALUES (?, ?, ?, ?, ?)';
    await db.query(sql, [id, name, password, email, company]);
    
    res.status(201).json({ message: 'User added successfully' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Error adding user' });
  }
});
app.delete('/api/request/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const sql = 'DELETE FROM request_user WHERE id = ?';
    await db.query(sql, [userId]);

    res.status(200).json({ message: 'User request deleted' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Error deleting user request' });
  }
});

app.get("/api/ammo-history", async (req, res) => {
  const month = req.query.month; 
  

  try {
    const query = `SELECT * FROM ammo_history WHERE MONTH(updated_at) = ?`;
    const [rows] = await db.execute(query, [month]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});




app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});