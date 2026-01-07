from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from pydantic import BaseModel
from datetime import date, datetime
from decimal import Decimal
from database import get_db
from models.quote import Quote, QuoteItem
from models.user import User
from utils.auth import get_current_user, require_role
import openpyxl
from io import BytesIO
import re

router = APIRouter()


class QuoteItemCreate(BaseModel):
    item_order: int = 0
    category: Optional[str] = None
    description: str
    specification: Optional[str] = None
    quantity: float = 1
    unit: Optional[str] = None
    unit_price: float = 0
    cost_price: float = 0
    notes: Optional[str] = None


class QuoteCreate(BaseModel):
    client_id: Optional[int] = None
    project_name: str
    site_name: Optional[str] = None
    site_address: Optional[str] = None
    quote_date: Optional[date] = None
    valid_until: Optional[date] = None
    tax_rate: float = 10
    notes: Optional[str] = None
    items: List[QuoteItemCreate] = []


class QuoteResponse(BaseModel):
    id: int
    quote_number: str
    project_name: str
    site_name: Optional[str]
    quote_date: Optional[date]
    subtotal: float
    tax_amount: float
    total_amount: float
    cost_amount: float
    profit_amount: float
    profit_rate: float
    status: str

    class Config:
        from_attributes = True


@router.get("/", response_model=List[QuoteResponse])
async def get_quotes(
    status: Optional[str] = None,
    client_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Quote)
    if status:
        query = query.filter(Quote.status == status)
    if client_id:
        query = query.filter(Quote.client_id == client_id)
    return query.order_by(Quote.created_at.desc()).all()


@router.get("/{quote_id}")
async def get_quote(
    quote_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    quote = db.query(Quote).options(joinedload(Quote.items)).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="見積が見つかりません")

    return {
        "id": quote.id,
        "quote_number": quote.quote_number,
        "client_id": quote.client_id,
        "project_name": quote.project_name,
        "site_name": quote.site_name,
        "site_address": quote.site_address,
        "quote_date": quote.quote_date,
        "valid_until": quote.valid_until,
        "subtotal": float(quote.subtotal or 0),
        "tax_rate": float(quote.tax_rate or 10),
        "tax_amount": float(quote.tax_amount or 0),
        "total_amount": float(quote.total_amount or 0),
        "cost_amount": float(quote.cost_amount or 0),
        "profit_amount": float(quote.profit_amount or 0),
        "profit_rate": float(quote.profit_rate or 0),
        "status": quote.status,
        "notes": quote.notes,
        "items": [
            {
                "id": item.id,
                "item_order": item.item_order,
                "category": item.category,
                "description": item.description,
                "specification": item.specification,
                "quantity": float(item.quantity or 0),
                "unit": item.unit,
                "unit_price": float(item.unit_price or 0),
                "amount": float(item.amount or 0),
                "cost_price": float(item.cost_price or 0),
                "cost_amount": float(item.cost_amount or 0),
            }
            for item in sorted(quote.items, key=lambda x: x.item_order)
        ]
    }


@router.post("/")
async def create_quote(
    data: QuoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Generate quote number
    last_quote = db.query(Quote).order_by(Quote.id.desc()).first()
    quote_num = f"Q{(last_quote.id + 1 if last_quote else 1):06d}"

    # Calculate totals
    subtotal = Decimal(0)
    cost_total = Decimal(0)

    quote = Quote(
        quote_number=quote_num,
        client_id=data.client_id,
        project_name=data.project_name,
        site_name=data.site_name,
        site_address=data.site_address,
        quote_date=data.quote_date or date.today(),
        valid_until=data.valid_until,
        tax_rate=Decimal(str(data.tax_rate)),
        notes=data.notes,
        created_by=current_user.id
    )

    db.add(quote)
    db.flush()

    # Add items
    for item_data in data.items:
        amount = Decimal(str(item_data.quantity)) * Decimal(str(item_data.unit_price))
        cost_amount = Decimal(str(item_data.quantity)) * Decimal(str(item_data.cost_price))

        item = QuoteItem(
            quote_id=quote.id,
            item_order=item_data.item_order,
            category=item_data.category,
            description=item_data.description,
            specification=item_data.specification,
            quantity=Decimal(str(item_data.quantity)),
            unit=item_data.unit,
            unit_price=Decimal(str(item_data.unit_price)),
            amount=amount,
            cost_price=Decimal(str(item_data.cost_price)),
            cost_amount=cost_amount,
            notes=item_data.notes
        )
        db.add(item)
        subtotal += amount
        cost_total += cost_amount

    # Update quote totals
    quote.subtotal = subtotal
    quote.tax_amount = subtotal * quote.tax_rate / 100
    quote.total_amount = subtotal + quote.tax_amount
    quote.cost_amount = cost_total
    quote.profit_amount = subtotal - cost_total
    quote.profit_rate = (quote.profit_amount / subtotal * 100) if subtotal > 0 else Decimal(0)

    db.commit()
    db.refresh(quote)

    return {"message": "見積が作成されました", "quote_id": quote.id, "quote_number": quote.quote_number}


@router.put("/{quote_id}")
async def update_quote(
    quote_id: int,
    data: QuoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="見積が見つかりません")

    # Update basic info
    quote.client_id = data.client_id
    quote.project_name = data.project_name
    quote.site_name = data.site_name
    quote.site_address = data.site_address
    quote.quote_date = data.quote_date
    quote.valid_until = data.valid_until
    quote.tax_rate = Decimal(str(data.tax_rate))
    quote.notes = data.notes

    # Delete existing items
    db.query(QuoteItem).filter(QuoteItem.quote_id == quote_id).delete()

    # Add new items
    subtotal = Decimal(0)
    cost_total = Decimal(0)

    for item_data in data.items:
        amount = Decimal(str(item_data.quantity)) * Decimal(str(item_data.unit_price))
        cost_amount = Decimal(str(item_data.quantity)) * Decimal(str(item_data.cost_price))

        item = QuoteItem(
            quote_id=quote.id,
            item_order=item_data.item_order,
            category=item_data.category,
            description=item_data.description,
            specification=item_data.specification,
            quantity=Decimal(str(item_data.quantity)),
            unit=item_data.unit,
            unit_price=Decimal(str(item_data.unit_price)),
            amount=amount,
            cost_price=Decimal(str(item_data.cost_price)),
            cost_amount=cost_amount,
            notes=item_data.notes
        )
        db.add(item)
        subtotal += amount
        cost_total += cost_amount

    # Update totals
    quote.subtotal = subtotal
    quote.tax_amount = subtotal * quote.tax_rate / 100
    quote.total_amount = subtotal + quote.tax_amount
    quote.cost_amount = cost_total
    quote.profit_amount = subtotal - cost_total
    quote.profit_rate = (quote.profit_amount / subtotal * 100) if subtotal > 0 else Decimal(0)

    db.commit()
    return {"message": "見積が更新されました"}


@router.put("/{quote_id}/status")
async def update_quote_status(
    quote_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="見積が見つかりません")

    quote.status = status
    db.commit()
    return {"message": f"見積のステータスが{status}に変更されました"}


@router.delete("/{quote_id}")
async def delete_quote(
    quote_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="見積が見つかりません")

    db.delete(quote)
    db.commit()
    return {"message": "見積が削除されました"}


@router.post("/import-excel")
async def import_excel(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Excelファイルから見積データを読み込む
    対応フォーマット:
    - 表紙シート: 工事名、現場名、現場住所などの基本情報
    - 内訳シート: 項目明細（分類、項目名、仕様、数量、単位、単価、原価）
    - 条件書シート: 工事条件
    - 確認書シート: 負担区分
    """
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Excelファイル(.xlsx, .xls)のみ対応しています")

    try:
        contents = await file.read()
        wb = openpyxl.load_workbook(BytesIO(contents), data_only=True)

        result = {
            "cover": {},
            "items": [],
            "conditions": [],
            "confirmation": {"items": [], "special_notes": ""}
        }

        # シート名で検索（柔軟に対応）
        sheet_names = wb.sheetnames

        # 表紙シートの解析
        cover_sheet = None
        for name in sheet_names:
            if '表紙' in name or 'cover' in name.lower() or name == sheet_names[0]:
                cover_sheet = wb[name]
                break

        if cover_sheet:
            # セルを走査して工事名、現場名などを抽出
            for row in cover_sheet.iter_rows(min_row=1, max_row=30, max_col=10):
                for cell in row:
                    if cell.value:
                        cell_str = str(cell.value).strip()
                        # 工事名を検索
                        if '工事名' in cell_str or 'プロジェクト' in cell_str:
                            next_cell = cover_sheet.cell(row=cell.row, column=cell.column + 1)
                            if next_cell.value:
                                result["cover"]["project_name"] = str(next_cell.value).strip()
                        # 現場名
                        if '現場名' in cell_str:
                            next_cell = cover_sheet.cell(row=cell.row, column=cell.column + 1)
                            if next_cell.value:
                                result["cover"]["site_name"] = str(next_cell.value).strip()
                        # 現場住所
                        if '住所' in cell_str or '現場住所' in cell_str:
                            next_cell = cover_sheet.cell(row=cell.row, column=cell.column + 1)
                            if next_cell.value:
                                result["cover"]["site_address"] = str(next_cell.value).strip()
                        # 見積日
                        if '見積日' in cell_str or '日付' in cell_str:
                            next_cell = cover_sheet.cell(row=cell.row, column=cell.column + 1)
                            if next_cell.value:
                                if isinstance(next_cell.value, datetime):
                                    result["cover"]["quote_date"] = next_cell.value.strftime('%Y-%m-%d')
                                else:
                                    result["cover"]["quote_date"] = str(next_cell.value)

        # 内訳シートの解析
        detail_sheet = None
        for name in sheet_names:
            if '内訳' in name or '明細' in name or 'detail' in name.lower():
                detail_sheet = wb[name]
                break

        if detail_sheet:
            # ヘッダー行を特定
            header_row = None
            headers = {}
            for row_num, row in enumerate(detail_sheet.iter_rows(min_row=1, max_row=10), start=1):
                for col_num, cell in enumerate(row, start=1):
                    if cell.value:
                        cell_str = str(cell.value).strip()
                        if any(keyword in cell_str for keyword in ['分類', '項目', '品名', '名称', '仕様', '数量', '単位', '単価', '金額', '原価']):
                            header_row = row_num
                            break
                if header_row:
                    break

            if header_row:
                # ヘッダーをマッピング
                for col_num, cell in enumerate(detail_sheet[header_row], start=1):
                    if cell.value:
                        cell_str = str(cell.value).strip()
                        if '分類' in cell_str or 'カテゴリ' in cell_str:
                            headers['category'] = col_num
                        elif '項目' in cell_str or '品名' in cell_str or '名称' in cell_str or '摘要' in cell_str:
                            headers['description'] = col_num
                        elif '仕様' in cell_str or '規格' in cell_str:
                            headers['specification'] = col_num
                        elif '数量' in cell_str:
                            headers['quantity'] = col_num
                        elif '単位' in cell_str:
                            headers['unit'] = col_num
                        elif '単価' in cell_str and '原価' not in cell_str:
                            headers['unit_price'] = col_num
                        elif '原価' in cell_str or 'コスト' in cell_str:
                            headers['cost_price'] = col_num

                # データ行を読み込み
                for row_num, row in enumerate(detail_sheet.iter_rows(min_row=header_row + 1, max_row=200), start=1):
                    item = {}
                    has_data = False

                    for key, col_num in headers.items():
                        cell = detail_sheet.cell(row=header_row + row_num, column=col_num)
                        if cell.value is not None:
                            has_data = True
                            if key in ['quantity', 'unit_price', 'cost_price']:
                                try:
                                    item[key] = float(cell.value)
                                except (ValueError, TypeError):
                                    item[key] = 0
                            else:
                                item[key] = str(cell.value).strip()

                    if has_data and item.get('description'):
                        item.setdefault('category', '')
                        item.setdefault('specification', '')
                        item.setdefault('quantity', 1)
                        item.setdefault('unit', '式')
                        item.setdefault('unit_price', 0)
                        item.setdefault('cost_price', 0)
                        result["items"].append(item)

        # 条件書シートの解析
        condition_sheet = None
        for name in sheet_names:
            if '条件' in name or 'condition' in name.lower():
                condition_sheet = wb[name]
                break

        if condition_sheet:
            for row in condition_sheet.iter_rows(min_row=2, max_row=50, max_col=5):
                category = row[0].value if row[0].value else ""
                content = row[1].value if len(row) > 1 and row[1].value else ""
                if category or content:
                    result["conditions"].append({
                        "category": str(category).strip(),
                        "content": str(content).strip()
                    })

        # 確認書シートの解析
        confirm_sheet = None
        for name in sheet_names:
            if '確認' in name or '負担' in name or 'confirm' in name.lower():
                confirm_sheet = wb[name]
                break

        if confirm_sheet:
            for row in confirm_sheet.iter_rows(min_row=2, max_row=30, max_col=5):
                item_name = row[0].value if row[0].value else ""
                if item_name and str(item_name).strip():
                    confirm_item = {
                        "item": str(item_name).strip(),
                        "client": bool(row[1].value) if len(row) > 1 else False,
                        "company": bool(row[2].value) if len(row) > 2 else False,
                        "paid_supply": bool(row[3].value) if len(row) > 3 else False,
                    }
                    result["confirmation"]["items"].append(confirm_item)

        wb.close()
        return result

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Excelファイルの解析に失敗しました: {str(e)}")
