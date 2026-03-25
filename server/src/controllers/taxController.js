import TaxRecord from "../models/TaxRecord.js";

export const updateTaxRecord = async (userId, income) => {
  const yearlyIncome = Number(income);
  
  // SYNC CALCULATION: 0% up to 350,000 & 5% above
  const freeLimit = 350000;
  const calculatedTax = yearlyIncome > freeLimit ? (yearlyIncome - freeLimit) * 0.05 : 0;


  return await TaxRecord.findOneAndUpdate(
    { user: userId, fiscalYear: "2026" },
    { 
      totalIncome: yearlyIncome, 
      taxAmount: calculatedTax, 
      status: "Paid" 
    },
    { 
      upsert: true, 
      returnDocument: "after" 
    }
  );
};

export const createTaxRecord = async (req, res) => {
  try {
    const { totalIncome } = req.body;
    
    if (totalIncome === undefined) {
      return res.status(400).json({ message: "Income amount is required" });
    }

    const record = await updateTaxRecord(req.user.id || req.user._id, totalIncome);
    
    res.status(201).json(record);
  } catch (error) {
    console.error("Tax Creation Error:", error);
    res.status(500).json({ 
      message: "Failed to create tax record", 
      error: error.message 
    });
  }
};

 
export const getTaxRecords = async (req, res) => {
  try {
    const { year } = req.query;
    const userId = req.user.id || req.user._id;
    const query = { user: userId };

    if (year) {
      query.fiscalYear = year;
    }

     
    const records = await TaxRecord.find(query).sort({ updatedAt: -1 });
    
    res.status(200).json(records);
  } catch (error) {
    console.error("Fetch Tax Records Error:", error);
    res.status(500).json({ 
      message: "Failed to fetch tax records", 
      error: error.message 
    });
  }
};