import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import Button from '@mui/material/Button';


function ShowFeedbackDetailsIn() {
  const [feedback, setFeedback] = useState([]);
  const { _id } = useParams();  // Correcting the variable to 'id'

  useEffect(() => {
    axios
      .get(`http://localhost:4000/api/feedback/${_id}`)  // Use 'id' in the URL
      .then((res) => {
        setFeedback(res.data);
      })
      .catch(() => {
        console.log('Error from ShowFeedbackDetails');
      });
  }, [_id]);

  const TableItem = (
    <div>
      <table className="table table-hover table-dark">
        <tbody>
          <tr>
            <th scope="row">1</th>
            <td>ID-</td>
            <td>{feedback._id}</td>
          </tr>
          <tr>
            <th scope="row">2</th>
            <td>Name-</td>
            <td>
              {feedback.firstname} {feedback.lastname}
            </td>
          </tr>
          <tr>
            <th scope="row">3</th>
            <td>MESSAGE-</td>
            <td>{feedback.message}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <div>
        <br />
        <Link to="/">Back to</Link>
      </div>
      <br />
      <div>
        <h1>Feedback Details</h1>
        <p>This is the full detail of Customer Feedback</p>
        <br />
        <br />
      </div>
      <div>{TableItem}</div>
      <div>
        <Link to={`/updatefeedback/${feedback._id}`}><Button size="small">Edit Employee</Button></Link>
        
      </div>
    </div>
  );
}

export default ShowFeedbackDetailsIn;
