import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const Salarytable = () => {
    const [month, setMonth] = useState("2025-02");
    const [salaries, setSalaries] = useState([]);

    // Memoize fetchSalaries to prevent recreation on every render
    const fetchSalaries = useCallback(async () => {
        if (!month) {
            alert("Please select a month");
            return;
        }
        try {
            const response = await axios.get(`http://localhost:4000/api/salary/${month}`);
            setSalaries(response.data); // Array directly from getsalaries
        } catch (error) {
            console.error("Error fetching salaries", error);
            alert("Failed to fetch salaries: " + (error.response?.data?.message || error.message));
        }
    }, [month]); // month is a dependency of fetchSalaries

    useEffect(() => {
        fetchSalaries();
    }, [fetchSalaries]); // Now fetchSalaries is stable and a valid dependency

    const genSalaries = async () => {
        if (!month) {
            alert("Please select a month to generate salaries");
            return;
        }
        try {
            const response = await axios.post("http://localhost:4000/api/salary/calculate", { month });
            setSalaries(response.data.salaries || []);
            alert(response.data.message);
        } catch (error) {
            console.error("Error generating salaries", error);
            alert("Failed to generate salaries: " + (error.response?.data?.message || error.message));
        }
    };

    const markSalaryPaid = async (salaryId) => {
        try {
            await axios.put(`http://localhost:4000/api/salary/markPaid/${salaryId}`);
            alert("Salary marked as paid");
            fetchSalaries();
        } catch (error) {
            console.error("Error marking salary as paid", error);
            alert("Failed to mark salary as paid: " + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div>
            <h2 className="top-Heading">Salary Management</h2>
            <div>
                <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                />
                <button onClick={fetchSalaries}>Fetch Salaries</button>
                <button onClick={genSalaries}>Generate Salaries</button>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Employee ID</th>
                        <th>Employee Name</th>
                        <th>Month</th>
                        <th>Basic Salary</th>
                        <th>Overtime Pay</th>
                        <th>EPF</th>
                        <th>ETF</th>
                        <th>Net Salary</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {salaries.map((salary) => (
                        <tr key={salary._id}>
                            <td>{salary.employeeId}</td>
                            <td>{salary.employeeName}</td>
                            <td>{salary.month}</td>
                            <td>{salary.basicSalary}</td>
                            <td>{(salary.overtimeHours * salary.overtimeRate).toFixed(2)}</td>
                            <td>{salary.epf.toFixed(2)}</td>
                            <td>{salary.etf.toFixed(2)}</td>
                            <td>{salary.netSalary.toFixed(2)}</td>
                            <td>{salary.status}</td>
                            <td>
                                {salary.status === "Pending" ? (
                                    <button onClick={() => markSalaryPaid(salary._id)}>Mark as Paid</button>
                                ) : (
                                    <span>Paid on {new Date(salary.paymentDate).toLocaleDateString()}</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Salarytable;