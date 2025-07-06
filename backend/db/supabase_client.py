from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://yyrqotproacvfauudnak.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5cnFvdHByb2FjdmZhdXVkbmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTQ5ODgsImV4cCI6MjA2NzI5MDk4OH0.i3U7ZPW7LuUCKcPqy82wVn4cqE9Cbrlmx98M-4expus")
print(SUPABASE_URL, SUPABASE_KEY)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
