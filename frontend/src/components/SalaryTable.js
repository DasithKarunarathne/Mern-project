import React, {useState,useEffect} from "react";
import axios from "axios";


const Salarytable = () =>{

    const [month, setMonth] = useState("2025-02");
    const [salaries, setsalaries] =useState([]);
    

//fetches salaries when month is changed
useEffect(() => {
    fetchSalaries();
  }, [month]);

    //fetch salaries
    const fetchSalaries = async ()=>{
        if(!month){
            alert("PLease select a month");
            return;
        }

        try {
            const response = await axios.get(`http://localhost:4000/api/Salary/${month}`);//CHECK
            setsalaries(response.data.salaries || response.data);//.salaries not needed i think
            
        
        } catch (error) {
            console.error("Error fetching salaries", error);
        }
    };

    //generate salaries for a selected month
    const genSalaries = async ()=>{

        if(!month){
            alert("Please select a month to generate salaries");
            return;
        }
        try {
            const response = await axios.post("http://localhost:4000/api/Salary/calculate",{month});
            
            setsalaries(response.data.salaries);
        } catch (error) {
            //res.status barida
            console.error("Error generating salaries");
        }
    };

    const markSalaryPaid = async (salaryId)=>{
        try {
           await axios.put(`http://localhost:4000/api/Salary/markPaid/${salaryId}`);
            alert("Salary marked as paid");
            fetchSalaries();
        } catch (error) {
            console.error("Error marking slary as paid", error);
        }

    };

    return (

        <div>
            <h2 className="top-Heading">Salary Management</h2>

            <div>
                <input 
                type = "month"
                value={month}
                onChange={(e)=> setMonth(e.target.value)}/>
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
                {salaries.map((salary)=>(

                    <tr key={salary._id}>
<td>{salary.employeeId}</td>

<td className="border p-2">{salary.employeeName}</td>
                                <td className="border p-2">{salary.month}</td>
                                <td className="border p-2">{salary.basicSalary}</td>
                                <td className="border p-2">{salary.overtimeHours}</td>
                                <td className="border p-2">{salary.epf}</td>
                                <td className="border p-2">{salary.etf}</td>
                                <td className="border p-2">{salary.netSalary}</td>
                                <td className="border p-2">{salary.status}</td>

                <td>
                    {salary.status === 'Pending'?(
                        <button onClick={()=>markSalaryPaid(salary._id)}>Mark as Paid</button>
                    ) :(
                        <span>Paid on {new Date(salary.paymentDate).toLocaleDateString()}</span>
                    )
                    }
                </td>

                    </tr>
                ))}
            </tbody>
        </table>

        </div>

        


    )



}

export default Salarytable;