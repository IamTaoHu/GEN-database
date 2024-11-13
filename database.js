// Database.js

window.onload = pageLoad;
let selectedItem = "";
let selectedAmount = 0;
let selectedUnit = 0; // เพิ่มตัวแปรนี้เพื่อเก็บค่าของสินค้า

// ฟังก์ชันเริ่มต้น
function pageLoad() {
    document.getElementById("confirm").onclick = saveSelection;
    document.getElementById("bananaBtn").onclick = () => highlightButton("bananaBtn", "กล้วยทอด", 25);
    document.getElementById("potatoBtn").onclick = () => highlightButton("potatoBtn", "มันทอด", 25);
    document.getElementById("amount1").onclick = () => highlightButton("amount1", 1);
    document.getElementById("amount2").onclick = () => highlightButton("amount2", 2);
    document.getElementById("amount3").onclick = () => highlightButton("amount3", 3);
    setInterval(loadLog, 3000); // Update log every 3 seconds
}

// ฟังก์ชันเลือกปุ่มและไฮไลท์
function highlightButton(buttonId, item, unit = null) {
    document.querySelectorAll('.item-btn, .amount-btn').forEach(btn => btn.classList.remove('highlight'));
    document.getElementById(buttonId).classList.add('highlight');

    if (buttonId.includes("Btn")) {
        selectedItem = item;
        selectedUnit = unit;
    } else {
        selectedAmount = item;
    }
}

// ฟังก์ชันบันทึกข้อมูล
async function saveSelection() {
    if (!selectedItem || !selectedAmount) return alert("กรุณาเลือกทั้งสินค้าและจำนวน");

    const date = new Date();
    const entry = {
        orderId: null,
        item: selectedItem,
        time: date.toLocaleString(),
        amount: selectedAmount,
        unit: selectedUnit,
        total: selectedAmount * selectedUnit
    };

    await fetch('/saveEntry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
    });
}

// ฟังก์ชันโหลด log
async function loadLog() {
    await fetch('/loadLog')
        .then(response => response.json())
        .then(data => displayTable(data))
        .catch(error => console.error("ไม่สามารถโหลด log ได้", error));
}

// เพิ่ม checkbox ในแต่ละแถว
function addRowToTable(data) {
    const tableBody = document.getElementById("salesTableBody");
    const row = document.createElement("tr");

    row.innerHTML = `
        <td><input type="checkbox" class="row-select"></td>
        <td>${data.orderId}</td>
        <td>${data.item}</td>
        <td>${data.time}</td>
        <td>${data.amount}</td>
        <td>${data.unit}</td>
        <td>${data.total}</td>
    `;

    tableBody.appendChild(row);
}

let selectedCheckboxes = []; // เก็บสถานะของ checkbox ที่ถูกเลือก

async function loadLog() {
    await fetch('/loadLog')
        .then(response => response.json())
        .then(data => {
            displayTable(data);
            restoreCheckboxes(); // รีเซ็ตสถานะของ checkbox
        })
        .catch(error => console.error("ไม่สามารถโหลด log ได้", error));
}

// ฟังก์ชันแสดงข้อมูลในตาราง
function displayTable(entries) {
    const tableBody = document.getElementById("salesTableBody");
    tableBody.innerHTML = ""; // Clear table

    let totalSum = 0;
    entries.forEach((entry, index) => {
        entry.orderId = index + 1; // กำหนด Order ID
        const row = document.createElement("tr");

        // เพิ่ม checkbox ในแต่ละแถว
        const checkboxCell = document.createElement("td");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("row-select");
        checkboxCell.appendChild(checkbox);
        row.appendChild(checkboxCell);

        // ตรวจสอบว่ามีการเลือกแถวก่อนหน้าไหม
        if (selectedCheckboxes.includes(entry.orderId)) {
            checkbox.checked = true;
        }

        // เพิ่มข้อมูลในแถว
        Object.values(entry).forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
        totalSum += entry.total;
    });

    document.getElementById("totalSum").textContent = totalSum;
}

// ฟังก์ชันเก็บข้อมูลของ checkbox ที่ถูกเลือก
function restoreCheckboxes() {
    const checkboxes = document.querySelectorAll(".row-select");
    checkboxes.forEach((checkbox, index) => {
        if (checkbox.checked) {
            selectedCheckboxes.push(index + 1); // เก็บ ID ของแถวที่ถูกเลือก
        }
    });
}

// ฟังก์ชันลบแถวที่ถูกเลือก
async function deleteSelectedRows() {
    // ดึงข้อมูลแถวที่ถูกเลือก
    const selectedRows = [];
    document.querySelectorAll(".row-select:checked").forEach(checkbox => {
        const row = checkbox.closest("tr");
        const entry = {
            orderId: parseInt(row.cells[1].textContent),
            item: row.cells[2].textContent,
            time: row.cells[3].textContent,
            amount: parseInt(row.cells[4].textContent),
            unit: parseInt(row.cells[5].textContent),
            total: parseInt(row.cells[6].textContent)
        };
        selectedRows.push(entry);
    });

    if (selectedRows.length === 0) {
        return alert("กรุณาเลือกแถวที่ต้องการลบ");
    }

    try {
        // ส่งข้อมูลแถวที่ถูกเลือกไปยังเซิร์ฟเวอร์
        const response = await fetch('/deleteSelectedRows', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selectedEntries: selectedRows })
        });
        const result = await response.json();

        if (result.success) {
            alert("ลบข้อมูลสำเร็จ");
            loadLog(); // โหลดข้อมูลใหม่เพื่อล้างแถวที่ถูกลบออกจากตาราง
        } else {
            alert("ไม่สามารถลบข้อมูลได้");
        }
    } catch (error) {
        console.error("เกิดข้อผิดพลาด:", error);
        alert("ไม่สามารถลบข้อมูลได้");
    }
}

// เพิ่มฟังก์ชัน deleteSelectedRows เมื่อคลิกปุ่ม "ลบแถวที่เลือก"
document.getElementById('deleteSelected').onclick = deleteSelectedRows;
