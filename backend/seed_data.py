#!/usr/bin/env python3
"""
S-BASE 3.0 Sample Data Seeder
"""
import sys
sys.path.insert(0, '.')

from datetime import datetime, date, timedelta
from decimal import Decimal
from database import SessionLocal, engine, Base
from models.client import Client
from models.employee import Employee
from models.project import Project
from models.quote import Quote, QuoteItem
from models.daily_report import DailyReport, DailyReportLabor
from models.schedule import Schedule
from models.business_card import BusinessCard
from models.expense import Expense
from models.leave_request import LeaveRequest
from models.inventory import Inventory
from models.ky_record import KYRecord

def seed_data():
    db = SessionLocal()

    try:
        # Check if data already exists
        if db.query(Client).count() > 0:
            print("Data already exists. Skipping seed.")
            return

        print("Seeding sample data...")

        # 1. Create Clients (得意先)
        clients = [
            Client(
                client_code="C001",
                name="株式会社山田建設",
                name_kana="かぶしきがいしゃやまだけんせつ",
                postal_code="100-0001",
                address="東京都千代田区丸の内1-1-1",
                phone="03-1234-5678",
                fax="03-1234-5679",
                email="info@yamada-kensetsu.co.jp",
                contact_person="山田太郎",
                is_active=True
            ),
            Client(
                client_code="C002",
                name="田中不動産株式会社",
                name_kana="たなかふどうさんかぶしきがいしゃ",
                postal_code="150-0001",
                address="東京都渋谷区神宮前2-2-2",
                phone="03-2345-6789",
                email="contact@tanaka-fudosan.co.jp",
                contact_person="田中花子",
                is_active=True
            ),
            Client(
                client_code="C003",
                name="佐藤工務店",
                name_kana="さとうこうむてん",
                postal_code="160-0001",
                address="東京都新宿区歌舞伎町3-3-3",
                phone="03-3456-7890",
                email="sato@koumuten.jp",
                contact_person="佐藤次郎",
                is_active=True
            ),
            Client(
                client_code="C004",
                name="鈴木ハウス株式会社",
                name_kana="すずきはうすかぶしきがいしゃ",
                postal_code="170-0001",
                address="東京都豊島区池袋4-4-4",
                phone="03-4567-8901",
                email="info@suzuki-house.co.jp",
                contact_person="鈴木一郎",
                is_active=True
            ),
        ]
        db.add_all(clients)
        db.flush()
        print(f"  Created {len(clients)} clients")

        # 2. Create Employees (従業員)
        employees = [
            Employee(
                employee_code="EMP001",
                name="高橋健一",
                name_kana="たかはしけんいち",
                department="工事部",
                position="部長",
                phone="090-1111-2222",
                email="takahashi@sbase.local",
                hire_date=date(2015, 4, 1),
                hourly_rate=Decimal("3000"),
                is_active=True
            ),
            Employee(
                employee_code="EMP002",
                name="渡辺美咲",
                name_kana="わたなべみさき",
                department="営業部",
                position="課長",
                phone="090-2222-3333",
                email="watanabe@sbase.local",
                hire_date=date(2018, 4, 1),
                hourly_rate=Decimal("2500"),
                is_active=True
            ),
            Employee(
                employee_code="EMP003",
                name="伊藤大輔",
                name_kana="いとうだいすけ",
                department="工事部",
                position="主任",
                phone="090-3333-4444",
                email="ito@sbase.local",
                hire_date=date(2020, 4, 1),
                hourly_rate=Decimal("2200"),
                is_active=True
            ),
            Employee(
                employee_code="EMP004",
                name="小林さくら",
                name_kana="こばやしさくら",
                department="総務部",
                position="一般",
                phone="090-4444-5555",
                email="kobayashi@sbase.local",
                hire_date=date(2022, 4, 1),
                hourly_rate=Decimal("1800"),
                is_active=True
            ),
            Employee(
                employee_code="EMP005",
                name="加藤雄太",
                name_kana="かとうゆうた",
                department="工事部",
                position="一般",
                phone="090-5555-6666",
                email="kato@sbase.local",
                hire_date=date(2023, 4, 1),
                hourly_rate=Decimal("1600"),
                is_active=True
            ),
        ]
        db.add_all(employees)
        db.flush()
        print(f"  Created {len(employees)} employees")

        # 3. Create Quotes (見積)
        quotes = [
            Quote(
                quote_number="Q2024-001",
                client_id=clients[0].id,
                project_name="A邸新築工事",
                site_name="A邸",
                site_address="東京都世田谷区成城5-5-5",
                quote_date=date(2024, 1, 15),
                valid_until=date(2024, 2, 15),
                subtotal=Decimal("5000000"),
                tax_rate=Decimal("10"),
                tax_amount=Decimal("500000"),
                total_amount=Decimal("5500000"),
                cost_amount=Decimal("3500000"),
                profit_amount=Decimal("1500000"),
                profit_rate=Decimal("30"),
                status="approved"
            ),
            Quote(
                quote_number="Q2024-002",
                client_id=clients[1].id,
                project_name="Bビル改装工事",
                site_name="田中ビル",
                site_address="東京都港区六本木6-6-6",
                quote_date=date(2024, 2, 1),
                valid_until=date(2024, 3, 1),
                subtotal=Decimal("8000000"),
                tax_rate=Decimal("10"),
                tax_amount=Decimal("800000"),
                total_amount=Decimal("8800000"),
                cost_amount=Decimal("5200000"),
                profit_amount=Decimal("2800000"),
                profit_rate=Decimal("35"),
                status="ordered"
            ),
            Quote(
                quote_number="Q2024-003",
                client_id=clients[2].id,
                project_name="C邸リフォーム",
                site_name="佐藤邸",
                site_address="東京都目黒区自由が丘7-7-7",
                quote_date=date(2024, 3, 1),
                valid_until=date(2024, 4, 1),
                subtotal=Decimal("3000000"),
                tax_rate=Decimal("10"),
                tax_amount=Decimal("300000"),
                total_amount=Decimal("3300000"),
                cost_amount=Decimal("2100000"),
                profit_amount=Decimal("900000"),
                profit_rate=Decimal("30"),
                status="submitted"
            ),
            Quote(
                quote_number="Q2024-004",
                client_id=clients[3].id,
                project_name="D社オフィス内装",
                site_name="鈴木オフィス",
                site_address="東京都中央区銀座8-8-8",
                quote_date=date(2024, 3, 15),
                valid_until=date(2024, 4, 15),
                subtotal=Decimal("12000000"),
                tax_rate=Decimal("10"),
                tax_amount=Decimal("1200000"),
                total_amount=Decimal("13200000"),
                cost_amount=Decimal("8400000"),
                profit_amount=Decimal("3600000"),
                profit_rate=Decimal("30"),
                status="draft"
            ),
        ]
        db.add_all(quotes)
        db.flush()
        print(f"  Created {len(quotes)} quotes")

        # 4. Create Quote Items
        quote_items = [
            QuoteItem(quote_id=quotes[0].id, item_order=1, description="基礎工事", quantity=1, unit="式", unit_price=Decimal("1500000"), amount=Decimal("1500000"), cost_price=Decimal("1000000")),
            QuoteItem(quote_id=quotes[0].id, item_order=2, description="木工事", quantity=1, unit="式", unit_price=Decimal("2000000"), amount=Decimal("2000000"), cost_price=Decimal("1400000")),
            QuoteItem(quote_id=quotes[0].id, item_order=3, description="屋根工事", quantity=1, unit="式", unit_price=Decimal("800000"), amount=Decimal("800000"), cost_price=Decimal("560000")),
            QuoteItem(quote_id=quotes[0].id, item_order=4, description="電気設備工事", quantity=1, unit="式", unit_price=Decimal("700000"), amount=Decimal("700000"), cost_price=Decimal("540000")),
            QuoteItem(quote_id=quotes[1].id, item_order=1, description="解体工事", quantity=1, unit="式", unit_price=Decimal("2000000"), amount=Decimal("2000000"), cost_price=Decimal("1300000")),
            QuoteItem(quote_id=quotes[1].id, item_order=2, description="内装工事", quantity=1, unit="式", unit_price=Decimal("4000000"), amount=Decimal("4000000"), cost_price=Decimal("2600000")),
            QuoteItem(quote_id=quotes[1].id, item_order=3, description="設備工事", quantity=1, unit="式", unit_price=Decimal("2000000"), amount=Decimal("2000000"), cost_price=Decimal("1300000")),
        ]
        db.add_all(quote_items)
        db.flush()
        print(f"  Created {len(quote_items)} quote items")

        # 5. Create Projects (工事)
        projects = [
            Project(
                project_code="P2024-001",
                quote_id=quotes[0].id,
                client_id=clients[0].id,
                name="A邸新築工事",
                site_name="A邸",
                site_address="東京都世田谷区成城5-5-5",
                manager_id=employees[0].id,
                start_date=date(2024, 2, 1),
                end_date=date(2024, 6, 30),
                contract_amount=Decimal("5500000"),
                budget_amount=Decimal("3500000"),
                actual_cost=Decimal("1200000"),
                status="in_progress"
            ),
            Project(
                project_code="P2024-002",
                quote_id=quotes[1].id,
                client_id=clients[1].id,
                name="Bビル改装工事",
                site_name="田中ビル",
                site_address="東京都港区六本木6-6-6",
                manager_id=employees[2].id,
                start_date=date(2024, 3, 1),
                end_date=date(2024, 8, 31),
                contract_amount=Decimal("8800000"),
                budget_amount=Decimal("5200000"),
                actual_cost=Decimal("0"),
                status="planned"
            ),
            Project(
                project_code="P2023-010",
                client_id=clients[2].id,
                name="旧C邸改修工事",
                site_name="旧佐藤邸",
                site_address="東京都杉並区荻窪1-1-1",
                manager_id=employees[0].id,
                start_date=date(2023, 9, 1),
                end_date=date(2023, 12, 31),
                contract_amount=Decimal("4200000"),
                budget_amount=Decimal("2800000"),
                actual_cost=Decimal("2750000"),
                status="completed"
            ),
        ]
        db.add_all(projects)
        db.flush()
        print(f"  Created {len(projects)} projects")

        # 6. Create Business Cards (名刺)
        business_cards = [
            BusinessCard(
                company_name="株式会社山田建設",
                department="営業部",
                position="部長",
                name="山田太郎",
                name_kana="やまだたろう",
                phone="03-1234-5678",
                mobile="090-1234-5678",
                email="yamada@yamada-kensetsu.co.jp",
                address="東京都千代田区丸の内1-1-1",
                client_id=clients[0].id
            ),
            BusinessCard(
                company_name="田中不動産株式会社",
                department="開発部",
                position="課長",
                name="田中花子",
                name_kana="たなかはなこ",
                phone="03-2345-6789",
                mobile="090-2345-6789",
                email="tanaka@tanaka-fudosan.co.jp",
                address="東京都渋谷区神宮前2-2-2",
                client_id=clients[1].id
            ),
            BusinessCard(
                company_name="佐藤工務店",
                department="",
                position="代表取締役",
                name="佐藤次郎",
                name_kana="さとうじろう",
                phone="03-3456-7890",
                mobile="090-3456-7890",
                email="sato@koumuten.jp",
                address="東京都新宿区歌舞伎町3-3-3",
                client_id=clients[2].id
            ),
            BusinessCard(
                company_name="ABC建材株式会社",
                department="販売部",
                position="主任",
                name="中村健太",
                name_kana="なかむらけんた",
                phone="03-5678-9012",
                mobile="090-5678-9012",
                email="nakamura@abc-kenzai.co.jp",
                address="東京都江東区豊洲4-4-4"
            ),
        ]
        db.add_all(business_cards)
        db.flush()
        print(f"  Created {len(business_cards)} business cards")

        # 7. Create Schedules (スケジュール)
        today = date.today()
        schedules = [
            Schedule(
                title="山田建設打合せ",
                schedule_type="meeting",
                date=today + timedelta(days=1),
                start_time=datetime.strptime("10:00", "%H:%M").time(),
                end_time=datetime.strptime("11:30", "%H:%M").time(),
                location="山田建設本社",
                client_id=clients[0].id,
                employee_id=employees[1].id,
                description="A邸新築工事の進捗確認",
                status="scheduled"
            ),
            Schedule(
                title="現場調査 - 新規案件",
                schedule_type="visit",
                date=today + timedelta(days=2),
                start_time=datetime.strptime("14:00", "%H:%M").time(),
                end_time=datetime.strptime("16:00", "%H:%M").time(),
                location="東京都品川区大井町",
                employee_id=employees[1].id,
                description="新規見積のための現地調査",
                status="scheduled"
            ),
            Schedule(
                title="田中不動産訪問",
                schedule_type="visit",
                date=today + timedelta(days=3),
                start_time=datetime.strptime("13:00", "%H:%M").time(),
                end_time=datetime.strptime("14:00", "%H:%M").time(),
                location="田中不動産本社",
                client_id=clients[1].id,
                employee_id=employees[1].id,
                description="Bビル改装工事の契約書類確認",
                status="scheduled"
            ),
            Schedule(
                title="社内定例会議",
                schedule_type="meeting",
                date=today + timedelta(days=7),
                start_time=datetime.strptime("09:00", "%H:%M").time(),
                end_time=datetime.strptime("10:00", "%H:%M").time(),
                location="本社会議室",
                description="週次進捗報告",
                status="scheduled"
            ),
        ]
        db.add_all(schedules)
        db.flush()
        print(f"  Created {len(schedules)} schedules")

        # 8. Create Inventory Items (在庫)
        inventory_items = [
            Inventory(
                item_code="INV001",
                name="コンクリート釘 50mm",
                category="material",
                quantity=500,
                unit="本",
                min_quantity=100,
                unit_price=Decimal("15"),
                location="倉庫A-1"
            ),
            Inventory(
                item_code="INV002",
                name="木材 2x4 3m",
                category="material",
                quantity=80,
                unit="本",
                min_quantity=20,
                unit_price=Decimal("800"),
                location="倉庫B-2"
            ),
            Inventory(
                item_code="INV003",
                name="電動ドリル",
                category="tool",
                quantity=5,
                unit="台",
                min_quantity=2,
                unit_price=Decimal("15000"),
                location="工具棚A"
            ),
            Inventory(
                item_code="INV004",
                name="安全ヘルメット",
                category="safety",
                quantity=15,
                unit="個",
                min_quantity=10,
                unit_price=Decimal("2500"),
                location="安全用品棚"
            ),
            Inventory(
                item_code="INV005",
                name="養生テープ",
                category="consumable",
                quantity=50,
                unit="巻",
                min_quantity=20,
                unit_price=Decimal("300"),
                location="消耗品棚"
            ),
            Inventory(
                item_code="INV006",
                name="インパクトドライバー",
                category="tool",
                quantity=3,
                unit="台",
                min_quantity=1,
                unit_price=Decimal("25000"),
                location="工具棚A"
            ),
        ]
        db.add_all(inventory_items)
        db.flush()
        print(f"  Created {len(inventory_items)} inventory items")

        # 9. Create KY Records (危険予知記録)
        ky_records = [
            KYRecord(
                project_id=projects[0].id,
                record_date=today - timedelta(days=1),
                weather="sunny",
                participants="高橋、伊藤、加藤",
                participant_count=3,
                work_content="外壁塗装作業",
                hazard_points="高所作業中の転落、塗料による皮膚かぶれ",
                countermeasures="安全帯の確実な使用、保護手袋・ゴーグルの着用",
                team_leader="高橋健一",
                safety_call="ゼロ災でいこう、ヨシ！"
            ),
            KYRecord(
                project_id=projects[0].id,
                record_date=today,
                weather="cloudy",
                participants="高橋、伊藤、加藤、協力業者2名",
                participant_count=5,
                work_content="屋根瓦設置作業",
                hazard_points="屋根からの転落、資材落下による下部作業者への危険",
                countermeasures="親綱・安全帯の使用徹底、立入禁止区域の設定",
                team_leader="高橋健一",
                safety_call="ゼロ災でいこう、ヨシ！"
            ),
        ]
        db.add_all(ky_records)
        db.flush()
        print(f"  Created {len(ky_records)} KY records")

        # 10. Create Daily Reports (日報)
        daily_reports = [
            DailyReport(
                report_date=today - timedelta(days=1),
                project_id=projects[0].id,
                employee_id=employees[0].id,
                weather="sunny",
                work_hours=Decimal("8"),
                work_content="外壁塗装作業（南面）完了\n下地処理、プライマー塗布、中塗り実施",
                issues="一部外壁にクラック発見、補修が必要",
                tomorrow_plan="外壁塗装作業（東面）着手予定",
                status="submitted"
            ),
            DailyReport(
                report_date=today,
                project_id=projects[0].id,
                employee_id=employees[0].id,
                weather="cloudy",
                work_hours=Decimal("8"),
                work_content="屋根瓦設置作業\n野地板確認、ルーフィング施工、瓦桟取付",
                issues="午後から雨予報のため作業調整",
                tomorrow_plan="瓦設置作業継続",
                status="draft"
            ),
        ]
        db.add_all(daily_reports)
        db.flush()
        print(f"  Created {len(daily_reports)} daily reports")

        # 11. Create Expenses (経費)
        expenses = [
            Expense(
                employee_id=employees[1].id,
                expense_date=today - timedelta(days=5),
                category="travel",
                description="電車代（新宿→六本木往復）",
                amount=Decimal("580"),
                payment_method="ic_card",
                status="approved"
            ),
            Expense(
                employee_id=employees[1].id,
                expense_date=today - timedelta(days=3),
                category="meal",
                description="接待昼食（山田建設 山田様）",
                amount=Decimal("3500"),
                payment_method="cash",
                status="approved"
            ),
            Expense(
                employee_id=employees[3].id,
                expense_date=today - timedelta(days=2),
                category="supply",
                description="コピー用紙購入",
                amount=Decimal("2800"),
                payment_method="cash",
                status="pending"
            ),
            Expense(
                employee_id=employees[0].id,
                expense_date=today - timedelta(days=1),
                category="travel",
                description="タクシー代（現場→本社）",
                amount=Decimal("2400"),
                payment_method="cash",
                status="pending"
            ),
        ]
        db.add_all(expenses)
        db.flush()
        print(f"  Created {len(expenses)} expenses")

        # 12. Create Leave Requests (休暇申請)
        leave_requests = [
            LeaveRequest(
                employee_id=employees[3].id,
                leave_type="paid",
                start_date=today + timedelta(days=14),
                end_date=today + timedelta(days=14),
                reason="私用のため",
                status="approved"
            ),
            LeaveRequest(
                employee_id=employees[4].id,
                leave_type="paid",
                start_date=today + timedelta(days=21),
                end_date=today + timedelta(days=23),
                reason="帰省のため",
                status="pending"
            ),
        ]
        db.add_all(leave_requests)
        db.flush()
        print(f"  Created {len(leave_requests)} leave requests")

        db.commit()
        print("\nSample data seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding data: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
