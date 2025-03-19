import React from 'react';
import { Card, CardMedia, CardContent, Typography, CardActions, Button } from '@mui/material';
import './ProductCard.css';

const ProductCard = ({ product, onEdit, onDelete, onAddToCart }) => {
  return (
    <Card sx={{ maxWidth: 345, margin: 2 }}>
      <CardMedia
        component="img"
        height="140"
        image={product.image || 'https://via.placeholder.com/140'}
        alt={product.name}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {product.description}
        </Typography>
        <Typography variant="body1">
          <strong>${product.price}</strong> | {product.stockQuantity} in stock
        </Typography>
        <Typography variant="body2">Category: {product.category}</Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => onEdit(product)}>Edit</Button>
        <Button size="small" onClick={() => onDelete(product._id)}>Delete</Button>
        <Button size="small" onClick={() => onAddToCart(product)}>Add to Cart</Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;