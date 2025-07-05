""" LOADING LIBRARIES """
from fastapi import FastAPI
from llava.constants import IMAGE_TOKEN_INDEX, DEFAULT_IMAGE_TOKEN
from llava.conversation import conv_templates, SeparatorStyle
from llava.model.builder import load_pretrained_model
from llava.utils import disable_torch_init
from llava.mm_utils import process_images, tokenizer_image_token, get_model_name_from_path
from transformers import TextStreamer
from transformers import DetrImageProcessor, DetrForObjectDetection
from transformers import CLIPTextModel, CLIPVisionModel, CLIPModel, CLIPProcessor
from transformers import  YolosImageProcessor, YolosForObjectDetection
from pydantic import BaseModel
from typing import List
from io import BytesIO
from tqdm import tqdm
import faiss
import torch
from PIL import Image
from ultralytics import YOLOWorld
from fastapi import Query
import cv2
from PIL import Image
import bas
import json
import torch
import os
import numpy as np
import base64

""" INITIALIZE VALUES """
device = torch.device("cuda" if torch.cuda.is_available() else "cpu") 
embed_dim = 768
data_dir = "image_database"
index_path = f"{data_dir}/image.faiss"
index = faiss.read_index(index_path)
with open(f"{data_dir}/database.json", "r") as f:
    database = json.load(f)
image_paths = [
    os.path.join(data_dir, f)
    for f in os.listdir(data_dir)
    if f.lower().endswith(('.png', '.jpg'))]

""" LOAD YOLO MODEL - object detector """
ckpt = 'yainage90/fashion-object-detection-yolos-tiny'
yolo_image_processor = YolosImageProcessor.from_pretrained(ckpt)
yolo_model = YolosForObjectDetection.from_pretrained(ckpt).to(device)

""" LOAD RAP-LLaVA MODEL """
rap_model_id = "Hoar012/RAP-LLaVA-13b"
rap_model_name = "RAP-LLaVA-13b"
tokenizer, model, image_processor, context_len = load_pretrained_model(rap_model_id, None, rap_model_name, device=device)

""" LOAD CLIP VIT LARGE - image embedding """
clip_model_id = 'openai/clip-vit-large-patch14-336'
clip_model = CLIPModel.from_pretrained(clip_model_id).to(device)
feature_extractor = CLIPProcessor.from_pretrained(clip_model_id)