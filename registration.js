let editIndex = -1;
const API_URL = 'http://localhost:3000/api/members'; // Node.js/Express backend endpoint

const memberForm = document.getElementById("memberForm");
const messageBox = document.getElementById("messageBox");
const memberTableBody = document.getElementById("memberTableBody");
const jsonOutput = document.getElementById("jsonOutput");
const clearBtn = document.getElementById("clearBtn");

// All form field IDs
const fieldIds = [
  "memberName", "email", "yearLevel", "organization", 
  "studentId", "major", "clubRole", "phone", 
  "interests", "availability"
];

// Required fields
const requiredFields = ["memberName", "email", "yearLevel", "organization"];

function getMembers() {
  let members = localStorage.getItem("studentClubMembers");
  return members ? JSON.parse(members) : [];
}

function saveMembers(members) {
  localStorage.setItem("studentClubMembers", JSON.stringify(members));
  updateJsonPreview();
}

function getFormData() {
  const data = {};
  fieldIds.forEach(id => {
    data[id] = document.getElementById(id).value.trim();
  });
  data.submittedAt = new Date().toISOString();
  return data;
}

function validateForm() {
  let isValid = true;
  clearValidationStyles();

  requiredFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field.value.trim() === "") {
      field.classList.add("is-invalid");
      isValid = false;
    }
  });

  const emailField = document.getElementById("email");
  if (!validEmail(emailField.value.trim())) {
    emailField.classList.add("is-invalid");
    isValid = false;
  }

  const phoneField = document.getElementById("phone");
  const phoneValue = phoneField.value.trim();
  if (phoneValue && !/^\+?[0-9\-() ]{7,20}$/.test(phoneValue)) {
    phoneField.classList.add("is-invalid");
    isValid = false;
  }

  return isValid;
}

function validEmail(emailText) {
  return /^\S+@\S+\.\S+$/.test(emailText);
}

function clearValidationStyles() {
  fieldIds.forEach(id => {
    document.getElementById(id).classList.remove("is-invalid");
  });
}

function showMessage(text, type) {
  messageBox.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${text}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
}

function updateJsonPreview() {
  const members = getMembers();
  jsonOutput.textContent = JSON.stringify(members, null, 2);
}

function renderMembers() {
  const members = getMembers();
  memberTableBody.innerHTML = "";

  if (members.length === 0) {
    memberTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-4">No members registered yet.</td>
      </tr>
    `;
  } else {
    members.forEach((member, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${member.memberName}</td>
        <td>${member.email}</td>
        <td>${member.yearLevel}</td>
        <td>${member.clubRole}</td>
        <td>${member.phone || "-"}</td>
        <td>
          <button class="btn btn-sm btn-warning me-1" onclick="editMember(${index})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteMember(${index})">Delete</button>
        </td>
      `;
      memberTableBody.appendChild(row);
    });
  }
}

function editMember(index) {
  const members = getMembers();
  const member = members[index];

  fieldIds.forEach(id => {
    const field = document.getElementById(id);
    field.value = member[id] || "";
  });

  editIndex = index;
  showMessage("Member loaded for editing.", "info");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteMember(index) {
  if (confirm("Are you sure you want to delete this member?")) {
    const members = getMembers();
    members.splice(index, 1);
    saveMembers(members);
    renderMembers();
    showMessage("Member deleted successfully.", "warning");
  }
}

function resetForm() {
  memberForm.reset();
  editIndex = -1;
  clearValidationStyles();
  messageBox.innerHTML = "";
}

async function sendToServer(memberData) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(memberData)
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    showMessage("Member saved and sent to server successfully.", "success");
  } catch (error) {
    console.error("AJAX POST failed:", error);
    showMessage(`Saved locally. Server POST failed: ${error.message}`, "danger");
  }
}

memberForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  if (!validateForm()) {
    showMessage("Please fix the errors in red and try again.", "danger");
    return;
  }

  const memberData = getFormData();
  const members = getMembers();

  if (editIndex === -1) {
    members.push(memberData);
    showMessage("Member added successfully.", "success");
  } else {
    members[editIndex] = memberData;
    showMessage("Member updated successfully.", "success");
    editIndex = -1;
  }

  saveMembers(members);
  renderMembers();
  resetForm();

  // Send to server
  await sendToServer(memberData);
});

clearBtn.addEventListener("click", function () {
  resetForm();
});

// Initial render
renderMembers();
