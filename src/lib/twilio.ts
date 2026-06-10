export async function sendSMS(to: string, message: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !twilioNumber) {
    console.warn("Twilio credentials missing. SMS simulation mode active.");
    return { success: false, mode: 'simulation', message: "Twilio credentials missing from env parameters." };
  }

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(accountSid + ':' + authToken).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        To: to,
        From: twilioNumber,
        Body: message
      })
    });

    const data = await res.json();
    if (res.ok) {
      console.log(`SMS successfully dispatched to ${to} via Twilio. MessageSid: ${data.sid}`);
      return { success: true, sid: data.sid };
    } else {
      console.error(`Twilio Error dispatching SMS: ${data.message}`);
      return { success: false, error: data.message };
    }
  } catch (error: any) {
    console.error(`Twilio API exception: ${error.message}`);
    return { success: false, error: error.message };
  }
}
