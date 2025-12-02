// Supabase Edge Function for secure user invitations
// Deploy to: supabase/functions/invite-user/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
        // Create Supabase Admin Client with service role key
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // Verify the request is from an authenticated admin
        const authHeader = req.headers.get('Authorization')!
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !user) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Check if user is admin
        const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (userError || userData?.role !== 'ADMIN') {
            return new Response(
                JSON.stringify({ error: 'Forbidden: Admin access required' }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Parse request body
        const { email, full_name, role, phone } = await req.json()

        if (!email || !full_name || !role) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields: email, full_name, role' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Invite user via Supabase Auth
        const redirectUrl = `${req.headers.get('origin')}/set-password?email=${encodeURIComponent(email)}&role=${role}`

        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
            email,
            {
                data: { full_name, role, phone },
                redirectTo: redirectUrl
            }
        )

        if (inviteError) {
            return new Response(
                JSON.stringify({ error: inviteError.message }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Insert user into users table
        const { data: newUser, error: insertError } = await supabaseAdmin
            .from('users')
            .insert({
                id: inviteData.user?.id,
                email,
                full_name,
                role,
                phone,
                status: 'ACTIVE'
            })
            .select()
            .single()

        if (insertError) {
            return new Response(
                JSON.stringify({ error: insertError.message }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Log the invite action
        await supabaseAdmin
            .from('system_logs')
            .insert({
                user_id: user.id,
                action: 'user_invited',
                details: { invited_email: email, invited_role: role }
            })

        return new Response(
            JSON.stringify({ data: newUser, message: 'User invited successfully' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
