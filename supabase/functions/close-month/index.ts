
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const monthLabel = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

    console.log(`Starting monthly archive process for ${monthLabel}`);

    // Tables à archiver
    const tables = [
      { src: 'profit_tracking', dest: 'archive_profit_tracking' },
      { src: 'marketing_performance', dest: 'archive_marketing_performance' },
      { src: 'sales_data', dest: 'archive_sales_data' },
      { src: 'financial_tracking', dest: 'archive_financial_tracking' },
      { src: 'ad_spending_data', dest: 'archive_ad_spending_data' }
    ];

    let successCount = 0;
    let errors = [];

    for (const table of tables) {
      try {
        console.log(`Archiving ${table.src} to ${table.dest}`);
        
        // Utiliser la fonction move_to_archive
        const { error } = await supabase.rpc('move_to_archive', {
          src_table: table.src,
          dest_table: table.dest,
          month_label: monthLabel
        });

        if (error) {
          console.error(`Error archiving ${table.src}:`, error);
          errors.push(`${table.src}: ${error.message}`);
        } else {
          successCount++;
          console.log(`Successfully archived ${table.src}`);
        }
      } catch (err) {
        console.error(`Exception archiving ${table.src}:`, err);
        errors.push(`${table.src}: ${err.message}`);
      }
    }

    // Logger le résultat
    await supabase.from('system_logs').insert({
      type: 'monthly_archive',
      message: `Monthly archive completed for ${monthLabel}. Success: ${successCount}/${tables.length}`,
      data: {
        month_label: monthLabel,
        success_count: successCount,
        total_tables: tables.length,
        errors: errors
      }
    });

    const response = {
      success: true,
      month_label: monthLabel,
      archived_tables: successCount,
      total_tables: tables.length,
      errors: errors
    };

    console.log('Archive process completed:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Fatal error in close-month function:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
