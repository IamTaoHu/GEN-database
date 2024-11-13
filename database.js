// Database.js

window.onload = pageLoad;
let selectedItem = "";
let selectedAmount = 0;
let selectedUnit = 0; // เพิ่มตัวแปรนี้เพื่อเก็บค่าของสินค้า

// ฟังก์ชันเริ่มต้น
function pageLoad() {
    document.getElementById("confirm").onclick = saveSelection;
    document.getElementById("bananaBtn").onclick = () => highlightButton("bananaBtn", "กล้วยทอด", 25);
    document.getElementById("potatoBtn").onclick = () => highlightButton("potatoBtn", "มันทอด", 20);
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

// แสดงข้อมูลในตาราง
function displayTable(entries) {
    const tableBody = document.getElementById("salesTableBody");
    tableBody.innerHTML = ""; // Clear table

    let totalSum = 0;
    entries.forEach((entry, index) => {
        entry.orderId = index + 1;
        const row = document.createElement("tr");

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

