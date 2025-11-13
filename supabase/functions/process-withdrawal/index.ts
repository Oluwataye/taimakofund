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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = roles?.some(r => r.role === 'admin');
    if (!isAdmin) {
      throw new Error('Only admins can process withdrawals');
    }

    const { withdrawalId, action } = await req.json();

    console.log('Processing withdrawal:', withdrawalId, action);

    // Get withdrawal details with service role
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: withdrawal, error: withdrawalError } = await serviceClient
      .from('withdrawals')
      .select('*, campaigns(creator_id, current_amount)')
      .eq('id', withdrawalId)
      .single();

    if (withdrawalError || !withdrawal) {
      throw new Error('Withdrawal not found');
    }

    if (withdrawal.status !== 'pending') {
      throw new Error('Withdrawal already processed');
    }

    if (action === 'approve') {
      // Initiate Paystack transfer
      const transferResponse = await fetch('https://api.paystack.co/transfer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: 'balance',
          amount: withdrawal.amount * 100, // Convert to kobo
          recipient: withdrawal.account_number,
          reason: `Withdrawal for campaign ${withdrawal.campaign_id}`,
        }),
      });

      const transferData = await transferResponse.json();

      if (!transferData.status) {
        console.error('Paystack transfer failed:', transferData);
        throw new Error(transferData.message || 'Transfer initiation failed');
      }

      // Update withdrawal status
      await serviceClient
        .from('withdrawals')
        .update({
          status: 'processing',
          processed_by: user.id,
          processed_at: new Date().toISOString(),
          notes: `Transfer initiated: ${transferData.data.transfer_code}`,
        })
        .eq('id', withdrawalId);

      console.log('Withdrawal approved and transfer initiated');

      return new Response(
        JSON.stringify({ 
          message: 'Withdrawal approved and transfer initiated',
          transfer_code: transferData.data.transfer_code,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'reject') {
      // Reject withdrawal
      await serviceClient
        .from('withdrawals')
        .update({
          status: 'rejected',
          processed_by: user.id,
          processed_at: new Date().toISOString(),
        })
        .eq('id', withdrawalId);

      console.log('Withdrawal rejected');

      return new Response(
        JSON.stringify({ message: 'Withdrawal rejected' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      throw new Error('Invalid action. Use "approve" or "reject"');
    }
  } catch (error: any) {
    console.error('Error in process-withdrawal:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
