from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, datetime, timedelta
from database import get_db
from models.quote import Quote
from models.project import Project
from models.expense import Expense
from models.income import Income
from models.payment import Payment
from models.daily_report import DailyReport
from models.leave_request import LeaveRequest
from models.user import User
from utils.auth import get_current_user

router = APIRouter()


@router.get("/summary")
async def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    month_start = today.replace(day=1)
    year_start = today.replace(month=1, day=1)

    # 売上集計（受注済み見積）
    monthly_quotes = db.query(func.sum(Quote.total_amount)).filter(
        Quote.status == "ordered",
        Quote.quote_date >= month_start
    ).scalar() or 0

    yearly_quotes = db.query(func.sum(Quote.total_amount)).filter(
        Quote.status == "ordered",
        Quote.quote_date >= year_start
    ).scalar() or 0

    # 粗利集計
    monthly_profit = db.query(func.sum(Quote.profit_amount)).filter(
        Quote.status == "ordered",
        Quote.quote_date >= month_start
    ).scalar() or 0

    yearly_profit = db.query(func.sum(Quote.profit_amount)).filter(
        Quote.status == "ordered",
        Quote.quote_date >= year_start
    ).scalar() or 0

    # 入金集計
    monthly_income = db.query(func.sum(Income.amount)).filter(
        Income.status == "received",
        Income.income_date >= month_start
    ).scalar() or 0

    # 支払集計
    monthly_payment = db.query(func.sum(Payment.amount)).filter(
        Payment.status == "completed",
        Payment.payment_date >= month_start
    ).scalar() or 0

    # 進行中プロジェクト数
    active_projects = db.query(func.count(Project.id)).filter(
        Project.status == "in_progress"
    ).scalar() or 0

    # 承認待ち件数
    pending_expenses = db.query(func.count(Expense.id)).filter(
        Expense.status == "submitted"
    ).scalar() or 0

    pending_leaves = db.query(func.count(LeaveRequest.id)).filter(
        LeaveRequest.status == "pending"
    ).scalar() or 0

    return {
        "sales": {
            "monthly": float(monthly_quotes),
            "yearly": float(yearly_quotes)
        },
        "profit": {
            "monthly": float(monthly_profit),
            "yearly": float(yearly_profit)
        },
        "income": {
            "monthly": float(monthly_income)
        },
        "payment": {
            "monthly": float(monthly_payment)
        },
        "projects": {
            "active": active_projects
        },
        "pending_approvals": {
            "expenses": pending_expenses,
            "leaves": pending_leaves,
            "total": pending_expenses + pending_leaves
        }
    }


@router.get("/monthly-report")
async def get_monthly_report(
    year: int = None,
    month: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    if not year:
        year = today.year
    if not month:
        month = today.month

    month_start = date(year, month, 1)
    if month == 12:
        month_end = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        month_end = date(year, month + 1, 1) - timedelta(days=1)

    # 売上
    sales = db.query(func.sum(Quote.total_amount)).filter(
        Quote.status == "ordered",
        Quote.quote_date >= month_start,
        Quote.quote_date <= month_end
    ).scalar() or 0

    # 原価
    cost = db.query(func.sum(Quote.cost_amount)).filter(
        Quote.status == "ordered",
        Quote.quote_date >= month_start,
        Quote.quote_date <= month_end
    ).scalar() or 0

    # 粗利
    profit = db.query(func.sum(Quote.profit_amount)).filter(
        Quote.status == "ordered",
        Quote.quote_date >= month_start,
        Quote.quote_date <= month_end
    ).scalar() or 0

    # 経費
    expenses = db.query(func.sum(Expense.amount)).filter(
        Expense.status == "approved",
        Expense.expense_date >= month_start,
        Expense.expense_date <= month_end
    ).scalar() or 0

    # 入金
    income = db.query(func.sum(Income.amount)).filter(
        Income.status == "received",
        Income.income_date >= month_start,
        Income.income_date <= month_end
    ).scalar() or 0

    # 支払
    payment = db.query(func.sum(Payment.amount)).filter(
        Payment.status == "completed",
        Payment.payment_date >= month_start,
        Payment.payment_date <= month_end
    ).scalar() or 0

    return {
        "year": year,
        "month": month,
        "sales": float(sales),
        "cost": float(cost),
        "gross_profit": float(profit),
        "gross_profit_rate": float(profit / sales * 100) if sales > 0 else 0,
        "expenses": float(expenses),
        "operating_profit": float(profit) - float(expenses),
        "income": float(income),
        "payment": float(payment),
        "cash_flow": float(income) - float(payment)
    }


@router.get("/project-status")
async def get_project_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    projects = db.query(Project).filter(Project.status.in_(["planned", "in_progress"])).all()

    result = []
    for p in projects:
        result.append({
            "id": p.id,
            "project_code": p.project_code,
            "name": p.name,
            "status": p.status,
            "start_date": p.start_date,
            "end_date": p.end_date,
            "contract_amount": float(p.contract_amount or 0),
            "budget_amount": float(p.budget_amount or 0),
            "actual_cost": float(p.actual_cost or 0),
            "budget_remaining": float((p.budget_amount or 0) - (p.actual_cost or 0))
        })

    return result
