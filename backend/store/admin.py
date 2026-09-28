from django.contrib import admin
from django.utils.html import format_html

from .models import (
    Category, Product, ProductImage, ProductOption, ProductOptionValue,
    Review, WishlistItem, Cart, CartItem, Order, OrderItem, ContactMessage,
)


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ("preview", "image", "alt_text", "order")
    readonly_fields = ("preview",)

    def preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:48px;border-radius:6px;" />', obj.image.url)
        return "—"
    preview.short_description = ""


class ProductOptionValueInline(admin.TabularInline):
    """For colors fill 'hex_color' (e.g. #C0392B). Common color names (Red, Navy, Sage...) work even without it."""
    model = ProductOptionValue
    extra = 1
    fields = ("label", "hex_color", "swatch_image", "order")


class ProductOptionInline(admin.StackedInline):
    model = ProductOption
    extra = 0
    fields = ("name", "order")
    show_change_link = True


@admin.register(ProductOption)
class ProductOptionAdmin(admin.ModelAdmin):
    list_display = ("name", "product", "order", "value_count")
    list_filter = ("product__category",)
    search_fields = ("name", "product__name")
    inlines = [ProductOptionValueInline]

    def value_count(self, obj):
        return obj.values.count()
    value_count.short_description = "Values"


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "product_count", "is_active", "order")
    list_editable = ("is_active", "order")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}

    class Media:
        css = {"all": ("store/admin_mobile.css",)}

    def product_count(self, obj):
        return obj.products.count()
    product_count.short_description = "Products"



# ---------------------------------------------------------------------------
# Quick-add helpers: select products in the list -> Action dropdown -> Go.
# ---------------------------------------------------------------------------
CLOTHING_SIZES = ["S", "M", "L", "XL", "XXL"]
SHOE_SIZES = [str(n) for n in range(38, 47)]  # EU 38-46
BASIC_COLORS = [
    ("Black", "#1C1C1E"), ("White", "#F2F1EC"), ("Red", "#C0392B"), ("Blue", "#2F6FED"),
    ("Navy", "#26314F"), ("Green", "#2E7D50"), ("Grey", "#8E8E93"), ("Brown", "#6B4A34"),
]


def _add_option(product, name, values):
    """Create an option group (e.g. Size) with its values, unless the product already has one."""
    if product.options.filter(name__iexact=name).exists():
        return False
    option = ProductOption.objects.create(product=product, name=name, order=product.options.count())
    for i, value in enumerate(values):
        label, hex_color = value if isinstance(value, tuple) else (value, "")
        ProductOptionValue.objects.create(option=option, label=label, hex_color=hex_color, order=i)
    return True


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "thumbnail", "name", "category", "price", "compare_at_price",
        "discount_badge", "stock", "is_featured", "is_active", "rating_display",
    )
    list_display_links = ("thumbnail", "name")
    list_editable = ("is_featured", "is_active")
    list_filter = ("category", "is_active", "is_featured")
    search_fields = ("name", "sku", "description")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [ProductImageInline, ProductOptionInline]
    actions = ["add_clothing_sizes", "add_shoe_sizes", "add_basic_colors"]

    class Media:
        css = {"all": ("store/admin_mobile.css",)}

    fieldsets = (
        ("Basics", {"fields": ("category", "name", "slug", "sku", "is_active", "is_featured")}),
        ("Description", {"fields": ("short_description", "description", "specifications")}),
        ("Pricing & stock", {"fields": ("price", "compare_at_price", "stock")}),
    )

    @admin.action(description="Add sizes: S, M, L, XL, XXL")
    def add_clothing_sizes(self, request, queryset):
        added = sum(_add_option(p, "Size", CLOTHING_SIZES) for p in queryset)
        self.message_user(request, f"Size option added to {added} product(s) (products that already had one were skipped).")

    @admin.action(description="Add shoe sizes: 38 to 46")
    def add_shoe_sizes(self, request, queryset):
        added = sum(_add_option(p, "Size", SHOE_SIZES) for p in queryset)
        self.message_user(request, f"Shoe sizes added to {added} product(s) (products that already had one were skipped).")

    @admin.action(description="Add basic colors (Black, White, Red, Blue...)")
    def add_basic_colors(self, request, queryset):
        added = sum(_add_option(p, "Color", BASIC_COLORS) for p in queryset)
        self.message_user(request, f"Color option added to {added} product(s) (products that already had one were skipped).")

    def thumbnail(self, obj):
        first = obj.images.first()
        if first:
            return format_html('<img src="{}" style="height:42px;width:42px;object-fit:cover;border-radius:8px;" />', first.image.url)
        return "—"
    thumbnail.short_description = ""

    def discount_badge(self, obj):
        if obj.discount_percent:
            return format_html('<span style="background:#9C4A34;color:#fff;padding:2px 8px;border-radius:999px;font-size:11px;">-{}%</span>', obj.discount_percent)
        return "—"
    discount_badge.short_description = "Discount"

    def rating_display(self, obj):
        if obj.review_count:
            return format_html("★ {} ({})", obj.average_rating, obj.review_count)
        return "No reviews"
    rating_display.short_description = "Rating"


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("product", "user", "rating", "is_approved", "created_at")
    list_editable = ("is_approved",)
    list_filter = ("is_approved", "rating")
    search_fields = ("product__name", "user__username", "comment")


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "subject", "is_resolved", "created_at")
    list_editable = ("is_resolved",)
    list_filter = ("is_resolved",)
    search_fields = ("name", "email", "subject", "message")
    readonly_fields = ("name", "email", "phone", "subject", "message", "created_at")


@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ("user", "product", "created_at")
    search_fields = ("user__username", "product__name")


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ("line_total",)


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "total_items", "subtotal", "updated_at")
    inlines = [CartItemInline]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("line_total",)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "full_name", "status_badge", "total", "is_paid", "payment_method", "created_at")
    list_filter = ("status", "is_paid", "payment_method")
    search_fields = ("full_name", "email", "id")
    inlines = [OrderItemInline]
    date_hierarchy = "created_at"

    class Media:
        css = {"all": ("store/admin_mobile.css",)}

    fieldsets = (
        ("Customer", {"fields": ("user", "full_name", "email", "phone")}),
        ("Shipping address", {"fields": ("address_line", "city", "state", "postal_code", "country")}),
        ("Order", {"fields": ("status", "tracking_id", "payment_method", "is_paid", "subtotal", "shipping_fee", "total", "notes")}),
    )

    def status_badge(self, obj):
        colors = {
            "pending": "#B08A3E", "processing": "#1E4638", "shipped": "#1E4638",
            "delivered": "#1E4638", "cancelled": "#9C4A34",
        }
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 10px;border-radius:999px;font-size:11px;text-transform:capitalize;">{}</span>',
            colors.get(obj.status, "#8A8378"), obj.status,
        )
    status_badge.short_description = "Status"


admin.site.site_header = "JH Store Admin"
admin.site.site_title = "JH Store Admin"
admin.site.index_title = "Catalog & orders"
