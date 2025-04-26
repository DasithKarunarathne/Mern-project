const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

router.post('/message', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Message text is required' });
    }
    console.log('User input:', text);

    const userMessage = new Message({ text, isBot: false });
    await userMessage.save();

    const userInput = text.toLowerCase().trim();
    console.log('Processed input:', userInput);

    let botResponseText;
    if (userInput.includes('price') || userInput.includes('cost') || userInput.includes('how much')) {
      const priceResponses = [
        'Our handicrafts range from $10 to $100. What type are you curious about?',
        'Prices start at $10 and go up to $100 depending on the craft. Any specific item in mind?',
        'You’ll find items between $10 and $100. What’s your budget?'
      ];
      botResponseText = priceResponses[Math.floor(Math.random() * priceResponses.length)];
    } 
    else if (userInput.includes('expensive') || userInput.includes('cheap') || userInput.includes('affordable')) {
      botResponseText = 'We’ve got options for every budget—cheap starts at $10, premium up to $100. What’s your price range?';
    } 
    else if (userInput.includes('shipping') || userInput.includes('delivery') || userInput.includes('send')) {
      const shippingResponses = [
        'We ship worldwide! Where would you like your handicraft delivered?',
        'Shipping’s available globally. What’s your location?',
        'We can send anywhere! Where are you based?'
      ];
      botResponseText = shippingResponses[Math.floor(Math.random() * shippingResponses.length)];
    } 
    else if (userInput.includes('how long') && (userInput.includes('shipping') || userInput.includes('delivery'))) {
      botResponseText = 'Shipping usually takes 5-10 days, depending on your location. Where are you?';
    } 
    else if (userInput.includes('fast') && (userInput.includes('shipping') || userInput.includes('delivery'))) {
      botResponseText = 'We offer express shipping for faster delivery! Where do you need it sent?';
    } 
    else if (userInput.includes('hello') || userInput.includes('hi') || userInput.includes('hey')) {
      const greetings = [
        'Hey there! Excited to help you with handicrafts. What’s on your mind?',
        'Hi! Welcome to our handicraft world. How can I assist you?',
        'Hello! Ready to explore some crafts? What do you want to talk about?'
      ];
      botResponseText = greetings[Math.floor(Math.random() * greetings.length)];
    } 
    else if (userInput.includes('good morning') || userInput.includes('good afternoon') || userInput.includes('good evening')) {
      botResponseText = 'Good day to you too! How can I make your handicraft experience even better?';
    } 
    else if (userInput.includes('products') || userInput.includes('items') || userInput.includes('what do you have')) {
      const productResponses = [
        'We’ve got pottery, textiles, woodwork, and more. What catches your eye?',
        'Our range includes pottery, fabrics, and wooden crafts. What are you into?',
        'Think pottery, textiles, or woodwork—any favorites?'
      ];
      botResponseText = productResponses[Math.floor(Math.random() * productResponses.length)];
    } 
    else if (userInput.includes('handmade') || userInput.includes('handcrafted') || userInput.includes('craft')) {
      botResponseText = 'Everything’s handmade with love! What kind of craft are you looking for?';
    } 
    else if (userInput.includes('available') || userInput.includes('in stock') || userInput.includes('ready')) {
      botResponseText = 'Plenty of crafts are ready to go! What type are you after?';
    } 
    else if (userInput.includes('order') || userInput.includes('buy') || userInput.includes('purchase')) {
      const orderResponses = [
        'Ready to order? Tell me what you want and where to send it!',
        'Let’s get your order started! What craft and where to?',
        'Awesome, let’s buy something! What’s your pick?'
      ];
      botResponseText = orderResponses[Math.floor(Math.random() * orderResponses.length)];
    } 
    else if (userInput.includes('how to order') || userInput.includes('how do i buy')) {
      botResponseText = 'Just tell me what you like and your address—it’s that easy! What do you want?';
    } 
    else if (userInput.includes('thanks') || userInput.includes('thank you') || userInput.includes('great')) {
      const thanksResponses = [
        'My pleasure! What else can I do for you?',
        'You’re welcome! Anything more on your mind?',
        'Glad to help! What’s next?'
      ];
      botResponseText = thanksResponses[Math.floor(Math.random() * thanksResponses.length)];
    } 
    else if (userInput.includes('who') || userInput.includes('what are you') || userInput.includes('about')) {
      botResponseText = 'I’m your handicraft assistant bot, here to guide you through our crafts! What do you want to know?';
    } 
    else if (userInput.includes('time') || userInput.includes('how long') || userInput.includes('when')) {
      botResponseText = 'Shipping takes 5-10 days usually. Want more specifics?';
    } 
    else if (userInput.includes('where') && userInput.includes('you')) {
      botResponseText = 'We’re an online store, shipping from our workshop to you! Where are you at?';
    } 
    else if (userInput.includes('bye') || userInput.includes('goodbye') || userInput.includes('later')) {
      const byeResponses = [
        'See you later! Happy crafting!',
        'Goodbye for now! Come back anytime!',
        'Catch you next time! Enjoy!'
      ];
      botResponseText = byeResponses[Math.floor(Math.random() * byeResponses.length)];
    } 
    else if (userInput.includes('sorry') || userInput.includes('apologize')) {
      botResponseText = 'No worries at all! How can I assist you now?';
    } 
    else if (userInput.includes('yes') || userInput.includes('yeah')) {
      botResponseText = 'Cool! What exactly are you thinking about?';
    } 
    else if (userInput.includes('no') || userInput.includes('nope')) {
      botResponseText = 'Alright, no problem! What else can I help with?';
    } 
    else if (userInput.includes('cool') || userInput.includes('nice') || userInput.includes('awesome')) {
      botResponseText = 'Glad you think so! What’s next on your list?';
    } 
    else if (userInput.includes('?') && !userInput.match(/(how|what|where|when|who|why)/i)) {
      botResponseText = 'Interesting question! Can you tell me more?';
    } 
    else if (userInput === '' || userInput === ' ') {
      botResponseText = 'Oops, looks like you didn’t say anything! What’s up?';
    } 
    else {
      const defaults = [
        'I’m here to help with handicrafts! What would you like to know?',
        'Got any questions about our crafts? I’m all ears!',
        'Not sure what to ask? Try prices, shipping, or what we offer!',
        'Let’s chat about handicrafts! What’s on your mind?',
        'I’m your craft buddy—ask me anything about our stuff!',
        'Need help with something crafty? Just say the word!'
      ];
      botResponseText = defaults[Math.floor(Math.random() * defaults.length)];
    }

    console.log('Bot response:', botResponseText);

    const botMessage = new Message({ text: botResponseText, isBot: true });
    await botMessage.save();

    res.json({ message: botResponseText });
  } catch (error) {
    console.error('Error in POST /message:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 }).lean();
    console.log('Fetched messages count:', messages.length);
    res.json(messages);
  } catch (error) {
    console.error('Error in GET /messages:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/messages', async (req, res) => {
  try {
    console.log('Attempting to delete all messages...');
    const result = await Message.deleteMany({});
    console.log('Delete result:', result);
    if (result.deletedCount === 0) {
      console.log('No messages were found to delete');
    }
    res.json({ message: 'All messages have been cleared', deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Error in DELETE /messages:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;