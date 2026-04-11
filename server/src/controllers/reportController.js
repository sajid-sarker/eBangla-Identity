import Citizen from "../models/Citizen.js";
import PDFDocument from "pdfkit";
import MedicalRecord from "../models/MedicalRecord.js";
import PoliceRecord from "../models/PoliceRecord.js";
import TaxRecord from "../models/TaxRecord.js";
import EducationRecord from "../models/EducationRecord.js";

// ==========================
// 📊 GET REPORT DATA
// ==========================
export const getReport = async (req, res) => {
  try {
    const citizens = await Citizen.find();

    const totalCitizens = citizens.length;

    const completedProfiles = citizens.filter(
      (c) => c.isProfileComplete
    ).length;

    const incompleteProfiles = totalCitizens - completedProfiles;

    const taxpayers = citizens.filter(
      (c) => c.yearlyIncome > 300000
    ).length;

    const nonTaxpayers = totalCitizens - taxpayers;

    // Optional: tax not applicable (students, unemployed etc.)
    const taxNotApplicable = citizens.filter(
      (c) => !c.yearlyIncome || c.yearlyIncome === 0
    ).length;

    res.json({
      totalCitizens,
      completedProfiles,
      incompleteProfiles,
      taxpayers,
      nonTaxpayers,
      taxNotApplicable,
    });
  } catch (error) {
    console.error("Report Error:", error);
    res.status(500).json({ message: "Error generating report" });
  }
};



// ==========================
// 📄 DOWNLOAD REPORT (PDF)
// ==========================
export const downloadReport = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user-specific records
    const medicalRecord = await MedicalRecord.findOne({ citizen: userId });
    const policeRecord = await PoliceRecord.findOne({ citizen: userId });
    const latestTaxRecord = await TaxRecord.findOne({ user: userId }).sort({ createdAt: -1 });
    const educationRecords = await EducationRecord.find({ citizenId: userId }).sort({ passingYear: -1 });

    const formatDate = (date) => {
      if (!date) return "";
      return new Date(date).toLocaleDateString(undefined, { month: "long", year: "numeric", day: "numeric" });
    };

    // 📄 Create PDF
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=Citizen_Digital_Record_Report.pdf");

    doc.pipe(res);

    // Title
    doc.fillColor("#2B3C8E").fontSize(18).text("Citizen Digital Record Report", { align: "center" });
    doc.moveDown(2);

    // Basic Info
    doc.fillColor("#1E1E1E").fontSize(12);
    doc.text(`Name : ${req.user.name || ""}`);
    doc.text(`SmartNID : ${req.user.nid || ""}`);
    doc.moveDown(1.5);

    // Function to draw section headers
    const drawSectionHeader = (title) => {
       doc.fillColor("black").fontSize(12).font("Helvetica-Bold").text(title);
       doc.moveDown(0.5);
       doc.font("Helvetica"); // reset to normal
    };

    // Police Record
    drawSectionHeader("Police Record");
    if (policeRecord) {
      doc.text(`• ${policeRecord.cases?.filter((c) => ["pending", "under_investigation"].includes(c.status)).length > 0 ? "Active Cases Found" : "Clear"}`, { indent: 20 });
      doc.text(`• Last Verifies : ${formatDate(policeRecord.updatedAt)}`, { indent: 20 });
    } else {
      doc.fillColor("#666666").text("No record uploaded yet.", { indent: 20 });
      doc.fillColor("#1E1E1E");
    }
    doc.moveDown(1.5);

    // Medical
    drawSectionHeader("Medical");
    if (medicalRecord) {
      doc.text(`• Blood Group : ${medicalRecord.bloodGroup || "Not specified"}`, { indent: 20 });
      doc.text(`• Vaccination Status : ${medicalRecord.vaccinationStatus || "Not specified"}`, { indent: 20 });
      doc.text(`• Last Checkup : ${formatDate(medicalRecord.updatedAt)}`, { indent: 20 });
    } else {
      doc.fillColor("#666666").text("No medical status uploaded yet.", { indent: 20 });
      doc.fillColor("#1E1E1E");
    }
    doc.moveDown(1.5);

    // Tax
    drawSectionHeader("Tax");
    if (latestTaxRecord) {
      doc.text(`• Tax Amount : ${latestTaxRecord.taxAmount}`, { indent: 20 });
      doc.text(`• Tax Identification Number : ${latestTaxRecord.tin || ""}`, { indent: 20 });
      doc.text(`• Tax Status : ${latestTaxRecord.status}`, { indent: 20 });
    } else {
      doc.fillColor("#666666").text("No tax information uploaded yet.", { indent: 20 });
      doc.fillColor("#1E1E1E");
    }
    doc.moveDown(1.5);

    // Education
    drawSectionHeader("Education");
    if (educationRecords.length > 0) {
      // Basic table drawing in pdfkit
      const tableTop = doc.y;
      doc.font("Helvetica-Bold");
      doc.text("Exam name", 70, tableTop);
      doc.text("Year", 250, tableTop);
      doc.text("Result", 350, tableTop);
      
      doc.moveTo(50, tableTop + 15).lineTo(450, tableTop + 15).stroke();
      
      doc.font("Helvetica");
      let currentY = tableTop + 20;

      educationRecords.forEach((row) => {
         doc.text(row.level || row.examName || "", 70, currentY);
         doc.text(row.passingYear || row.year || "", 250, currentY);
         doc.text(row.gpa || row.result || "", 350, currentY);
         currentY += 20;
         doc.moveTo(50, currentY - 5).lineTo(450, currentY - 5).stroke();
      });
      doc.y = currentY + 10; // Move cursor past table
    } else {
      doc.fillColor("#666666").text("No education records uploaded yet.", { indent: 20 });
      doc.fillColor("#1E1E1E");
    }

    doc.end();
  } catch (error) {
    console.error("PDF Error:", error);
    res.status(500).json({ message: "Error generating custom PDF" });
  }
};