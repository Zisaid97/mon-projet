import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting monthly archiving process...');

    // Calculate previous month
    const now = new Date();
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const monthString = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, '0')}`;

    console.log(`Archiving data for month: ${monthString}`);

    // Call the database function to archive data
    const { data, error } = await supabase.rpc('archive_monthly_data', {
      target_month: monthString
    });

    if (error) {
      console.error('Error during archiving:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to archive data', 
          details: error.message 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    console.log('Archiving completed successfully:', data);

    // Log the archiving event
    const logResult = await supabase
      .from('system_logs')
      .insert({
        type: 'monthly_archive',
        message: `Successfully archived data for month ${monthString}`,
        data: data
      });

    if (logResult.error) {
      console.warn('Failed to log archiving event:', logResult.error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully archived data for ${monthString}`,
        result: data
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});