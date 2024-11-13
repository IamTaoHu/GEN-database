// Server.js

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const PORT = 3000;
const logPath = './log.json';

app.use(express.static(__dirname));
app.use(bodyParser.json());

// อ่านข้อมูลจาก log.json
app.get('/loadLog', async (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(logPath, 'utf8'));
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'ไม่สามารถอ่านข้อมูลจาก log ได้' });
    }
});

// บันทึกข้อมูลลง log.json
app.post('/saveEntry', async (req, res) => {
    try {
        const newEntry = req.body;
        let data = [];

        if (fs.existsSync(logPath)) {
            data = JSON.parse(fs.readFileSync(logPath, 'utf8'));
        }
        
        data.push(newEntry);
        fs.writeFileSync(logPath, JSON.stringify(data, null, 2), 'utf8');
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'ไม่สามารถบันทึกข้อมูลได้' });
    }
});

// เส้นทาง API สำหรับล้างข้อมูลทั้งหมดใน log.json
app.post('/clearLog', async (req, res) => {
    try {
        // เขียน array ว่างลงใน log.json เพื่อเคลียร์ข้อมูลทั้งหมด
        fs.writeFileSync(logPath, JSON.stringify([], null, 2), 'utf8');
        res.status(200).json({ success: true, message: 'ข้อมูลถูกล้างเรียบร้อยแล้ว' });
    } catch (error) {
        res.status(500).json({ error: 'ไม่สามารถล้างข้อมูลได้' });
    }
});

// เริ่ม server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
