from transformers import CLIPModel, CLIPProcessor
from transformers import YolosImageProcessor, YolosForObjectDetection
from fastapi import Query
from dotenv import load_dotenv
from groq import Groq
import numpy as np
import faiss
import torch
import json
import torch
import os
from db.supabase_client import supabase
import requests
load_dotenv()


class Initializer:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Initializer, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        # INITIALIZE VALUES
        self.device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu")
        self.max_selected_items_mllm = 5
        self.embed_dim = 768

        # Download image.faiss from Supabase Storage if not present
        SUPABASE_URL = os.getenv("SUPABASE_URL")
        SUPABASE_BUCKET_IMAGES = "product-images"   
        SUPABASE_BUCKET_FAISS = "faiss"
        faiss_response = supabase.storage.from_(SUPABASE_BUCKET_FAISS).get_public_url('image.faiss')
        image_response = supabase.storage.from_(SUPABASE_BUCKET_IMAGES).list()

        faiss_url = faiss_response
        local_faiss_path = "/tmp/image.faiss"
        if not os.path.exists(local_faiss_path):
            r = requests.get(faiss_url)
            r.raise_for_status()
            with open(local_faiss_path, "wb") as f:
                f.write(r.content)
        self.index_path = faiss_response  # Supabase Storage URL for reference
        self.index = faiss.read_index(local_faiss_path)

        self.database = supabase

        # Fetch image paths from Supabase Storage (bucket: product-images)
        print('response', image_response)
        image_files = [
            f["name"] for f in image_response if f["name"].lower().endswith((".png", ".jpg", ".jpeg"))
        ]
        self.image_paths = [
            f"{SUPABASE_URL}/storage/v1/object/public/{SUPABASE_BUCKET_IMAGES}/{file_name}"
            for file_name in image_files
        ]

        # LOAD YOLO MODEL - object detector
        self.ckpt = 'yainage90/fashion-object-detection-yolos-tiny'
        self.yolo_image_processor = YolosImageProcessor.from_pretrained(
            self.ckpt)
        self.yolo_model = YolosForObjectDetection.from_pretrained(
            self.ckpt).to(self.device)

        # LOAD CLIP VIT LARGE - image embedding
        self.clip_model_id = 'openai/clip-vit-large-patch14-336'
        self.clip_model = CLIPModel.from_pretrained(
            self.clip_model_id).to(self.device)
        self.feature_extractor = CLIPProcessor.from_pretrained(
            self.clip_model_id)

        # LOAD GROQ CLIENT
        self.client_groq = Groq()

        # Set self.database to the Supabase client for later table queries
        self.database = supabase

        # INITIALIZE
        self._initialized = True

    def __getattr__(self, name):
        return getattr(self._instance, name)

    @classmethod
    def get_instance(cls):
        return cls()
