import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reference } = await req.json();

    console.log('Verifying payment:', reference);

    // Verify payment with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
        },
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      console.error('Paystack verification failed:', paystackData);
      throw new Error(paystackData.message || 'Payment verification failed');
    }

    const paymentData = paystackData.data;
    console.log('Payment verified:', paymentData.status);

    // Update donation and campaign
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Update donation status
    const { data: donation, error: donationError } = await supabaseClient
      .from('donations')
      .update({
        payment_status: paymentData.status === 'success' ? 'completed' : 'failed',
      })
      .eq('payment_reference', reference)
      .select()
      .single();

    if (donationError) {
      console.error('Error updating donation:', donationError);
      throw donationError;
    }

    // If payment successful, update campaign current_amount
    if (paymentData.status === 'success') {
      // Get current campaign amount
      const { data: campaign } = await supabaseClient
        .from('campaigns')
        .select('current_amount')
        .eq('id', donation.campaign_id)
        .single();

      if (campaign) {
        const newAmount = Number(campaign.current_amount) + Number(donation.amount);
        await supabaseClient
          .from('campaigns')
          .update({ current_amount: newAmount })
          .eq('id', donation.campaign_id);
      }

      console.log('Campaign amount updated successfully');
    }

    return new Response(
      JSON.stringify({
        status: paymentData.status,
        amount: paymentData.amount / 100, // Convert from kobo to naira
        reference: paymentData.reference,
        message: paymentData.gateway_response,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in verify-payment:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
