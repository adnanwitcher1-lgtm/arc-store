import io

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction

from store.models import (
    Category, Product, ProductImage, ProductOption, ProductOptionValue, Review,
)

User = get_user_model()

FONT_CANDIDATES = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
]
PALETTE_TINTS = ["#F3F1EC", "#EAE6DC", "#E7EFEA", "#F1E9E4"]
INK = "#211D19"
PINE = "#1E4638"

CATEGORIES = ["Watches", "Footwear", "Skincare", "Grooming", "Fashion", "Lifestyle"]

PRODUCTS = [
    dict(
        category="Watches", name="Premium Smart Watch", sku="JH-WATCH-001",
        price="35999.00", compare_at_price="54999.00", stock=42, featured=True,
        short_description="Track your fitness and stay connected in style.",
        description=(
            "Stay connected and track your fitness goals with this stylish, feature-packed "
            "smartwatch. Heart rate monitoring, sleep tracking, and smart notifications keep "
            "you informed without reaching for your phone, while the aluminium case and soft "
            "silicone band make it comfortable for all-day, every-day wear."
        ),
        specifications={
            "Display": "1.9\" AMOLED, always-on", "Battery Life": "Up to 18 hours",
            "Water Resistance": "5 ATM", "Connectivity": "Bluetooth 5.3",
            "Compatibility": "iOS & Android",
        },
        options={
            "Color": [("Black", "#1C1C1E"), ("White", "#F2F1EC"), ("Pink", "#F3B4C0"), ("Blue", "#4C6FE0")],
            "Strap Color": [("Black", "#1C1C1E"), ("White", "#F2F1EC"), ("Pink", "#F3B4C0"), ("Navy", "#26314F")],
        },
        reviews=[(5, "Battery lasts all week"), (5, "Great screen, easy to read outdoors"), (4, "Comfortable strap, would buy again")],
    ),
    dict(
        category="Watches", name="Classic Chrono Watch", sku="JH-WATCH-002",
        price="24999.00", compare_at_price="32999.00", stock=30, featured=False,
        short_description="A timeless analogue chronograph for everyday wear.",
        description="A stainless-steel chronograph with a scratch-resistant sapphire-coated face, built for the office and the weekend alike.",
        specifications={"Case": "40mm stainless steel", "Movement": "Quartz chronograph", "Water Resistance": "3 ATM"},
        options={"Color": [("Silver", "#C7C7CC"), ("Gold", "#C9A24B"), ("Black", "#1C1C1E")]},
        reviews=[(5, "Looks much more expensive than it is")],
    ),
    dict(
        category="Footwear", name="Cloud Runner Sneakers", sku="JH-SHOE-001",
        price="12999.00", compare_at_price="16999.00", stock=60, featured=True,
        short_description="Lightweight everyday trainers with breathable mesh.",
        description="Engineered mesh uppers and a cushioned foam sole make these light enough for a run and clean enough for the street.",
        specifications={"Upper": "Breathable knit mesh", "Sole": "Cushioned EVA foam", "Sizes": "EU 38–46"},
        options={"Color": [("White", "#F2F1EC"), ("Black", "#1C1C1E"), ("Sage", "#8FA38B")]},
        reviews=[(5, "Super comfortable out of the box"), (4, "True to size, good arch support")],
    ),
    dict(
        category="Footwear", name="Trail Grip Hiking Boots", sku="JH-SHOE-002",
        price="18999.00", compare_at_price=None, stock=25, featured=False,
        short_description="Waterproof boots built for uneven ground.",
        description="A grippy lugged outsole and a waterproof membrane keep you steady and dry on the trail.",
        specifications={"Upper": "Waterproof nubuck", "Outsole": "Lugged rubber", "Lining": "Breathable membrane"},
        options={"Color": [("Brown", "#6B4A34"), ("Black", "#1C1C1E")]},
        reviews=[(5, "Kept my feet dry on a rainy hike")],
    ),
    dict(
        category="Skincare", name="Vitamin C Glow Serum", sku="JH-SKIN-001",
        price="2499.00", compare_at_price="3299.00", stock=80, featured=True,
        short_description="A brightening daily serum for an even tone.",
        description="A lightweight, fast-absorbing serum with 15% vitamin C to brighten skin and soften the look of fine lines over time.",
        specifications={"Size": "30ml", "Key Ingredient": "15% Vitamin C", "Skin Type": "All skin types"},
        options={},
        reviews=[(5, "Noticed brighter skin in two weeks"), (4, "A little sticky at first but worth it")],
    ),
    dict(
        category="Skincare", name="Hydrating Clay Mask", sku="JH-SKIN-002",
        price="1799.00", compare_at_price=None, stock=70, featured=False,
        short_description="A weekly mask that cleans without over-drying.",
        description="Kaolin clay draws out impurities while aloe and glycerin keep skin from feeling tight afterwards.",
        specifications={"Size": "100ml", "Key Ingredient": "Kaolin clay + aloe", "Use": "1–2 times a week"},
        options={},
        reviews=[(4, "Gentle enough for sensitive skin")],
    ),
    dict(
        category="Grooming", name="Precision Beard Trimmer", sku="JH-GROOM-001",
        price="6999.00", compare_at_price="9499.00", stock=45, featured=True,
        short_description="20-length cordless trimmer with a fast charge.",
        description="Self-sharpening steel blades and 20 length settings for everything from stubble to a full beard, with a 90-minute cordless run time.",
        specifications={"Battery": "90 minutes cordless use", "Lengths": "20 settings", "Blade": "Self-sharpening steel"},
        options={"Color": [("Black", "#1C1C1E"), ("Graphite", "#4B4B4D")]},
        reviews=[(5, "Charges fast and holds an edge")],
    ),
    dict(
        category="Grooming", name="Sandalwood Grooming Kit", sku="JH-GROOM-002",
        price="3999.00", compare_at_price=None, stock=40, featured=False,
        short_description="A travel-ready wash, oil and balm set.",
        description="A sandalwood-scented beard wash, conditioning oil and matte balm, sized for the counter or a carry-on.",
        specifications={"Includes": "Wash, oil, balm", "Scent": "Sandalwood & cedar"},
        options={},
        reviews=[],
    ),
    dict(
        category="Fashion", name="Everyday Oxford Shirt", sku="JH-FASH-001",
        price="4999.00", compare_at_price=None, stock=55, featured=False,
        short_description="A breathable cotton oxford for work or weekends.",
        description="A softly structured cotton oxford that moves easily from a desk to dinner, cut for a comfortable, not-boxy fit.",
        specifications={"Fabric": "100% cotton oxford", "Fit": "Regular", "Care": "Machine washable"},
        options={"Color": [("White", "#F2F1EC"), ("Light Blue", "#C7D6E8"), ("Navy", "#26314F")]},
        reviews=[(4, "Fits well, holds up after washing")],
    ),
    dict(
        category="Fashion", name="Relaxed Fit Chinos", sku="JH-FASH-002",
        price="5999.00", compare_at_price="7499.00", stock=50, featured=False,
        short_description="Stretch-cotton chinos with a tapered leg.",
        description="A touch of stretch in a mid-weight cotton twill, tapered through the leg for a modern, relaxed silhouette.",
        specifications={"Fabric": "98% cotton, 2% elastane", "Fit": "Relaxed, tapered leg"},
        options={"Color": [("Khaki", "#C6B084"), ("Black", "#1C1C1E"), ("Olive", "#6B7458")]},
        reviews=[],
    ),
    dict(
        category="Lifestyle", name="Insulated Travel Mug", sku="JH-LIFE-001",
        price="2999.00", compare_at_price=None, stock=90, featured=False,
        short_description="Keeps drinks hot or cold for hours.",
        description="Double-wall vacuum insulation keeps coffee hot for 8 hours or a cold brew cold for 12, with a leakproof lid for the commute.",
        specifications={"Capacity": "473ml", "Insulation": "Double-wall vacuum", "Lid": "Leakproof"},
        options={"Color": [("Black", "#1C1C1E"), ("Sage", "#8FA38B"), ("Terracotta", "#A1432E")]},
        reviews=[(5, "Coffee is still hot at lunch")],
    ),
    dict(
        category="Lifestyle", name="Woven Desk Organizer", sku="JH-LIFE-002",
        price="3499.00", compare_at_price=None, stock=35, featured=False,
        short_description="A tidy home for everyday desk clutter.",
        description="Woven seagrass and a soft-close tray keep pens, cables and notebooks in their place without looking clinical.",
        specifications={"Material": "Woven seagrass, oak base", "Dimensions": "30 x 20 x 10 cm"},
        options={},
        reviews=[],
    ),
    dict(
        category="Watches", name="Minimalist Leather Watch", sku="JH-WATCH-003",
        price="15999.00", compare_at_price="19999.00", stock=38, featured=False,
        short_description="A slim, understated watch for daily wear.",
        description="A clean dial and a genuine leather strap make this the watch you reach for when you want the outfit to do the talking.",
        specifications={"Case": "38mm stainless steel", "Movement": "Quartz", "Strap": "Genuine leather"},
        options={"Color": [("Black", "#1C1C1E"), ("Brown", "#6B4A34"), ("Tan", "#C6A87C")]},
        reviews=[(5, "Slim enough to fit under a shirt cuff")],
    ),
    dict(
        category="Watches", name="Sport Digital Watch", sku="JH-WATCH-004",
        price="9999.00", compare_at_price=None, stock=50, featured=False,
        short_description="A rugged digital watch built for the gym and outdoors.",
        description="Shock-resistant casing, a backlit display and a stopwatch make this a no-fuss companion for training days.",
        specifications={"Water Resistance": "10 ATM", "Display": "Digital, backlit", "Extras": "Stopwatch, alarm"},
        options={"Strap Color": [("Black", "#1C1C1E"), ("Blue", "#4C6FE0"), ("Red", "#A1432E")]},
        reviews=[(4, "Tough — survived a few drops already")],
    ),
    dict(
        category="Watches", name="Rose Gold Dress Watch", sku="JH-WATCH-005",
        price="27999.00", compare_at_price="34999.00", stock=22, featured=False,
        short_description="A polished dress watch with a rose gold finish.",
        description="A mesh strap and a slim rose-gold case dress up a wrist without trying too hard — evening dinners to Sunday brunch.",
        specifications={"Case": "34mm rose gold-plated", "Movement": "Quartz", "Strap": "Stainless mesh"},
        options={"Color": [("Rose Gold", "#C9A24B"), ("Silver", "#C7C7CC")]},
        reviews=[(5, "Gets compliments every time I wear it")],
    ),
    dict(
        category="Watches", name="Titanium Dive Watch", sku="JH-WATCH-006",
        price="45999.00", compare_at_price="59999.00", stock=15, featured=False,
        short_description="A serious dive watch built for depth and daily wear alike.",
        description="A titanium case, a unidirectional bezel and genuine dive-rated water resistance for anyone who actually wants to get it wet.",
        specifications={"Water Resistance": "20 ATM", "Case": "Titanium", "Bezel": "Unidirectional, dive-rated"},
        options={"Strap Color": [("Black", "#1C1C1E"), ("Navy", "#26314F")]},
        reviews=[(5, "Finally a dive watch that doesn't feel like a brick")],
    ),
    dict(
        category="Footwear", name="Canvas Low-Top Sneakers", sku="JH-SHOE-003",
        price="6999.00", compare_at_price="8999.00", stock=65, featured=False,
        short_description="A classic canvas sneaker for everyday errands.",
        description="Lightweight canvas uppers and a flexible rubber sole for a sneaker that goes with everything and asks for nothing.",
        specifications={"Upper": "Cotton canvas", "Sole": "Vulcanized rubber", "Sizes": "EU 38-45"},
        options={"Color": [("White", "#F2F1EC"), ("Black", "#1C1C1E"), ("Navy", "#26314F")]},
        reviews=[(4, "Great for the price, wears in fast")],
    ),
    dict(
        category="Footwear", name="Formal Leather Oxfords", sku="JH-SHOE-004",
        price="15999.00", compare_at_price=None, stock=40, featured=False,
        short_description="Classic leather oxfords for the office and events.",
        description="Full-grain leather uppers and a cushioned insole keep these sharp enough for a boardroom and comfortable enough for a full day in them.",
        specifications={"Upper": "Full-grain leather", "Sole": "Leather with rubber grip", "Sizes": "EU 40-46"},
        options={"Color": [("Black", "#1C1C1E"), ("Brown", "#6B4A34")]},
        reviews=[(5, "Finally office shoes that don't hurt by 3pm")],
    ),
    dict(
        category="Footwear", name="Slip-On Loafers", sku="JH-SHOE-005",
        price="9999.00", compare_at_price="12999.00", stock=45, featured=False,
        short_description="No-lace loafers for a quick, put-together look.",
        description="A suede finish and a low profile sole make these the shoe you don't have to think about on your way out the door.",
        specifications={"Upper": "Suede", "Sole": "Flexible rubber", "Sizes": "EU 39-45"},
        options={"Color": [("Tan", "#C6A87C"), ("Black", "#1C1C1E")]},
        reviews=[],
    ),
    dict(
        category="Footwear", name="All-Weather Sandals", sku="JH-SHOE-006",
        price="4999.00", compare_at_price=None, stock=70, featured=False,
        short_description="Quick-dry sandals built for water and trail.",
        description="A grippy lugged sole and quick-dry straps make these equally at home on a riverbank or the school run.",
        specifications={"Upper": "Quick-dry webbing", "Sole": "Lugged rubber", "Sizes": "EU 38-45"},
        options={"Color": [("Black", "#1C1C1E"), ("Sage", "#8FA38B")]},
        reviews=[(4, "Dries fast, good grip on wet rocks")],
    ),
    dict(
        category="Skincare", name="Niacinamide Pore Refiner", sku="JH-SKIN-003",
        price="2199.00", compare_at_price="2799.00", stock=85, featured=False,
        short_description="A daily serum that visibly tightens pores.",
        description="10% niacinamide plus zinc helps balance oil and refine the look of pores without over-drying skin.",
        specifications={"Size": "30ml", "Key Ingredient": "10% Niacinamide + Zinc", "Skin Type": "Oily, combination"},
        options={},
        reviews=[(5, "Skin looks noticeably smoother after a month")],
    ),
    dict(
        category="Skincare", name="Gentle Foaming Cleanser", sku="JH-SKIN-004",
        price="1599.00", compare_at_price=None, stock=95, featured=False,
        short_description="A soap-free cleanser for morning and night.",
        description="A soft, low-foam formula lifts away dirt and makeup without stripping skin's natural moisture barrier.",
        specifications={"Size": "150ml", "Key Ingredient": "Ceramides + glycerin", "Skin Type": "All skin types"},
        options={},
        reviews=[],
    ),
    dict(
        category="Skincare", name="SPF 50 Daily Sunscreen", sku="JH-SKIN-005",
        price="1999.00", compare_at_price=None, stock=100, featured=False,
        short_description="A lightweight, no-white-cast daily sunscreen.",
        description="Broad-spectrum SPF 50 protection in a fast-absorbing gel base that layers cleanly under makeup.",
        specifications={"Size": "50ml", "SPF": "50, broad-spectrum", "Finish": "Matte, no white cast"},
        options={},
        reviews=[(5, "No white cast even on camera")],
    ),
    dict(
        category="Skincare", name="Retinol Night Cream", sku="JH-SKIN-006",
        price="3499.00", compare_at_price="4299.00", stock=55, featured=False,
        short_description="A nightly cream that softens fine lines over time.",
        description="Encapsulated retinol releases slowly overnight, paired with squalane to keep skin from feeling tight by morning.",
        specifications={"Size": "30ml", "Key Ingredient": "Encapsulated retinol", "Use": "Nightly, start 2-3x/week"},
        options={},
        reviews=[(4, "Start slow — but the results are worth it")],
    ),
    dict(
        category="Grooming", name="Safety Razor Shave Set", sku="JH-GROOM-003",
        price="4999.00", compare_at_price="6499.00", stock=35, featured=False,
        short_description="A classic wet-shave set for a closer shave.",
        description="A weighted safety razor, brush and stand bring the barbershop shave home, blade refills sold separately.",
        specifications={"Includes": "Razor, brush, stand", "Handle": "Weighted stainless steel"},
        options={},
        reviews=[(5, "Closest shave I've had, takes some practice")],
    ),
    dict(
        category="Grooming", name="Charcoal Face Wash for Men", sku="JH-GROOM-004",
        price="1499.00", compare_at_price=None, stock=90, featured=False,
        short_description="An activated charcoal wash for oily skin.",
        description="Activated charcoal and tea tree oil lift away grime and shine without leaving skin feeling stripped.",
        specifications={"Size": "150ml", "Key Ingredient": "Activated charcoal, tea tree"},
        options={},
        reviews=[],
    ),
    dict(
        category="Grooming", name="Matte Hair Clay", sku="JH-GROOM-005",
        price="1899.00", compare_at_price=None, stock=60, featured=False,
        short_description="A strong-hold clay with a natural matte finish.",
        description="Reworkable all day and washes out clean at night — strong hold without the shine of a traditional pomade.",
        specifications={"Size": "80g", "Hold": "Strong", "Finish": "Matte"},
        options={},
        reviews=[(4, "Holds all day even in humidity")],
    ),
    dict(
        category="Grooming", name="Electric Nose & Ear Trimmer", sku="JH-GROOM-006",
        price="2999.00", compare_at_price="3799.00", stock=40, featured=False,
        short_description="A painless, washable nose and ear trimmer.",
        description="A rounded safety blade trims without pulling, and the whole head rinses clean under the tap.",
        specifications={"Battery": "AA, ~6 months typical use", "Blade": "Rounded, skin-safe", "Cleaning": "Washable head"},
        options={},
        reviews=[],
    ),
    dict(
        category="Fashion", name="Crewneck Cotton T-Shirt", sku="JH-FASH-003",
        price="2499.00", compare_at_price=None, stock=100, featured=False,
        short_description="A heavyweight cotton tee that keeps its shape.",
        description="A slightly heavier cotton than most basics, so it drapes well and doesn't go sheer after a few washes.",
        specifications={"Fabric": "100% combed cotton", "Fit": "Regular", "Care": "Machine washable"},
        options={"Color": [("White", "#F2F1EC"), ("Black", "#1C1C1E"), ("Sage", "#8FA38B")]},
        reviews=[(5, "Thicker than expected, holds up well")],
    ),
    dict(
        category="Fashion", name="Denim Jacket", sku="JH-FASH-004",
        price="8999.00", compare_at_price="10999.00", stock=30, featured=False,
        short_description="A mid-wash denim jacket for layering.",
        description="A classic trucker cut in a mid-weight denim that's sturdy enough for daily wear and softens with age.",
        specifications={"Fabric": "100% cotton denim", "Fit": "Regular", "Wash": "Mid-blue"},
        options={"Color": [("Mid Blue", "#4C6FE0"), ("Black", "#1C1C1E")]},
        reviews=[],
    ),
    dict(
        category="Fashion", name="Wool Blend Sweater", sku="JH-FASH-005",
        price="6499.00", compare_at_price=None, stock=40, featured=False,
        short_description="A soft wool-blend crewneck for cooler days.",
        description="A wool-cotton blend that's warm without the itch, in a fit that layers cleanly under a jacket.",
        specifications={"Fabric": "60% wool, 40% cotton", "Fit": "Regular", "Care": "Hand wash cold"},
        options={"Color": [("Charcoal", "#4B4B4D"), ("Navy", "#26314F"), ("Oatmeal", "#C6B084")]},
        reviews=[(5, "Warm without being bulky")],
    ),
    dict(
        category="Fashion", name="Slim Fit Formal Trousers", sku="JH-FASH-006",
        price="5499.00", compare_at_price="6999.00", stock=45, featured=False,
        short_description="Tailored trousers for the office.",
        description="A slim leg and a touch of stretch keep these sharp for meetings and comfortable enough for the commute in between.",
        specifications={"Fabric": "97% polyester, 3% elastane", "Fit": "Slim"},
        options={"Color": [("Charcoal", "#4B4B4D"), ("Navy", "#26314F"), ("Black", "#1C1C1E")]},
        reviews=[],
    ),
    dict(
        category="Lifestyle", name="Scented Soy Candle", sku="JH-LIFE-003",
        price="1799.00", compare_at_price=None, stock=60, featured=False,
        short_description="A clean-burning soy candle for any room.",
        description="Hand-poured soy wax and a cotton wick burn cleanly for around 40 hours, in a jar worth keeping after.",
        specifications={"Burn Time": "~40 hours", "Wax": "Soy", "Scent": "Sandalwood & amber"},
        options={},
        reviews=[(5, "Fills the room without being overpowering")],
    ),
    dict(
        category="Lifestyle", name="Leather Passport Wallet", sku="JH-LIFE-004",
        price="3999.00", compare_at_price="4999.00", stock=40, featured=False,
        short_description="A slim leather cover for travel documents.",
        description="Full-grain leather that ages into its own patina, with slots for cards, a passport and boarding passes.",
        specifications={"Material": "Full-grain leather", "Slots": "Passport + 4 cards"},
        options={"Color": [("Brown", "#6B4A34"), ("Black", "#1C1C1E")]},
        reviews=[],
    ),
    dict(
        category="Lifestyle", name="Bluetooth Portable Speaker", sku="JH-LIFE-005",
        price="8999.00", compare_at_price="11999.00", stock=35, featured=False,
        short_description="A compact speaker with surprisingly big sound.",
        description="12 hours of playback and a splash-proof shell make this the speaker that moves from the kitchen counter to the backyard.",
        specifications={"Battery Life": "12 hours", "Water Resistance": "IPX5", "Connectivity": "Bluetooth 5.3"},
        options={"Color": [("Black", "#1C1C1E"), ("Blue", "#4C6FE0")]},
        reviews=[(4, "Loud for its size, bass is decent")],
    ),
    dict(
        category="Lifestyle", name="Ceramic Plant Pot Set", sku="JH-LIFE-006",
        price="2999.00", compare_at_price=None, stock=50, featured=False,
        short_description="A set of 3 minimalist ceramic planters.",
        description="Three sizes with drainage holes and matching saucers — enough to start a windowsill garden without the mismatched pots.",
        specifications={"Includes": "3 pots + saucers", "Material": "Glazed ceramic"},
        options={"Color": [("White", "#F2F1EC"), ("Terracotta", "#A1432E")]},
        reviews=[],
    ),
]

DEMO_CUSTOMERS = [
    ("sara.k", "Sara", "Khan"),
    ("hamza.b", "Hamza", "Bhatti"),
    ("ayesha.n", "Ayesha", "Noor"),
]


def _font(size):
    from PIL import ImageFont
    for path in FONT_CANDIDATES:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def make_placeholder_image(text, index=0, size=800):
    from PIL import Image, ImageDraw

    bg = PALETTE_TINTS[index % len(PALETTE_TINTS)]
    img = Image.new("RGB", (size, size), bg)
    draw = ImageDraw.Draw(img)
    draw.arc(
        [size * 0.55, -size * 0.35, size * 1.35, size * 0.45],
        start=90, end=180, fill=PINE, width=18,
    )
    font = _font(50)
    words, lines, current = text.split(), [], ""
    for w in words:
        test = (current + " " + w).strip()
        if draw.textlength(test, font=font) > size - 140:
            lines.append(current)
            current = w
        else:
            current = test
    if current:
        lines.append(current)
    total_h = len(lines) * 62
    y = (size - total_h) / 2
    for line in lines:
        w = draw.textlength(line, font=font)
        draw.text(((size - w) / 2, y), line, font=font, fill=INK)
        y += 62
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=88)
    return ContentFile(buf.getvalue(), name=f"{text.lower().replace(' ', '-')}-{index}.jpg")


class Command(BaseCommand):
    help = "Seed the store with demo categories, products, images, accounts and reviews."

    def add_arguments(self, parser):
        parser.add_argument("--reset", action="store_true", help="Delete existing catalog data first.")

    @transaction.atomic
    def handle(self, *args, **options):
        if options["reset"]:
            Product.objects.all().delete()
            Category.objects.all().delete()
            self.stdout.write("Cleared existing catalog data.")

        if Product.objects.exists():
            self.stdout.write(self.style.WARNING("Products already exist — skipping seed. Use --reset to reseed."))
            return

        categories = {}
        for i, name in enumerate(CATEGORIES):
            categories[name], _ = Category.objects.get_or_create(name=name, defaults={"order": i})

        if not User.objects.filter(username="admin").exists():
            User.objects.create_superuser("admin", "admin@example.com", "AdminPass123!")
            self.stdout.write(self.style.SUCCESS("Created admin login -> username: admin / password: AdminPass123!"))

        reviewers = []
        for username, first, last in DEMO_CUSTOMERS:
            user, created = User.objects.get_or_create(
                username=username, defaults={"first_name": first, "last_name": last, "email": f"{username}@example.com"},
            )
            if created:
                user.set_password("DemoPass123!")
                user.save()
            reviewers.append(user)

        for data in PRODUCTS:
            product = Product.objects.create(
                category=categories[data["category"]],
                name=data["name"],
                sku=data["sku"],
                price=data["price"],
                compare_at_price=data["compare_at_price"],
                stock=data["stock"],
                is_featured=data["featured"],
                short_description=data["short_description"],
                description=data["description"],
                specifications=data["specifications"],
            )
            for i in range(3):
                img_file = make_placeholder_image(data["name"], index=i)
                ProductImage.objects.create(product=product, image=img_file, order=i, alt_text=data["name"])

            for order, (option_name, values) in enumerate(data["options"].items()):
                option = ProductOption.objects.create(product=product, name=option_name, order=order)
                for v_order, (label, hexcode) in enumerate(values):
                    ProductOptionValue.objects.create(option=option, label=label, hex_color=hexcode, order=v_order)

            for i, (rating, comment) in enumerate(data["reviews"]):
                reviewer = reviewers[i % len(reviewers)]
                Review.objects.get_or_create(
                    product=product, user=reviewer,
                    defaults={"rating": rating, "comment": comment},
                )

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {len(CATEGORIES)} categories and {len(PRODUCTS)} products. "
            f"Demo customer logins: sara.k / hamza.b / ayesha.n, password DemoPass123!"
        ))
