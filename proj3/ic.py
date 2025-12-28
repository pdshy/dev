import torch
from datasets import load_dataset
from transformers import EfficientNetImageProcessor, EfficientNetForImageClassification
import argparse
from PIL import Image

parser = argparse.ArgumentParser()
parser.add_argument('--image_path', type=str, default=None)
args = parser.parse_args()
print(args.image_path)

# 1. 인풋 데이터 로딩
# dataset = load_dataset("huggingface/cats-image")
# image = dataset["test"]["image"][0]
image = Image.open(args.image_path)

# 2. 인풋 데이터 전처리
preprocessor = EfficientNetImageProcessor.from_pretrained("google/efficientnet-b0")
model = EfficientNetForImageClassification.from_pretrained("google/efficientnet-b0")

# 3. 모델 로딩
inputs = preprocessor(image, return_tensors="pt")

# 4. 모델 실행
with torch.no_grad():
    logits = model(**inputs).logits

# 5. 모델 실행 결과 후처리
# model predicts one of the 1000 ImageNet classes
predicted_label = logits.argmax(-1).item()
print(model.config.id2label[predicted_label])