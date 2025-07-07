from transformers import CLIPModel, CLIPProcessor
from transformers import  YolosImageProcessor, YolosForObjectDetection
from fastapi import Query
from dotenv import load_dotenv
from groq import Groq
import numpy as np
import faiss
import torch
import json
import torch
import os
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
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.embed_dim = 768
        self.data_dir = "assets/image_database"
        self.index_path = f"{self.data_dir}/image.faiss"
        self.index = faiss.read_index(self.index_path)
        with open(f"{self.data_dir}/database.json", "r") as f:
            self.database = json.load(f)
        self.image_paths = [
            os.path.join(self.data_dir, f)
            for f in os.listdir(self.data_dir)
            if f.lower().endswith((".png", ".jpg"))
        ]

        # LOAD YOLO MODEL - object detector
        self.ckpt = 'yainage90/fashion-object-detection-yolos-tiny'
        self.yolo_image_processor = YolosImageProcessor.from_pretrained(self.ckpt)
        self.yolo_model = YolosForObjectDetection.from_pretrained(self.ckpt).to(self.device)

        # LOAD CLIP VIT LARGE - image embedding
        self.clip_model_id = 'openai/clip-vit-large-patch14-336'
        self.clip_model = CLIPModel.from_pretrained(self.clip_model_id).to(self.device)
        self.feature_extractor = CLIPProcessor.from_pretrained(self.clip_model_id)

        # LOAD GROQ CLIENT  
        self.client_groq  = Groq()

        # INITIALIZE
        self._initialized = True

    def __getattr__(self, name):
        return getattr(self._instance, name)

    @classmethod
    def get_instance(cls):
        return cls()
