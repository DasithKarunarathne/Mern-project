import { Schema, model } from 'mongoose';

const messageSchema = new Schema({
  text: String,
  isBot: Boolean,
  timestamp: { type: Date, default: Date.now }
});

export default model('Message', messageSchema);