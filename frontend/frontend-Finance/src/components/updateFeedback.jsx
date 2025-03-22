import React , {useState, useEffect} from "react";
import axios from "axios";
import { Link, useParams, useNavigate} from "react-router-dom";


function UpdateFeedback(){

    const [feedback, setFeedback] = useState({

        firstname: "",
        lastname: "",
        email: "",
        message: ""

    });

    const {_id} = useParams();

    const navigate = useNavigate();

    useEffect(()=>{
        axios.get(`http://localhost:4000/api/feedback/${_id}`)
        .then((res)=>{
            setFeedback({
                firstname: res.data.firstname|| "",
                
                lastname: res.data.lastname|| "",
                email: res.data.email|| "",
                message: res.data.message|| ""
            });
        })
        .catch((err)=>{
            console.log("Error from update feedback", err);
        });

    },[_id]);

    const onChange = (e) =>{
        console.log(e.target.value)
        setFeedback({...feedback,[e.target.name]: e.target.value});
    };
    const onSubmit = (e)=>{
        e.preventDefault();

        const data = {
            firstName: feedback.firstname,
        lastName: feedback.lastname,
        email: feedback.email,
        message: feedback.message

            
        };
        axios.put(`http://localhost:4000/api/feedback/updatefeedback/${_id}`, data)
        .then((res)=>{
            navigate(`/showdetails/${_id}`);
        })
        .catch((err)=>{
            console.log('Error in update');
        });

    };
    return (
        <div>
            <form noValidate onSubmit={onSubmit}>
                <label htmlFor="firstname">First name</label>
                <input
                id="firstname"
                type="text"
                placeholder="First name"
                name="firstname"
                value={feedback.firstname}
                onChange={onChange}       
                />
                <br/>

                <label htmlFor="lastname">Last name</label>
                <input
                id="lastname"
                type="text"
                placeholder="last name"
                name="lastname"
                value={feedback.lastname}
                onChange={onChange}       
                />
                <br/>

                <label htmlFor="email">Email</label>
                <input
                id="email"
                type="text"
                placeholder="abc@abc.com"
                name="email"
                value={feedback.email}
                onChange={onChange}       
                />
                <br/><label htmlFor="message">message</label>
                <input
                id="message"
                type="text"
                placeholder=""
                name="message"
                value={feedback.message}
                onChange={onChange}       
                />
                <br/>

                <button type="submit">
                    Update Employee
                </button>
            </form>
        </div>
    )


}
export default UpdateFeedback;