import React,{useState} from  "react"
import axios from "axios";
import "./insertfeedback.css"

export default function AddFeedback(){

const [firstName, setfirstName] = useState("");
const [lastName, setlastName] = useState("");
const [email, setemail] = useState("");
const [message, setfeedback] = useState("");

function sendata(e){
e.preventDefault();

const newFeedback = {

    firstName,
    lastName,
    email,
    message
};
console.log("Sending feedback: ",newFeedback);

axios.post("http://localhost:4000/api/feedback/add", newFeedback,{
    headers:{
        "Content-Type" : "application/json"
    }
}).then(()=>{
    alert("Feedback Added")
}).catch((err)=>{
    console.error(err);
    alert("Error: "+ err.message);
});

}



return(

    <div className="feedback-container">

            
            <form onSubmit={sendata}>
                
                
                <div className="user-info">
                    <label htmlFor="firstname">Name</label>
                    
                        <input
                            type="text"
                            id="firstname"
                            name="firstname"
                            value = {firstName}
                            placeholder="First Name"
                            required
                            onChange={(e)=>{

                                setfirstName(e.target.value);

                            }}
                            
                        />
                        <input
                            type="text"
                            required
                            id="lastname"
                            name="lastname"
                            value = {lastName}
                            placeholder="Last Name"
                            onChange={(e)=>{

                                setlastName(e.target.value);

                            }}
                        />
                    
                    <label htmlFor="email">E-mail</label>
                    <input
                        type="email"
                        id="email"
                        value = {email}
                        name="email"
                        placeholder="ex: myname@example.com"
                        required
                        autoComplete="email"
                        onChange={(e)=>{

                            setemail(e.target.value);

                        }}
                    />
                    <div className="feedback-description">
                    <label htmlFor="message">Describe Your Feedback:</label>
                    <textarea
                        id="message"
                        value = {message}
                        name="message"
                        rows="5"
                        placeholder="Write your feedback here..."
                        required
                        onChange={(e)=>{

                            setfeedback(e.target.value);

                        }}
                    ></textarea>
                </div>
                </div>
                <button type="submit" className="submit-btn">
                    Submit
                </button>
            </form>

    </div>



)



}