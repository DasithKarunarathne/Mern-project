import Ledger from "../../models/financemodel/Ledger";      



export const fetchLedger = async (req, res) => {

    const month =parseInt( req.params.month);
    const year = parseInt(req.params.year);

    if (!month || !year) {
        return res.status(400).json({ message: "Month and year are required" });
    }

    const startDate = new Date(year, month - 1, 1); // Month is 0-indexed in JavaScript
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of the month

    try {
        const ledger = await Ledger.find({
            date: {
                $gte: startDate,
                $lte: endDate,
            },
        }).sort({ date: 1 });
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    
};