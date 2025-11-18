import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: "donation" | "campaign_update" | "withdrawal_approved" | "withdrawal_rejected";
  recipientEmail: string;
  recipientName: string;
  data: {
    campaignTitle?: string;
    donationAmount?: number;
    updateTitle?: string;
    updateContent?: string;
    withdrawalAmount?: number;
    notes?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, recipientEmail, recipientName, data }: EmailRequest = await req.json();

    let subject = "";
    let html = "";

    switch (type) {
      case "donation":
        subject = `New Donation Received for "${data.campaignTitle}"`;
        html = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .amount { font-size: 36px; font-weight: bold; color: #667eea; margin: 20px 0; }
                .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
                .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 New Donation Received!</h1>
                </div>
                <div class="content">
                  <p>Hello ${recipientName},</p>
                  <p>Great news! You've received a new donation for your campaign:</p>
                  <h2 style="color: #333;">${data.campaignTitle}</h2>
                  <div class="amount">₦${data.donationAmount?.toLocaleString()}</div>
                  <p>This donation brings you closer to your goal. Keep up the great work!</p>
                  <a href="${Deno.env.get("VITE_SUPABASE_URL")}/campaign/${data.campaignTitle}" class="button">View Campaign</a>
                  <p style="margin-top: 30px;">Thank you for making a difference!</p>
                  <p><strong>TaimakoFund Team</strong></p>
                </div>
                <div class="footer">
                  <p>© 2024 TaimakoFund. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `;
        break;

      case "campaign_update":
        subject = `New Update: ${data.updateTitle}`;
        html = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .update-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
                .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
                .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>📢 Campaign Update</h1>
                </div>
                <div class="content">
                  <p>Hello ${recipientName},</p>
                  <p>A campaign you supported has posted a new update:</p>
                  <h2 style="color: #333;">${data.campaignTitle}</h2>
                  <div class="update-box">
                    <h3>${data.updateTitle}</h3>
                    <p>${data.updateContent}</p>
                  </div>
                  <a href="${Deno.env.get("VITE_SUPABASE_URL")}/campaign/${data.campaignTitle}" class="button">View Full Update</a>
                  <p style="margin-top: 30px;">Thank you for your continued support!</p>
                  <p><strong>TaimakoFund Team</strong></p>
                </div>
                <div class="footer">
                  <p>© 2024 TaimakoFund. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `;
        break;

      case "withdrawal_approved":
        subject = "Withdrawal Request Approved";
        html = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .amount { font-size: 36px; font-weight: bold; color: #10b981; margin: 20px 0; }
                .info-box { background: white; padding: 15px; margin: 15px 0; border-radius: 6px; }
                .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>✅ Withdrawal Approved</h1>
                </div>
                <div class="content">
                  <p>Hello ${recipientName},</p>
                  <p>Good news! Your withdrawal request has been approved:</p>
                  <div class="amount">₦${data.withdrawalAmount?.toLocaleString()}</div>
                  <div class="info-box">
                    <p><strong>Campaign:</strong> ${data.campaignTitle}</p>
                    ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ""}
                  </div>
                  <p>The funds will be transferred to your registered bank account within 3-5 business days.</p>
                  <p style="margin-top: 30px;">Thank you for using TaimakoFund!</p>
                  <p><strong>TaimakoFund Team</strong></p>
                </div>
                <div class="footer">
                  <p>© 2024 TaimakoFund. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `;
        break;

      case "withdrawal_rejected":
        subject = "Withdrawal Request Update";
        html = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .info-box { background: white; padding: 15px; margin: 15px 0; border-radius: 6px; }
                .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
                .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Withdrawal Request Update</h1>
                </div>
                <div class="content">
                  <p>Hello ${recipientName},</p>
                  <p>We regret to inform you that your withdrawal request could not be processed at this time:</p>
                  <div class="info-box">
                    <p><strong>Campaign:</strong> ${data.campaignTitle}</p>
                    <p><strong>Amount:</strong> ₦${data.withdrawalAmount?.toLocaleString()}</p>
                    ${data.notes ? `<p><strong>Reason:</strong> ${data.notes}</p>` : ""}
                  </div>
                  <p>If you have questions or would like to resubmit your request, please contact our support team.</p>
                  <a href="${Deno.env.get("VITE_SUPABASE_URL")}/dashboard" class="button">View Dashboard</a>
                  <p style="margin-top: 30px;">Best regards,</p>
                  <p><strong>TaimakoFund Team</strong></p>
                </div>
                <div class="footer">
                  <p>© 2024 TaimakoFund. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `;
        break;
    }

    const emailResponse = await resend.emails.send({
      from: "TaimakoFund <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-notification-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
