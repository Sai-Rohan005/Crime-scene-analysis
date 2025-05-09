import torch
from PIL import Image
from transformers import OwlViTProcessor, OwlViTForObjectDetection, CLIPProcessor, CLIPModel

owl_model = OwlViTForObjectDetection.from_pretrained("google/owlvit-base-patch32")
owl_processor = OwlViTProcessor.from_pretrained("google/owlvit-base-patch32")
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

owl_prompts = ["a person", "a dead body", "a knife", "a gun", "a bag", "a phone", "a wallet", "money", "a safe", "an evidence marker", "a chair", "a bullet", "a stack of money", "paper currency", "a broken object"]
clip_prompts = sorted(list(set(owl_prompts + [
    "a blood stain", "a pool of blood", "a burn mark", "shattered glass",
    "a document", "a cigarette butt", "a rope", "a footprint"
])))
crime_prompts = [
    "this is a murder scene", "this is an arson case", "a theft has taken place",
    "this is a robbery scene", "a suicide happened here", "this is an accidental death",
    "a drug-related crime occurred", "this is a vandalism case", "a kidnapping has taken place",
    "this is a general crime scene"
]

def detect_objects_and_classify(image_path, clip_threshold=0.35, owl_threshold=0.25):
    image = Image.open(image_path).convert("RGB")
    image_tensor = torch.tensor(image.size[::-1])

    owl_inputs = owl_processor(text=owl_prompts, images=image, return_tensors="pt")
    with torch.no_grad():
        owl_outputs = owl_model(**owl_inputs)

    owl_results = owl_processor.post_process_object_detection(
        outputs=owl_outputs,
        target_sizes=image_tensor.unsqueeze(0),
        threshold=owl_threshold
    )[0]

    owl_detected = {owl_prompts[label]: {"score": round(score.item(), 2), "source": "OWL-ViT"} for score, label in zip(owl_results['scores'], owl_results['labels'])}

    clip_inputs = clip_processor(text=clip_prompts, images=image, return_tensors="pt", padding=True)
    with torch.no_grad():
        clip_outputs = clip_model(**clip_inputs)
        clip_probs = clip_outputs.logits_per_image.softmax(dim=1).squeeze()

    clip_detected = {clip_prompts[i]: {"score": round(score.item(), 2), "source": "CLIP"} for i, score in enumerate(clip_probs) if score.item() >= clip_threshold and clip_prompts[i] not in owl_detected}

    merged = {**owl_detected, **clip_detected}

    crime_inputs = clip_processor(text=crime_prompts, images=image, return_tensors="pt", padding=True)
    with torch.no_grad():
        crime_outputs = clip_model(**crime_inputs)
        crime_probs = crime_outputs.logits_per_image.softmax(dim=1).squeeze()
        predicted_crime = crime_prompts[crime_probs.argmax()]

    return {
        "crime_type": predicted_crime.replace("this is ", "").replace("a ", "").replace("has taken place", "").strip().capitalize(),
        "objects_detected": list(merged.keys())
    }
