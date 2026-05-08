const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBucket() {
  console.log("Attempting to create public 'testimonials' bucket...");
  const { data, error } = await supabase.storage.createBucket("testimonials", {
    public: true,
  });

  if (error) {
    if (error.message.includes("already exists")) {
      console.log("Bucket 'testimonials' already exists.");
    } else {
      console.error("Failed to create bucket:", error.message);
      return;
    }
  } else {
    console.log("Bucket created successfully:", data);
  }
}

createBucket();
