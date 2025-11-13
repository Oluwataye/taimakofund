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
    const { campaignId, amount, email, metadata } = await req.json();

    console.log('Initializing payment:', { campaignId, amount, email });

    // Initialize Paystack payment
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Paystack expects amount in kobo (smallest currency unit)
        currency: 'NGN',
        metadata: {
          campaign_id: campaignId,
          ...metadata,
        },
        callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/verify-payment`,
      }),
    });

    const paystackData = await paystackResponse.json();
    
    if (!paystackData.status) {
      console.error('Paystack error:', paystackData);
      throw new Error(paystackData.message || 'Failed to initialize payment');
    }

    console.log('Payment initialized:', paystackData.data.reference);

    // Create pending donation record
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: donationError } = await supabaseClient
      .from('donations')
      .insert({
        campaign_id: campaignId,
        amount,
        payment_reference: paystackData.data.reference,
        paystack_reference: paystackData.data.reference,
        payment_status: 'pending',
        donor_id: metadata?.donor_id || null,
        is_anonymous: metadata?.is_anonymous || false,
        message: metadata?.message || null,
      });

    if (donationError) {
      console.error('Error creating donation:', donationError);
      throw donationError;
    }

    return new Response(
      JSON.stringify({
        authorization_url: paystackData.data.authorization_url,
        access_code: paystackData.data.access_code,
        reference: paystackData.data.reference,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in initialize-payment:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
