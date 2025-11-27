import twilio from 'twilio';
import sgMail from '@sendgrid/mail';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendMatchNotification(playerId, matchId, scheduledDate) {
  // Get player info
  const { supabase } = await import('../server.js');
  
  const { data: player, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', playerId)
    .single();

  if (error || !player) return;

  const date = new Date(scheduledDate).toLocaleString();
  const message = `You have a Scrabble match scheduled for ${date}. Good luck!`;

  // Send email
  try {
    await sgMail.send({
      to: player.email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: 'Match Scheduled - Scrabble League',
      html: `
        <h2>Match Scheduled!</h2>
        <p>You have a match scheduled for <strong>${date}</strong></p>
        <p>Visit the app to see more details.</p>
      `
    });
  } catch (err) {
    console.error('Email error:', err);
  }


  const subject = 'Scrabble match scheduled';
const html = `
  <p>Hi ${playerName},</p>
  <p>Your Scrabble match has been scheduled:</p>
  <ul>
    <li>Opponent: ${opponentName}</li>
    <li>Date & time: ${formattedDate}</li>
  </ul>
  <p><a href="${frontendUrl}/fixtures">View your fixture</a></p>
  <p>If you did not expect this email, you can ignore it.</p>
`;


  // Send SMS if phone available
  if (player.phone) {
    try {
      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: player.phone
      });
    } catch (err) {
      console.error('SMS error:', err);
    }
  }
}