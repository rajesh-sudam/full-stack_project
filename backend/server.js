const express = require('express');
const cors = require('cors');
const pool=require('./db');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Ashgrove Renewable API Running");
});

app.get('/customers', async (req, res) => {
  const result = await pool.query('SELECT * FROM customers');

  res.json(result.rows);

});

app.post('/customers', async (req, res) => {
  const { name, email, phone } = req.body;
  const result = await pool.query(
    'INSERT INTO customers (name, email, phone) VALUES ($1, $2, $3) RETURNING *',
    [name, email, phone]
  );
  res.json(result.rows[0]);
});

app.put('/customers/:id', async(req,res)=>{

    const { name,email,phone } = req.body;

    const result = await pool.query(
        `
        UPDATE customers
        SET
            name=$1,
            email=$2,
            phone=$3
        WHERE id=$4
        RETURNING *
        `,
        [
            name,
            email,
            phone,
            req.params.id
        ]
    );

    res.json(result.rows[0]);
});

app.delete('/customers/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM customers WHERE id = $1', [id]);
  res.json({ message: 'Customer deleted successfully'})
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
