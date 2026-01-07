from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base

# Import all models to register them
from models import (
    User, Employee, Client, Partner, Quote, QuoteItem, Project,
    DailyReport, DailyReportLabor, DailyReportMaterial,
    Expense, Document, Schedule, BusinessCard,
    KYRecord, SafetyRecord, Photo,
    Inventory, Equipment, Vehicle,
    Invoice, Payment, Income,
    LeaveRequest, Approval, PriceMaster, PDMaterial
)

# Import routers
from api import auth, users, employees, clients, partners
from api import quotes, projects, daily_reports
from api import expenses, documents, schedules, business_cards
from api import ky_records, safety_records, photos
from api import inventory, equipment, vehicles
from api import invoices, payments, incomes
from api import leave_requests, approvals, price_master, pd_materials
from api import dashboard

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="S-BASE 3.0 API",
    description="サンユウテック現場管理システム API",
    version="3.0.0"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーター登録
app.include_router(auth.router, prefix="/api/auth", tags=["認証"])
app.include_router(users.router, prefix="/api/users", tags=["ユーザー"])
app.include_router(employees.router, prefix="/api/employees", tags=["従業員"])
app.include_router(clients.router, prefix="/api/clients", tags=["元請け"])
app.include_router(partners.router, prefix="/api/partners", tags=["協力業者"])
app.include_router(quotes.router, prefix="/api/quotes", tags=["見積"])
app.include_router(projects.router, prefix="/api/projects", tags=["プロジェクト"])
app.include_router(daily_reports.router, prefix="/api/daily-reports", tags=["日報"])
app.include_router(expenses.router, prefix="/api/expenses", tags=["経費"])
app.include_router(documents.router, prefix="/api/documents", tags=["書類"])
app.include_router(schedules.router, prefix="/api/schedules", tags=["スケジュール"])
app.include_router(business_cards.router, prefix="/api/business-cards", tags=["名刺"])
app.include_router(ky_records.router, prefix="/api/ky-records", tags=["KY記録"])
app.include_router(safety_records.router, prefix="/api/safety-records", tags=["安全管理"])
app.include_router(photos.router, prefix="/api/photos", tags=["工事写真"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["在庫"])
app.include_router(equipment.router, prefix="/api/equipment", tags=["機材"])
app.include_router(vehicles.router, prefix="/api/vehicles", tags=["車両"])
app.include_router(invoices.router, prefix="/api/invoices", tags=["請求書"])
app.include_router(payments.router, prefix="/api/payments", tags=["支払"])
app.include_router(incomes.router, prefix="/api/incomes", tags=["入金"])
app.include_router(leave_requests.router, prefix="/api/leave-requests", tags=["休暇申請"])
app.include_router(approvals.router, prefix="/api/approvals", tags=["承認"])
app.include_router(price_master.router, prefix="/api/price-master", tags=["単価マスタ"])
app.include_router(pd_materials.router, prefix="/api/pd-materials", tags=["PD材料"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["ダッシュボード"])


@app.get("/")
def read_root():
    return {"message": "S-BASE 3.0 API", "version": "3.0.0"}


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
