// Firebase Refs
const dbRef = firebase.database().ref("gym-members");
const loginForm = document.getElementById("loginForm");
const loginContainer = document.getElementById("loginContainer");
const memberInfo = document.getElementById("memberInfo");
const noticeBoard = document.getElementById("memberNoticeBoard");
const noticesContainer = document.getElementById("noticesContainer");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get input values
  const inputId = document.getElementById("memberIdInput").value.trim().padStart(4, "0"); // e.g., "1" → "0001"
  const inputName = document.getElementById("memberNameInput").value.trim().toLowerCase();

  if (!inputId || !inputName) {
    alert("❌ Please enter both ID and Name.");
    return;
  }

  // Fetch all members
  dbRef.once("value").then((snapshot) => {
    const members = [];

    snapshot.forEach((child) => {
      members.push({ id: child.key, ...child.val() });
    });

    // Sort and generate ID numbers
    members.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    members.forEach((m, i) => m.idNumber = String(i + 1).padStart(4, "0"));

    // Log for debugging
    console.log("Available members:", members);

    // Find the member
    const found = members.find(m =>
      m.idNumber === inputId &&
      m.name.toLowerCase() === inputName
    );

    if (found) {
      // Show member info
      loginContainer.style.display = "none";
      memberInfo.style.display = "block";
      noticeBoard.style.display = "block";

      document.getElementById("infoId").textContent = found.idNumber;
      document.getElementById("infoName").textContent = found.name;
      document.getElementById("infoAge").textContent = found.age;
      document.getElementById("infoPackage").textContent = found.package;
      document.getElementById("infoTimestamp").textContent = new Date(found.timestamp).toLocaleString();

      // Check for payment alert
      const memberRef = firebase.database().ref(`gym-members/${found.id}`);
      memberRef.on("value", snap => {
        const data = snap.val();
        if (data.paymentAlert) {
          alert("⚠️ Payment Due Alert!\nPlease clear your payment.");
          memberRef.update({ paymentAlert: null }); // clear after showing
        }
      });

      // Load notices
      firebase.database().ref("notices").orderByChild("timestamp").on("value", (snap) => {
        const notices = [];
        snap.forEach(child => notices.push(child.val()));
        notices.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        noticesContainer.innerHTML = ""; // clear old

        if (notices.length > 0) {
          notices.forEach((n) => {
            const noticeDiv = document.createElement("div");
            noticeDiv.className = "notice-item";
            noticeDiv.style.borderBottom = "1px solid #ddd";
            noticeDiv.style.margin = "8px 0";
            noticeDiv.style.padding = "6px";

            noticeDiv.innerHTML = `
              <small>${new Date(n.timestamp).toLocaleString()}</small>
              <p>${n.message}</p>
              <button class="dismiss-btn" style="background:#f44336;color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;margin-top:4px;">
                Dismiss
              </button>
            `;

            noticeDiv.querySelector(".dismiss-btn").addEventListener("click", () => {
              noticeDiv.remove();
            });

            noticesContainer.appendChild(noticeDiv);
          });
        } else {
          noticesContainer.innerHTML = "<p>No notices at the moment.</p>";
        }
      });

    } else {
      alert("❌ Member not found. Please check your ID and Name.");
    }
  }).catch((error) => {
    console.error("❌ Firebase error:", error);
    alert("Something went wrong. Please try again later.");
  });
});

// Member Logout Button
document.getElementById("memberLogoutBtn").addEventListener("click", () => {
  // Hide info and show login again
  memberInfo.style.display = "none";
  noticeBoard.style.display = "none";
  loginContainer.style.display = "block";

  // Optional: Clear form inputs
  document.getElementById("loginForm").reset();
});
