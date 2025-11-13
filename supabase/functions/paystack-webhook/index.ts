import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('x-paystack-signature');
    const body = await req.text();

    // Verify webhook signature
    const hash = await crypto.subtle.digest(
      'SHA-512',
      new TextEncoder().encode(Deno.env.get('PAYSTACK_SECRET_KEY') + body)
    );
    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (hashHex !== signature) {
      console.error('Invalid webhook signature');
      return new Response('Invalid signature', { status: 401 });
    }

    const event = JSON.parse(body);
    console.log('Webhook event received:', event.event);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle different webhook events
    switch (event.event) {
      case 'charge.success': {
        const reference = event.data.reference;
        const amount = event.data.amount / 100; // Convert from kobo

        // Update donation
        const { data: donation, error: donationError } = await supabaseClient
          .from('donations')
          .update({ payment_status: 'completed' })
          .eq('paystack_reference', reference)
          .select()
          .single();

        if (!donationError && donation) {
          // Update campaign amount
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
        }
        break;
      }

      case 'charge.failed': {
        const reference = event.data.reference;
        await supabaseClient
          .from('donations')
          .update({ payment_status: 'failed' })
          .eq('paystack_reference', reference);
        break;
      }

      case 'transfer.success':
      case 'transfer.failed': {
        // Handle withdrawal status updates if needed
        console.log('Transfer event:', event.event, event.data);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in paystack-webhook:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
