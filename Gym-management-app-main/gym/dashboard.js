// Firebase refs
const dbRef = firebase.database().ref("gym-members");
const noticeRef = firebase.database().ref("notices");

// DOM Elements
const tableBody = document.getElementById("membersTableBody");
const searchInput = document.getElementById("searchInput");
const noticeForm = document.getElementById("noticeForm");
const noticeMessage = document.getElementById("noticeMessage");

let allMembers = []; // <- Store data persistently for filtering

// Section toggle
function showSection(id) {
  document.querySelectorAll('.section').forEach(sec => sec.style.display = 'none');
  document.getElementById(id).style.display = 'block';
}

// Fetch and update members
dbRef.on("value", (snapshot) => {
  allMembers = [];
  snapshot.forEach((child) => {
    allMembers.push({ id: child.key, ...child.val() });
  });

  allMembers.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  allMembers.forEach((member, index) => member.idNumber = String(index + 1).padStart(4, "0"));

  renderTable(allMembers);
});

// Render members
function renderTable(members) {
  tableBody.innerHTML = "";

  if (members.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No members found.</td></tr>`;
    return;
  }

  members.forEach(member => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${member.idNumber}</td>
      <td>${member.name}</td>
      <td>${member.age}</td>
      <td>${member.package}</td>
      <td>${new Date(member.timestamp).toLocaleString()}</td>
      <td>
        <button onclick="deleteMember('${member.id}')">Delete</button>
        <button onclick="showReceipt('${member.idNumber}', '${member.name}', '${member.age}', '${member.package}', '${new Date(member.timestamp).toLocaleString()}')">View Receipt</button>
        <button onclick="alertPayment('${member.id}', '${member.name}')">Alert Payment</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Add member
document.getElementById("addMemberForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("memberName").value.trim();
  const age = document.getElementById("memberAge").value.trim();
  const packageType = document.getElementById("memberPackage").value;
  const timestamp = new Date().toISOString();

  if (name && age && packageType) {
    dbRef.push({ name, age, package: packageType, timestamp });
    e.target.reset();
  }
});

// Delete member
function deleteMember(id) {
  dbRef.child(id).remove();
}

function showReceipt(id, name, age, pkg, date) {
  const receiptHTML = `
    <h2>Maxed-out GYM</h2>
    <h3>E-receipt</h3>
    <p><strong>ID:</strong> ${id}</p>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Age:</strong> ${age}</p>
    <p><strong>Package:</strong> ${pkg}</p>
    <p><strong>Date:</strong> ${date}</p>
    <hr />
    <p>Thank you for joining our gym!</p>
    <button onclick="closeReceipt()" style="
      margin-top: 20px;
      padding: 10px 20px;
      background-color: #f44336;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
    ">Close</button>
  `;


  const modal = document.getElementById("receiptModal");
  const content = document.getElementById("receiptContent");

  if (!modal || !content) {
    console.error("❌ receiptModal or receiptContent not found.");
    return;
  }

  content.innerHTML = receiptHTML;
  modal.style.display = "flex";
};

// Alert payment
function alertPayment(id, name) {
  dbRef.child(id).update({ paymentAlert: true }).then(() => {
    alert(`⚠️ Payment alert sent to ${name}`);
  });
}

// Search functionality (now working)
searchInput.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();

  const filtered = allMembers.filter(m =>
    m.name.toLowerCase().includes(query) || m.idNumber.includes(query)
  );

  renderTable(filtered);
});

// Send notice
noticeForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = noticeMessage.value.trim();

  if (!message) {
    alert("Please enter a notice message.");
    return;
  }

  const timestamp = Date.now();

  noticeRef.push({ message, timestamp }).then(() => {
    alert("✅ Notice sent to all members.");
    noticeForm.reset();
    closeNoticeModal();
  }).catch((error) => {
    console.error("Error sending notice:", error);
    alert("❌ Failed to send notice. Try again.");
  });
});

// Notice modal
function openNoticeModal() {
  document.getElementById("noticeModal").style.display = "flex";
}

function closeNoticeModal() {
  document.getElementById("noticeModal").style.display = "none";
}

// Optional session check (if you store something on login)
if (!localStorage.getItem("adminLoggedIn")) {
  window.location.href = "admin_login.html";
}
document.getElementById("logoutBtn").addEventListener("click", () => {
  // Optional: Clear any session/localStorage
  localStorage.clear();  // ← Only if you're using localStorage for login

  // Redirect to login page
  window.location.href = "admin_login.html";
});

// Close modal when clicking outside the content box
window.addEventListener("click", function (e) {
  const modal = document.getElementById("receiptModal");
  const content = document.getElementById("receiptContent");

  if (modal.style.display === "flex" && !content.contains(e.target)) {
    closeReceipt();
  }
});
