// Server.js

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const PORT = 3000;
const path = require('path');
const logPath = path.join(__dirname, 'log.json');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(express.json());

// อ่านข้อมูลจาก log.json
app.get('/loadLog', async (req, res) => {
    try {
        const data = JSON.parse( await fs.readFileSync(logPath, 'utf8'));
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'ไม่สามารถอ่านข้อมูลจาก log ได้' });

    }
});

// บันทึกข้อมูลลง log.json
app.post('/saveEntry', async (req, res) => {
    const newEntry = req.body;

    try {
        // อ่านข้อมูลจาก log.json
        const data = JSON.parse(await fs.promises.readFile(logPath, 'utf8'));

        // หา orderId สูงสุดที่มีอยู่ใน log.json แล้วบวก 1
        const maxOrderId = data.length > 0 ? Math.max(...data.map(entry => entry.orderId || 0)) : 0;
        newEntry.orderId = maxOrderId + 1;

        // เพิ่มรายการใหม่ในข้อมูล
        data.push(newEntry);

        // เขียนข้อมูลกลับไปที่ log.json
        await fs.promises.writeFile(logPath, JSON.stringify(data, null, 2), 'utf8');

        res.json({ success: true, message: 'บันทึกข้อมูลเรียบร้อย' });
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
        res.json({ success: false, message: 'ไม่สามารถบันทึกข้อมูลได้' });
    }
});

app.post('/deleteSelectedRows', async (req, res) => {
    const { selectedEntries } = req.body; // รับข้อมูลที่ถูกเลือกจากไคลเอนต์

    try {
        const data = JSON.parse(await fs.promises.readFile(logPath, 'utf8'));
        
       //
       
       
       //กรองข้อมูลเพื่อเก็บเฉพาะแถวที่ไม่ตรงกับ selectedEntries
        const updatedData = data.filter(entry => 
            !selectedEntries.some(selected => 
                selected.item === entry.item &&
                selected.time === entry.time &&
                selected.amount === entry.amount &&
                selected.unit === entry.unit &&
                selected.total === entry.total
            )
        );

        
//        for (i = 0;i < data.length;i++) {
//         for (m = 0;m < selectedEntries.length;m++){
//             console.log(data[i].orderId , selectedEntries[m].orderId);
//             if (i == selectedEntries[m].orderId){
//                 console.log("delete row "+ selectedEntries[m].orderID);
// data[i] = null;
//             }
            
//         }
//        }
        // เขียนข้อมูลที่ถูกกรองกลับไปที่ log.json
        await fs.promises.writeFile(logPath, JSON.stringify(updatedData, null, 2), 'utf8');

        res.json({ success: true }); // ส่งสถานะการลบสำเร็จ
    } catch (error) {
        console.error("เกิดข้อผิดพลาด:", error);
        res.json({ success: false, message: 'ลบข้อมูลไม่สำเร็จ' }); // ส่งสถานะการลบไม่สำเร็จ
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
