import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, email, payment_method, callback_url } = await req.json()

    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY')
    if (!paystackSecretKey) {
      throw new Error('Paystack secret key not configured')
    }

    // Initialize Paystack transaction
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Supabase-Edge-Function/1.0',
      },
      body: JSON.stringify({
        amount: amount, // amount in pesewas
        email: email,
        currency: 'GHS',
        callback_url: callback_url,
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money'], // Enable multiple payment channels
        metadata: {
          payment_method: payment_method,
          transaction_type: 'deposit'
        }
      }),
    })

    const data = await response.json()
    console.log('Paystack response:', { status: response.status, data })

    if (!response.ok) {
      // Handle specific Paystack errors
      if (data.message && data.message.includes('IP address')) {
        console.error('Paystack IP restriction error:', data.message)
        throw new Error('Payment service temporarily unavailable. Please try again later or contact support.')
      }
      throw new Error(data.message || 'Failed to initialize transaction')
    }

    return new Response(
      JSON.stringify({
        authorization_url: data.data.authorization_url,
        access_code: data.data.access_code,
        reference: data.data.reference
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})