import React from 'react'
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import axios from 'axios';

import {Link} from 'react-router-dom'

const FeedbackCard = ({feedback}) =>{


  const onDeleteClick = (_id) => {
    axios.delete(`http://localhost:4000/api/feedback/${_id}`).then(()=>{
      window.location.reload();
    })
      .catch((err) => {
        console.log("delete error", err);
      });
  };
  

  return (
      <Card sx={{ maxWidth: 345 }}>
      <CardMedia
        component="img"
        alt="Profile Picture"
        height="140"
        image="/static/images/cards/contemplative-reptile.jpg"
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {feedback.firstname} {feedback.lastname}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {feedback.message}          
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={()=>onDeleteClick(feedback._id)}>Delete</Button>
        <Link to={`/showdetails/${feedback._id}`} style={{ textDecoration: 'none' }}>
  <Button size="small">Edit</Button>
</Link>

      </CardActions>
    </Card>
  )
}

export default  FeedbackCard