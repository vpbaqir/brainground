// Public runtime configuration for the browser. These are public Supabase client values,
// not service-role secrets. Never expose SUPABASE_SERVICE_ROLE_KEY here.
module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  const config = {
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ''
  };
  res.status(200).send('window.BP_RUNTIME_CONFIG = ' + JSON.stringify(config).replace(/</g, '\\u003c') + ';');
};
