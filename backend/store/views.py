import uuid

from django.db.models import Avg, Q
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Category, Product, ProductOptionValue, Review, WishlistItem,
    Cart, CartItem, Order, OrderItem,
)
from .notifications import send_order_emails, send_whatsapp_alert
from .serializers import (
    CategorySerializer, ProductListSerializer, ProductDetailSerializer,
    ReviewSerializer, WishlistItemSerializer, CartSerializer, CartItemSerializer,
    OrderSerializer, CheckoutSerializer, RegisterSerializer, UserSerializer,
)


def get_or_create_cart(request):
    """Resolve the cart for a logged-in user (by account) or a guest (by token header)."""
    if request.user and request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return cart
    token = request.headers.get("X-Guest-Token") or request.query_params.get("guest_token")
    if not token:
        token = str(uuid.uuid4())
    cart, _ = Cart.objects.get_or_create(guest_token=token, user=None)
    return cart


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    lookup_field = "slug"


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_active=True).select_related("category").prefetch_related(
        "images", "options__values", "reviews__user",
    )
    lookup_field = "slug"

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProductDetailSerializer
        return ProductListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params

        category = params.get("category")
        if category:
            qs = qs.filter(category__slug=category)

        search = params.get("search")
        if search:
            qs = qs.filter(
                Q(name__icontains=search) | Q(description__icontains=search) | Q(short_description__icontains=search)
            )

        featured = params.get("featured")
        if featured is not None:
            qs = qs.filter(is_featured=featured.lower() in ("1", "true", "yes"))

        ordering = params.get("ordering")
        if ordering in ("price", "-price", "-created_at", "created_at", "name", "-name"):
            qs = qs.order_by(ordering)
        elif ordering == "rating":
            qs = qs.annotate(avg_rating=Avg("reviews__rating")).order_by("-avg_rating")

        return qs.distinct()

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def reviews(self, request, slug=None):
        product = self.get_object()
        serializer = ReviewSerializer(data=request.data, context={"request": request, "product": product})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CartView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        cart = get_or_create_cart(request)
        return Response(CartSerializer(cart, context={"request": request}).data)


class CartItemListCreateView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        cart = get_or_create_cart(request)
        serializer = CartItemSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        product = serializer.validated_data["product"]
        option_values = serializer.validated_data.get("selected_options", [])
        quantity = serializer.validated_data.get("quantity", 1)

        existing = None
        for item in cart.items.filter(product=product):
            if set(item.selected_options.values_list("id", flat=True)) == {ov.id for ov in option_values}:
                existing = item
                break

        if existing:
            existing.quantity += quantity
            existing.save()
            item = existing
        else:
            item = CartItem.objects.create(cart=cart, product=product, quantity=quantity)
            item.selected_options.set(option_values)

        return Response(CartSerializer(cart, context={"request": request}).data, status=status.HTTP_201_CREATED)


class CartItemDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def patch(self, request, pk):
        cart = get_or_create_cart(request)
        try:
            item = cart.items.get(pk=pk)
        except CartItem.DoesNotExist:
            return Response({"detail": "Item not found in your cart."}, status=status.HTTP_404_NOT_FOUND)
        quantity = request.data.get("quantity")
        if quantity is not None:
            item.quantity = max(1, int(quantity))
            item.save()
        return Response(CartSerializer(cart, context={"request": request}).data)

    def delete(self, request, pk):
        cart = get_or_create_cart(request)
        cart.items.filter(pk=pk).delete()
        return Response(CartSerializer(cart, context={"request": request}).data)


class CartMergeView(APIView):
    """Folds a guest cart into the now-authenticated user's cart after login."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        guest_token = request.data.get("guest_token") or request.headers.get("X-Guest-Token")
        user_cart, _ = Cart.objects.get_or_create(user=request.user)

        if guest_token:
            guest_cart = Cart.objects.filter(guest_token=guest_token, user=None).first()
            if guest_cart:
                for item in list(guest_cart.items.all()):
                    option_ids = set(item.selected_options.values_list("id", flat=True))
                    match = None
                    for existing in user_cart.items.filter(product=item.product):
                        if set(existing.selected_options.values_list("id", flat=True)) == option_ids:
                            match = existing
                            break
                    if match:
                        match.quantity += item.quantity
                        match.save()
                        item.delete()
                    else:
                        item.cart = user_cart
                        item.save()
                guest_cart.delete()

        return Response(CartSerializer(user_cart, context={"request": request}).data)


class CartMergeView(APIView):
    """Fold a guest cart into the now-authenticated user's cart after login/register."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user_cart, _ = Cart.objects.get_or_create(user=request.user)
        token = request.headers.get("X-Guest-Token") or request.data.get("guest_token")
        guest_cart = Cart.objects.filter(guest_token=token, user=None).first() if token else None

        if guest_cart:
            for item in guest_cart.items.select_related("product").prefetch_related("selected_options"):
                option_ids = set(item.selected_options.values_list("id", flat=True))
                match = None
                for existing in user_cart.items.filter(product=item.product):
                    if set(existing.selected_options.values_list("id", flat=True)) == option_ids:
                        match = existing
                        break
                if match:
                    match.quantity += item.quantity
                    match.save()
                else:
                    new_item = CartItem.objects.create(cart=user_cart, product=item.product, quantity=item.quantity)
                    new_item.selected_options.set(item.selected_options.all())
            guest_cart.delete()

        return Response(CartSerializer(user_cart, context={"request": request}).data)


class WishlistView(generics.ListAPIView):
    serializer_class = WishlistItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WishlistItem.objects.filter(user=self.request.user).select_related("product")


class WishlistToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        product_id = request.data.get("product_id")
        if not product_id:
            return Response({"detail": "product_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        existing = WishlistItem.objects.filter(user=request.user, product_id=product_id).first()
        if existing:
            existing.delete()
            return Response({"wishlisted": False})
        WishlistItem.objects.create(user=request.user, product_id=product_id)
        return Response({"wishlisted": True})


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related("items")

    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def checkout(self, request):
        cart = get_or_create_cart(request)
        if not cart.items.exists():
            return Response({"detail": "Your cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        details = CheckoutSerializer(data=request.data)
        details.is_valid(raise_exception=True)
        data = details.validated_data

        subtotal = cart.subtotal
        shipping_fee = 0 if subtotal >= 5000 or subtotal == 0 else 250
        order = Order.objects.create(
            user=request.user, subtotal=subtotal, shipping_fee=shipping_fee,
            total=subtotal + shipping_fee, **data,
        )
        for item in cart.items.select_related("product").prefetch_related("selected_options"):
            options_summary = ", ".join(
                f"{ov.option.name}: {ov.label}" for ov in item.selected_options.all()
            )
            OrderItem.objects.create(
                order=order, product=item.product, product_name=item.product.name,
                options_summary=options_summary, unit_price=item.unit_price, quantity=item.quantity,
            )
            item.product.stock = max(0, item.product.stock - item.quantity)
            item.product.save(update_fields=["stock"])
        cart.items.all().delete()

        send_order_emails(order)
        send_whatsapp_alert(order)

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)
