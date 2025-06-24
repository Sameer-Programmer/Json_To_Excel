// script.js
let jsonData = [];
let currentPage = 1;
const rowsPerPage = 10;
let currentSort = { column: null, ascending: true };

function loadFromText() {
  try {
    const input = document.getElementById("jsonInput").value;
    const parsed = JSON.parse(input);
    jsonData = parsed.data || parsed;
    currentPage = 1;
    renderTable();
    document.getElementById("downloadBtn").disabled = false;
  } catch (e) {
    alert("Invalid JSON");
  }
}

function loadFromFile() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const content = e.target.result;
      const parsed = JSON.parse(content);
      jsonData = parsed.data || parsed;
      currentPage = 1;
      renderTable();
      document.getElementById("downloadBtn").disabled = false;
    } catch (err) {
      alert("Error reading file");
    }
  };
  reader.readAsText(file);
}

function renderTable() {
  const container = document.getElementById("table-container");
  container.innerHTML = "";

  const table = document.createElement("table");
  if (!jsonData.length) return;

  const headers = Object.keys(jsonData[0]);
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  headers.forEach(header => {
    const th = document.createElement("th");
    th.textContent = header;
    th.onclick = () => sortTable(header);
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  const filteredData = getFilteredData();
  const paginatedData = getPaginatedData(filteredData);

  paginatedData.forEach(row => {
    const tr = document.createElement("tr");
    headers.forEach(header => {
      const td = document.createElement("td");
      td.textContent = row[header];
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  container.appendChild(table);
  renderPagination(filteredData.length);
}

function sortTable(column) {
  const ascending = currentSort.column === column ? !currentSort.ascending : true;
  currentSort = { column, ascending };
  jsonData.sort((a, b) => {
    if (a[column] == null) return 1;
    if (b[column] == null) return -1;
    if (a[column] === b[column]) return 0;
    return ascending ? a[column] > b[column] ? 1 : -1 : a[column] < b[column] ? 1 : -1;
  });
  renderTable();
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

function downloadExcel() {
  const headers = Object.keys(jsonData[0]);
  const rows = jsonData.map(row => headers.map(h => row[h]));
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += headers.join(",") + "\n";
  rows.forEach(r => {
    csvContent += r.map(val => JSON.stringify(val ?? "")).join(",") + "\n";
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "data.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function filterTable() {
  currentPage = 1;
  renderTable();
}

function getFilteredData() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  if (!query) return jsonData;
  return jsonData.filter(item =>
    Object.values(item).some(val => val && val.toString().toLowerCase().includes(query))
  );
}

function getPaginatedData(data) {
  const start = (currentPage - 1) * rowsPerPage;
  return data.slice(start, start + rowsPerPage);
}

function renderPagination(totalRows) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.style.fontWeight = "bold";
    btn.onclick = () => {
      currentPage = i;
      renderTable();
    };
    pagination.appendChild(btn);
  }
}
