/**
 * Email Service
 * Gửi email notifications sử dụng Nodemailer
 */

const nodemailer = require('nodemailer');
const logger = require('./logger');

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send email notification
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // Skip if email not configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      logger.warn('⚠️  Email not configured, skipping email send');
      return { success: false, message: 'Email not configured' };
    }

    const info = await transporter.sendMail({
      from: `"CryptoTrading SOA" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    logger.info(`📧 Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`❌ Email send error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Send trade notification email
 */
const sendTradeEmail = async (userEmail, tradeData) => {
  const { type, symbol, amount, price, totalCost } = tradeData;
  
  const subject = `${type === 'buy' ? 'Buy' : 'Sell'} Order Completed - ${symbol}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${type === 'buy' ? '#10B981' : '#EF4444'};">
        ${type === 'buy' ? '🟢 Buy' : '🔴 Sell'} Order Completed
      </h2>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
        <p><strong>Coin:</strong> ${symbol}</p>
        <p><strong>Amount:</strong> ${amount}</p>
        <p><strong>Price:</strong> $${price.toFixed(2)}</p>
        <p><strong>Total:</strong> $${totalCost.toFixed(2)}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      </div>
      <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
        This is an automated notification from CryptoTrading SOA.
      </p>
    </div>
  `;
  
  const text = `${type === 'buy' ? 'Buy' : 'Sell'} Order Completed\n\nCoin: ${symbol}\nAmount: ${amount}\nPrice: $${price}\nTotal: $${totalCost}`;
  
  return await sendEmail({ to: userEmail, subject, html, text });
};

/**
 * Send price alert email
 */
const sendPriceAlertEmail = async (userEmail, alertData) => {
  const { symbol, targetPrice, currentPrice, condition } = alertData;
  
  const subject = `🔔 Price Alert: ${symbol} ${condition === 'above' ? '>' : '<'} $${targetPrice}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #F59E0B;">🔔 Price Alert Triggered</h2>
      <div style="background: #fef3c7; padding: 20px; border-radius: 8px;">
        <p><strong>Coin:</strong> ${symbol}</p>
        <p><strong>Target Price:</strong> $${targetPrice}</p>
        <p><strong>Current Price:</strong> $${currentPrice}</p>
        <p><strong>Condition:</strong> ${condition === 'above' ? 'Above' : 'Below'}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      </div>
      <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
        Your price alert has been triggered. This alert is now inactive.
      </p>
    </div>
  `;
  
  const text = `Price Alert: ${symbol}\nTarget: $${targetPrice}\nCurrent: $${currentPrice}\nCondition: ${condition}`;
  
  return await sendEmail({ to: userEmail, subject, html, text });
};

/**
 * Send welcome email
 */
const sendWelcomeEmail = async (userEmail, fullName) => {
  const subject = 'Welcome to CryptoTrading SOA';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">🚀 Welcome to CryptoTrading SOA!</h2>
      <p>Hi ${fullName},</p>
      <p>Thank you for joining CryptoTrading SOA. Your account has been created successfully.</p>
      <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Starting Balance:</strong> $1,000 USDT (Virtual)</p>
        <p>You can now start practicing crypto trading without any real financial risk!</p>
      </div>
      <p>Features available:</p>
      <ul>
        <li>Real-time cryptocurrency prices</li>
        <li>Virtual trading (buy/sell)</li>
        <li>Portfolio management</li>
        <li>Price alerts</li>
        <li>Trade history</li>
      </ul>
      <p>Happy trading!</p>
    </div>
  `;
  
  const text = `Welcome to CryptoTrading SOA!\n\nHi ${fullName},\n\nYour account has been created with $1,000 USDT virtual balance.\n\nHappy trading!`;
  
  return await sendEmail({ to: userEmail, subject, html, text });
};

module.exports = {
  sendEmail,
  sendTradeEmail,
  sendPriceAlertEmail,
  sendWelcomeEmail,
};
