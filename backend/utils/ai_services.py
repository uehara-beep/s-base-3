"""
AI/OCR Services for S-BASE 3.0
Provides image analysis and OCR capabilities using Claude API or fallback methods.
"""

import os
import re
import base64
from typing import Optional, Dict, Any
import httpx
from PIL import Image
from io import BytesIO

# Claude API configuration
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
CLAUDE_API_URL = "https://api.anthropic.com/v1/messages"


async def analyze_image_with_claude(
    image_data: bytes,
    prompt: str,
    media_type: str = "image/jpeg"
) -> Optional[str]:
    """
    Use Claude Vision API to analyze an image.
    Returns the text response from Claude.
    """
    if not ANTHROPIC_API_KEY:
        return None

    try:
        base64_image = base64.standard_b64encode(image_data).decode("utf-8")

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                CLAUDE_API_URL,
                headers={
                    "x-api-key": ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": "claude-sonnet-4-20250514",
                    "max_tokens": 1024,
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "image",
                                    "source": {
                                        "type": "base64",
                                        "media_type": media_type,
                                        "data": base64_image,
                                    },
                                },
                                {
                                    "type": "text",
                                    "text": prompt,
                                },
                            ],
                        }
                    ],
                },
            )

            if response.status_code == 200:
                result = response.json()
                return result["content"][0]["text"]

    except Exception as e:
        print(f"Claude API error: {e}")

    return None


async def ocr_business_card(image_data: bytes, media_type: str = "image/jpeg") -> Dict[str, Any]:
    """
    Extract business card information from an image.
    Uses Claude Vision API if available, otherwise returns demo data.
    """
    prompt = """この名刺画像から以下の情報を抽出してください。JSON形式で回答してください。
{
  "company_name": "会社名",
  "department": "部署名",
  "position": "役職",
  "name": "氏名",
  "name_kana": "ふりがな（わかれば）",
  "email": "メールアドレス",
  "phone": "電話番号",
  "mobile": "携帯番号",
  "address": "住所"
}
値がない場合は空文字にしてください。"""

    # Try Claude API first
    response = await analyze_image_with_claude(image_data, prompt, media_type)

    if response:
        try:
            # Extract JSON from response
            import json
            json_match = re.search(r'\{[^{}]*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
        except Exception as e:
            print(f"JSON parsing error: {e}")

    # Fallback: Return empty structure for manual input
    return {
        "company_name": "",
        "department": "",
        "position": "",
        "name": "",
        "name_kana": "",
        "email": "",
        "phone": "",
        "mobile": "",
        "address": "",
        "message": "AIによる自動認識に失敗しました。手動で入力してください。"
    }


async def ocr_receipt(image_data: bytes, media_type: str = "image/jpeg") -> Dict[str, Any]:
    """
    Extract receipt information from an image.
    Uses Claude Vision API if available.
    """
    prompt = """このレシート/領収書画像から以下の情報を抽出してください。JSON形式で回答してください。
{
  "store_name": "店舗名",
  "amount": 金額（数値のみ、カンマなし）,
  "date": "日付（YYYY-MM-DD形式）",
  "items": ["購入品目リスト"]
}
値がない場合は空文字または0にしてください。"""

    response = await analyze_image_with_claude(image_data, prompt, media_type)

    if response:
        try:
            import json
            json_match = re.search(r'\{[^{}]*\}', response, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
                # Ensure amount is numeric
                if isinstance(data.get("amount"), str):
                    data["amount"] = int(re.sub(r'[^\d]', '', data["amount"]) or 0)
                return data
        except Exception as e:
            print(f"JSON parsing error: {e}")

    return {
        "store_name": "",
        "amount": 0,
        "date": "",
        "items": [],
        "message": "AIによる自動認識に失敗しました。手動で入力してください。"
    }


async def analyze_ky_photo(image_data: bytes, media_type: str = "image/jpeg") -> Dict[str, Any]:
    """
    Analyze a construction site photo for safety hazards (KY analysis).
    Uses Claude Vision API.
    """
    prompt = """この工事現場の写真を安全管理（KY：危険予知）の観点から分析してください。
以下のJSON形式で回答してください。

{
  "hazards": [
    {
      "type": "危険の種類（例：転落、落下物、感電など）",
      "description": "具体的な危険の説明",
      "location": "写真内での位置",
      "risk_level": "high/medium/low"
    }
  ],
  "safety_points": ["安全上の良い点があれば"],
  "recommendations": ["安全対策の推奨事項"],
  "overall_assessment": "全体的な安全性評価（safe/caution/danger）",
  "summary": "分析サマリー（日本語で2-3文）"
}

建設現場での一般的な危険要素を考慮してください：
- 高所作業の安全対策（安全帯、手すり）
- 足場の状態
- 保護具の着用状況
- 整理整頓
- 電気設備の安全
- 重機の配置
- 作業動線の確保"""

    response = await analyze_image_with_claude(image_data, prompt, media_type)

    if response:
        try:
            import json
            # Find JSON in response
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                return json.loads(json_match.group())
        except Exception as e:
            print(f"JSON parsing error: {e}")

    # Fallback response
    return {
        "hazards": [],
        "safety_points": [],
        "recommendations": [
            "写真をより鮮明に撮影してください",
            "現場全体が見えるように撮影してください"
        ],
        "overall_assessment": "unknown",
        "summary": "AI分析ができませんでした。ANTHROPIC_API_KEYを設定してください。",
        "message": "AIによる分析に失敗しました。環境変数ANTHROPIC_API_KEYを設定してください。"
    }


async def analyze_invoice(image_data: bytes, media_type: str = "image/jpeg") -> Dict[str, Any]:
    """
    Extract invoice information from an image using OCR/AI.
    """
    prompt = """この請求書画像から以下の情報を抽出してください。JSON形式で回答してください。
{
  "invoice_number": "請求書番号",
  "vendor_name": "請求元会社名",
  "vendor_address": "請求元住所",
  "client_name": "請求先会社名",
  "issue_date": "発行日（YYYY-MM-DD）",
  "due_date": "支払期限（YYYY-MM-DD）",
  "subtotal": 小計金額（数値）,
  "tax_amount": 消費税額（数値）,
  "total_amount": 合計金額（数値）,
  "items": [
    {
      "description": "品目名",
      "quantity": 数量,
      "unit_price": 単価,
      "amount": 金額
    }
  ],
  "bank_info": "振込先情報",
  "notes": "備考"
}
値がない場合は空文字または0にしてください。"""

    response = await analyze_image_with_claude(image_data, prompt, media_type)

    if response:
        try:
            import json
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                data = json.loads(json_match.group())
                # Ensure numeric fields
                for field in ['subtotal', 'tax_amount', 'total_amount']:
                    if isinstance(data.get(field), str):
                        data[field] = float(re.sub(r'[^\d.]', '', data[field]) or 0)
                return data
        except Exception as e:
            print(f"JSON parsing error: {e}")

    return {
        "invoice_number": "",
        "vendor_name": "",
        "vendor_address": "",
        "client_name": "",
        "issue_date": "",
        "due_date": "",
        "subtotal": 0,
        "tax_amount": 0,
        "total_amount": 0,
        "items": [],
        "bank_info": "",
        "notes": "",
        "message": "AIによる自動認識に失敗しました。手動で入力してください。"
    }
