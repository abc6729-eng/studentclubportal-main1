import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const MEMBERS_FILE = path.join(__dirname, "members.json");

app.use(cors());
app.use(express.json());

function ensureMembersFile() {
  try {
    if (!fs.existsSync(MEMBERS_FILE)) {
      fs.writeFileSync(MEMBERS_FILE, "[]", "utf8");
    }
  } catch (error) {
    console.error("Error creating members file:", error);
  }
}

function getMembers() {
  try {
    ensureMembersFile();
    const data = fs.readFileSync(MEMBERS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading members file:", error);
    return [];
  }
}

function saveMembers(members) {
  try {
    fs.writeFileSync(MEMBERS_FILE, JSON.stringify(members, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error saving members file:", error);
    return false;
  }
}

function isValidStatus(status) {
  return ["pending", "approved", "declined"].includes(status);
}

app.get("/", (req, res) => {
  res.json({ message: "PSU E-Sports Club Backend API is running" });
});

app.get("/api/members", (req, res) => {
  const members = getMembers();
  res.json(members);
});

app.post("/api/members", (req, res) => {
  try {
    const incoming = req.body;

    if (
      !incoming.memberName ||
      !incoming.email ||
      !incoming.yearLevel ||
      !incoming.organization
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields"
      });
    }

    const members = getMembers();

    const newMember = {
      id: incoming.id || Date.now().toString(),
      memberName: incoming.memberName,
      email: incoming.email,
      yearLevel: incoming.yearLevel,
      organization: incoming.organization,
      phone: incoming.phone || "",
      studentId: incoming.studentId || "",
      major: incoming.major || "",
      clubRole: incoming.clubRole || "Member",
      interests: incoming.interests || "",
      availability: incoming.availability || "",
      status: "pending",
      submittedAt: incoming.submittedAt || new Date().toISOString()
    };

    members.push(newMember);

    if (!saveMembers(members)) {
      return res.status(500).json({
        success: false,
        error: "Failed to save member"
      });
    }

    res.status(201).json({
      success: true,
      message: "Member saved successfully",
      data: newMember
    });
  } catch (error) {
    console.error("Error saving member:", error);
    res.status(500).json({
      success: false,
      error: "Failed to save member"
    });
  }
});
app.put("/api/members/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const members = getMembers();
    const index = members.findIndex((member) => member.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Member not found" });
    }

    members[index].status = status;
    saveMembers(members);

    res.json({
      success: true,
      message: "Status updated successfully",
      data: members[index]
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update member" });
  }
});

app.listen(PORT, () => {
  ensureMembersFile();
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`GET  http://localhost:${PORT}/api/members`);
  console.log(`POST http://localhost:${PORT}/api/members`);
  console.log(`PUT  http://localhost:${PORT}/api/members/:id`);
});