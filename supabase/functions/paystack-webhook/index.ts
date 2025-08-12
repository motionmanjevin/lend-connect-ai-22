import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('x-paystack-signature')
    const body = await req.text()
    
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY')
    if (!paystackSecretKey) {
      throw new Error('Paystack secret key not configured')
    }

    // Verify webhook signature
    const hash = await crypto.subtle.digest('SHA-512', new TextEncoder().encode(body + paystackSecretKey))
    const expectedSignature = Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    if (signature !== expectedSignature) {
      throw new Error('Invalid signature')
    }

    const event = JSON.parse(body)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (event.event === 'charge.success') {
      const { reference, amount, customer, metadata } = event.data

      // Find user by email
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, account_balance')
        .eq('email', customer.email)
        .single()

      if (profiles) {
        const depositAmount = amount / 100 // Convert from pesewas to cedis

        // Update user balance
        await supabase
          .from('profiles')
          .update({ 
            account_balance: (profiles.account_balance || 0) + depositAmount 
          })
          .eq('user_id', profiles.user_id)

        // Update transaction status
        await supabase
          .from('transactions')
          .update({ 
            status: 'completed',
            paystack_reference: reference
          })
          .eq('user_id', profiles.user_id)
          .eq('status', 'pending')
          .eq('transaction_type', 'deposit')
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})