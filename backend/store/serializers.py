from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import (
    Category, Product, ProductImage, ProductOption, ProductOptionValue,
    Review, WishlistItem, Cart, CartItem, Order, OrderItem,
)

User = get_user_model()


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(source="products.count", read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description", "image", "product_count"]


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image", "alt_text", "order"]


class ProductOptionValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductOptionValue
        fields = ["id", "label", "hex_color", "swatch_image", "order"]


class ProductOptionSerializer(serializers.ModelSerializer):
    values = ProductOptionValueSerializer(many=True, read_only=True)

    class Meta:
        model = ProductOption
        fields = ["id", "name", "order", "values"]


class ReviewSerializer(serializers.ModelSerializer):
    user_display = serializers.CharField(source="user.first_name", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Review
        fields = ["id", "product", "user_display", "username", "rating", "title", "comment", "created_at"]
        read_only_fields = ["id", "product", "user_display", "username", "created_at"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        validated_data["product"] = self.context["product"]
        return super().create(validated_data)


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_slug = serializers.CharField(source="category.slug", read_only=True)
    primary_image = serializers.SerializerMethodField()
    discount_percent = serializers.ReadOnlyField()
    average_rating = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()
    in_stock = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            "id", "name", "slug", "short_description", "price", "compare_at_price",
            "discount_percent", "category_name", "category_slug", "primary_image",
            "average_rating", "review_count", "is_featured", "in_stock",
        ]

    def get_primary_image(self, obj):
        first = obj.images.first()
        if not first:
            return None
        request = self.context.get("request")
        url = first.image.url
        return request.build_absolute_uri(url) if request else url


class ProductDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_slug = serializers.CharField(source="category.slug", read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    options = ProductOptionSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    discount_percent = serializers.ReadOnlyField()
    average_rating = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()
    in_stock = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            "id", "name", "slug", "short_description", "description", "specifications",
            "price", "compare_at_price", "discount_percent", "sku", "stock", "in_stock",
            "category_name", "category_slug", "images", "options", "reviews",
            "average_rating", "review_count", "is_featured",
        ]


class ProductLiteSerializer(serializers.ModelSerializer):
    """Light product representation nested inside cart/wishlist/order items —
    still complete enough to render with the same ProductCard used everywhere else."""
    primary_image = serializers.SerializerMethodField()
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_slug = serializers.CharField(source="category.slug", read_only=True)
    discount_percent = serializers.ReadOnlyField()
    average_rating = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()
    in_stock = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            "id", "name", "slug", "price", "compare_at_price", "primary_image", "stock",
            "category_name", "category_slug", "discount_percent", "average_rating",
            "review_count", "in_stock", "is_featured",
        ]

    def get_primary_image(self, obj):
        first = obj.images.first()
        if not first:
            return None
        request = self.context.get("request")
        url = first.image.url
        return request.build_absolute_uri(url) if request else url


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductLiteSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source="product", write_only=True,
    )
    selected_options = ProductOptionValueSerializer(many=True, read_only=True)
    option_value_ids = serializers.PrimaryKeyRelatedField(
        queryset=ProductOptionValue.objects.all(), source="selected_options",
        many=True, write_only=True, required=False,
    )
    unit_price = serializers.ReadOnlyField()
    line_total = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = [
            "id", "product", "product_id", "selected_options", "option_value_ids",
            "quantity", "unit_price", "line_total",
        ]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.ReadOnlyField()
    total_items = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ["id", "items", "subtotal", "total_items"]


class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductLiteSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source="product", write_only=True,
    )

    class Meta:
        model = WishlistItem
        fields = ["id", "product", "product_id", "created_at"]


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_name", "options_summary", "unit_price", "quantity", "line_total"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "status", "tracking_id", "full_name", "email", "phone", "address_line", "city",
            "state", "postal_code", "country", "payment_method", "is_paid",
            "subtotal", "shipping_fee", "total", "notes", "items", "created_at",
        ]
        read_only_fields = ["id", "status", "tracking_id", "is_paid", "subtotal", "shipping_fee", "total", "items", "created_at"]


class CheckoutSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=30, required=False, allow_blank=True)
    address_line = serializers.CharField(max_length=255)
    city = serializers.CharField(max_length=100)
    state = serializers.CharField(max_length=100, required=False, allow_blank=True)
    postal_code = serializers.CharField(max_length=20, required=False, allow_blank=True)
    country = serializers.CharField(max_length=100)
    payment_method = serializers.ChoiceField(
        choices=["cash_on_delivery", "card"], default="cash_on_delivery",
    )
    notes = serializers.CharField(required=False, allow_blank=True)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "password"]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]
