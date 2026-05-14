import pytesseract
from PIL import Image
from io import BytesIO
from doc2md.models import OCRResult
from doc2md.config import config
import requests

class OCRProcessor:
    """Handles OCR operations using Tesseract or DeepSeek."""

    def __init__(self):
        self.deepseek_available = bool(config.DEEPSEEK_API_KEY)

    def extract_text(self, image_data: bytes, force_deepseek: bool = False) -> OCRResult:
        """Extract text from image using OCR."""
        image = Image.open(BytesIO(image_data))

        if not force_deepseek:
            try:
                text = pytesseract.image_to_string(image)
                confidence = self._estimate_confidence(text)
                if confidence >= config.DEEPSEEK_OCR_THRESHOLD:
                    return OCRResult(text=text, confidence=confidence, source="tesseract")
            except Exception:
                pass

        if self.deepseek_available:
            return self._deepseek_ocr(image_data)
        else:
            return OCRResult(text=text, confidence=0.5, source="tesseract-fallback")

    def _estimate_confidence(self, text: str) -> float:
        """Estimate OCR confidence based on text quality."""
        if not text or len(text.strip()) < 5:
            return 0.0

        valid_chars = sum(1 for c in text if c.isprintable() or c in "\n ")
        total_chars = len(text)

        return valid_chars / total_chars if total_chars > 0 else 0.0

    def _deepseek_ocr(self, image_data: bytes) -> OCRResult:
        """Use DeepSeek API for OCR."""
        import base64

        image_b64 = base64.b64encode(image_data).decode("utf-8")

        headers = {
            "Authorization": f"Bearer {config.DEEPSEEK_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": config.DEEPSEEK_MODEL,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{image_b64}"
                            }
                        },
                        {
                            "type": "text",
                            "text": "Please transcribe all text from this image exactly as it appears."
                        }
                    ]
                }
            ],
            "max_tokens": 4096
        }

        try:
            response = requests.post(
                f"{config.DEEPSEEK_API_BASE}/chat/completions",
                headers=headers,
                json=payload,
                timeout=60
            )
            response.raise_for_status()
            result = response.json()
            text = result["choices"][0]["message"]["content"]
            return OCRResult(text=text, confidence=0.9, source="deepseek")
        except Exception as e:
            return OCRResult(text="", confidence=0.0, source="deepseek-error")