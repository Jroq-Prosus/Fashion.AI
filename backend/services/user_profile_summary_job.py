import os
from apscheduler.schedulers.background import BackgroundScheduler
from db.supabase_client import supabase
from function import groq_llama_completion
from datetime import datetime
import pytz
import time

# How often to run the job (in seconds)
JOB_INTERVAL_SECONDS = 60  # 1 minute

def summarize_user_sessions(sessions):
    # Prepare a summary prompt for the AI
    session_texts = []
    for s in sessions:
        session_texts.append(f"Query: {s.get('query_text', '')}\nRecommendations: {s.get('recommendations', [])}")
    joined = '\n---\n'.join(session_texts)
    messages = [
        {"role": "system", "content": "You are an assistant that summarizes a user's fashion interests and style based on their queries and recommendations."},
        {"role": "user", "content": f"Here are this user's recent sessions:\n{joined}\n\nSummarize what kind of person this user is, their style, and preferences in 2-3 sentences."}
    ]
    return groq_llama_completion(messages, token=256)

def update_user_profiles():
    print("[UserProfileJob] Running user profile update job...")
    # Fetch all user profiles
    profiles = supabase.table("user_profile").select("user_id, description, updated_at").execute().data
    if not profiles:
        print("[UserProfileJob] No user profiles found.")
        return
    for profile in profiles:
        user_id = profile["user_id"]
        profile_updated_at = profile.get("updated_at")
        # Fetch all user_sessions for this user with updated_at > profile.updated_at
        if profile_updated_at:
            sessions = supabase.table("user_sessions").select("*").eq("user_id", user_id).gt("updated_at", profile_updated_at).execute().data
        else:
            sessions = supabase.table("user_sessions").select("*").eq("user_id", user_id).execute().data
        if not sessions:
            continue  # No new sessions
        # Summarize
        summary = summarize_user_sessions(sessions)
        # Update user_profile.description and updated_at
        now = datetime.now(pytz.UTC).isoformat()
        supabase.table("user_profile").update({"description": summary, "updated_at": now}).eq("user_id", user_id).execute()
        print(f"[UserProfileJob] Updated profile for user_id={user_id}")

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(update_user_profiles, 'interval', seconds=JOB_INTERVAL_SECONDS)
    scheduler.start()
    print("[UserProfileJob] Scheduler started.")
    # Keep the script running
    try:
        while True:
            time.sleep(60)
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()

if __name__ == "__main__":
    start_scheduler() 