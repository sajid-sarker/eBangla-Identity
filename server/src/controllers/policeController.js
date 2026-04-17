import PoliceRecord from "../models/PoliceRecord.js";
import Citizen from "../models/Citizen.js";
import Tesseract from "tesseract.js";
import PDFDocument from "pdfkit";

// @desc    Get current user's police records
// @route   GET /api/police/me
// @access  Private
export const getMyPoliceRecords = async (req, res) => {
  try {
    const record = await PoliceRecord.findOne({ citizen: req.user._id });

    if (!record) {
      return res.status(404).json({ message: "Police records not found" });
    }

    res.status(200).json(record);
  } catch (error) {
    console.error("Error fetching police records:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching police records" });
  }
};

// @desc    Get all citizens with their Police verification records
// @route   GET /api/police/users
// @access  Admin/Police
export const getAllUsersForPolice = async (req, res) => {
  try {
    const citizens = await Citizen.find().select("-password");

    // We will populate with matching police records manually
    const records = await PoliceRecord.find().lean();

    const results = citizens.map((citizen) => {
      const record = records.find(
        (r) => r.citizen.toString() === citizen._id.toString(),
      );
      return {
        citizen,
        policeRecord: record || null,
      };
    });

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching users for police module:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching police users." });
  }
};

// @desc    Update police verification status and notes
// @route   PUT /api/police/update/:id
// @access  Admin/Police
export const updatePoliceVerification = async (req, res) => {
  try {
    const { id } = req.params; // PoliceRecord ID
    const { verificationStatus, notes } = req.body;

    const record = await PoliceRecord.findById(id);
    if (!record) return res.status(404).json({ message: "Record not found" });

    if (verificationStatus) record.verificationStatus = verificationStatus;
    if (notes !== undefined) record.notes = notes;

    await record.save();
    res.status(200).json({ message: "Verification status updated", record });
  } catch (error) {
    console.error("Error updating police verification:", error);
    res.status(500).json({ message: "Server error updating verification." });
  }
};

// @desc    Upload NID image for OCR extraction
// @route   POST /api/police/upload-nid/:citizenId
// @access  Admin/Police
export const uploadNidAndOcr = async (req, res) => {
  try {
    const { citizenId } = req.params;
    if (!req.file)
      return res.status(400).json({ message: "No image file provided." });

    // Ensure a PoliceRecord exists for this citizen
    let record = await PoliceRecord.findOne({ citizen: citizenId });
    if (!record) {
      record = new PoliceRecord({ citizen: citizenId });
    }

    const {
      data: { text },
    } = await Tesseract.recognize(req.file.buffer, "ben+eng");

    record.nidDocument = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    };
    record.nidOcrText = text;

    await record.save();

    res.status(200).json({
      message: "NID processed successfully",
      extractedText: text,
    });
  } catch (error) {
    console.error("Error during NID upload and OCR:", error);
    res
      .status(500)
      .json({ message: "Server error during file extraction processing." });
  }
};

// @desc    Get a specific citizen's Police Record by Citizen ID
// @route   GET /api/police/citizen/:citizenId
// @access  Admin/Police
export const getPoliceRecordByCitizenId = async (req, res) => {
  try {
    const { citizenId } = req.params;
    let record = await PoliceRecord.findOne({ citizen: citizenId }).populate(
      "citizen",
      "-password",
    );
    if (!record) {
      // If no record exists yet, return empty structure or create one
      record = new PoliceRecord({ citizen: citizenId });
      await record.save();
      // populate it immediately after saving to return
      await record.populate("citizen", "-password");
    }

    res.status(200).json(record);
  } catch (error) {
    console.error("Error fetching police record for citizen:", error);
    res
      .status(500)
      .json({ message: "Server error fetching citizen police record." });
  }
};

// @desc    Add a police case to a citizen
// @route   POST /api/police/cases/:citizenId
// @access  Admin/Police
export const addPoliceCase = async (req, res) => {
  try {
    const { citizenId } = req.params;
    const { caseNumber, crimeType, description, filedAt, station, status } =
      req.body;

    if (!caseNumber || !crimeType || !filedAt) {
      return res
        .status(400)
        .json({ message: "caseNumber, crimeType, and filedAt are required." });
    }

    let record = await PoliceRecord.findOne({ citizen: citizenId });
    if (!record) {
      record = new PoliceRecord({ citizen: citizenId });
    }

    record.cases.push({
      caseNumber,
      crimeType,
      description,
      filedAt: new Date(filedAt),
      station,
      status: status || "pending",
    });

    await record.save();

    res
      .status(201)
      .json({ message: "Criminal case added successfully", record });
  } catch (error) {
    console.error("Error adding police case:", error);
    res.status(500).json({ message: "Server error adding police case." });
  }
};

// @desc    Update a specific police case status
// @route   PUT /api/police/cases/:citizenId/:caseNumber
// @access  Admin/Police
export const updatePoliceCaseStatus = async (req, res) => {
  try {
    const { citizenId, caseNumber } = req.params;
    const { status, verdict } = req.body;

    const record = await PoliceRecord.findOne({ citizen: citizenId });
    if (!record)
      return res.status(404).json({ message: "Police record not found" });

    const caseIndex = record.cases.findIndex(
      (c) => c.caseNumber === caseNumber,
    );
    if (caseIndex === -1)
      return res.status(404).json({ message: "Case not found" });

    if (status) record.cases[caseIndex].status = status;
    if (verdict) record.cases[caseIndex].verdict = verdict;

    // Set closedAt if marked closed/dismissed/acquitted/convicted
    if (["closed", "dismissed", "acquitted", "convicted"].includes(status)) {
      record.cases[caseIndex].closedAt = new Date();
    }

    await record.save();

    res.status(200).json({ message: "Case updated successfully", record });
  } catch (error) {
    console.error("Error updating police case:", error);
    res.status(500).json({ message: "Server error updating police case." });
  }
};

// @desc    Download Police Report (PDF)
// @route   GET /api/police/report/download/:citizenId?
// @access  Private
export const downloadPoliceReport = async (req, res) => {
  try {
    // If admin passed a citizenId, use it; otherwise fallback to req.user._id
    let targetCitizenId = req.params.citizenId;

    // Auth Check: If targetCitizenId is provided, requester must be admin
    if (targetCitizenId && (!req.user || !req.user.isAdmin)) {
      return res
        .status(403)
        .json({ message: "Not authorized to download others' reports." });
    }

    if (!targetCitizenId) {
      targetCitizenId = req.user._id;
    }

    const citizen = await Citizen.findById(targetCitizenId);
    if (!citizen)
      return res.status(404).json({ message: "Citizen not found." });

    const record = await PoliceRecord.findOne({ citizen: targetCitizenId });

    // Format Dates Utility
    const formatDate = (date) => {
      if (!date) return "N/A";
      return new Date(date).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
        day: "numeric",
      });
    };

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Police_Report_${citizen.nid}.pdf`,
    );

    doc.pipe(res);

    // Title Section
    doc
      .fillColor("#2B3C8E")
      .fontSize(20)
      .text("Official Police Record Report", { align: "center" });
    doc.moveDown(0.5);
    doc
      .fillColor("#1E1E1E")
      .fontSize(10)
      .text(`Generated on: ${formatDate(new Date())}`, { align: "center" });
    doc.moveDown(2);

    // Identity Details
    doc
      .fillColor("black")
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Identity details");
    doc
      .moveTo(50, doc.y + 5)
      .lineTo(550, doc.y + 5)
      .stroke();
    doc.moveDown(1);

    doc.font("Helvetica").fontSize(12);
    doc.text(`Name : ${citizen.name}`);
    doc.text(`Smart NID : ${citizen.nid}`);
    doc.text(`Contact : ${citizen.phone || "N/A"}`);

    let verificationStr = "Pending";
    if (record && record.verificationStatus) {
      verificationStr = record.verificationStatus;
    }

    doc.moveDown(0.5);
    doc
      .font("Helvetica-Bold")
      .text(`NID Verification Status : ${verificationStr.toUpperCase()}`);
    doc.font("Helvetica");
    doc.moveDown(2);

    // Case Details Table
    doc.fontSize(14).font("Helvetica-Bold").text("Criminal History");
    doc
      .moveTo(50, doc.y + 5)
      .lineTo(550, doc.y + 5)
      .stroke();
    doc.moveDown(1);

    if (!record || !record.cases || record.cases.length === 0) {
      doc
        .fillColor("green")
        .text(
          "This citizen has a completely clean police record with 0 active or historical cases.",
        );
    } else {
      // Cases Loop
      const activeCasesCount = record.cases.filter((c) =>
        ["pending", "under_investigation", "under_trial"].includes(c.status),
      ).length;
      doc.fillColor("black").fontSize(12).font("Helvetica");
      doc.text(
        `Total Registered Cases : ${record.cases.length}    Active Pending Cases: ${activeCasesCount}`,
      );
      doc.moveDown(1.5);

      for (let i = 0; i < record.cases.length; i++) {
        const c = record.cases[i];
        doc
          .font("Helvetica-Bold")
          .fontSize(11)
          .text(`Case # ${c.caseNumber} - ${c.crimeType.toUpperCase()}`);
        doc.font("Helvetica").fontSize(10);
        doc.text(`Status : ${c.status.replace("_", " ").toUpperCase()}`);
        doc.text(
          `Filed on : ${formatDate(c.filedAt)} | Station : ${c.station || "N/A"}`,
        );
        if (c.closedAt) doc.text(`Closed on : ${formatDate(c.closedAt)}`);
        if (c.verdict) doc.text(`Verdict : ${c.verdict}`);
        doc.moveDown(1);
      }
    }

    doc.end();
  } catch (error) {
    console.error("PDF Police Error:", error);
    res.status(500).json({ message: "Error generating custom police PDF." });
  }
};
