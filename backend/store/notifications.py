import logging

import requests
from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def _order_lines(order):
    lines = [f"- {item.product_name} x{item.quantity} ({item.options_summary or 'no options'}) — Rs {item.line_total:,.0f}"
             for item in order.items.all()]
    return "\n".join(lines)


def send_order_emails(order):
    """Emails the customer a confirmation and the store owner a new-order alert.
    Failures are logged, never raised — a broken inbox should never break checkout."""
    lines = _order_lines(order)

    customer_body = (
        f"Hi {order.full_name},\n\n"
        f"Thanks for your order #{order.id} — here's what we've got:\n\n"
        f"{lines}\n\n"
        f"Subtotal: Rs {order.subtotal:,.0f}\n"
        f"Shipping: Rs {order.shipping_fee:,.0f}\n"
        f"Total: Rs {order.total:,.0f}\n\n"
        f"Shipping to: {order.address_line}, {order.city}, {order.country}\n"
        f"Payment method: {order.payment_method}\n\n"
        f"We'll be in touch as your order ships."
    )

    address_parts = [order.address_line, order.city, order.state, order.postal_code, order.country]
    address_line = ", ".join(p for p in address_parts if p)

    admin_body = (
        f"New order #{order.id} — Rs {order.total:,.0f}\n\n"
        f"Customer: {order.full_name} ({order.email}, {order.phone})\n"
        f"Address: {address_line}\n"
        f"Payment: {order.payment_method}\n\n"
        f"Items:\n{lines}\n\n"
        f"View in admin: /admin/store/order/{order.id}/change/"
    )

    try:
        send_mail(
            subject=f"Your order #{order.id} is confirmed",
            message=customer_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[order.email],
            fail_silently=False,
        )
        print(f"[email] Sent order confirmation to {order.email} for order #{order.id}")
    except Exception as e:
        print(f"\n{'=' * 70}\n[EMAIL FAILED] Could not email the customer for order #{order.id}\nReason: {e!r}\n{'=' * 70}\n")
        logger.exception("Failed to send order-confirmation email for order #%s", order.id)

    try:
        send_mail(
            subject=f"New order #{order.id} — Rs {order.total:,.0f}",
            message=admin_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_EMAIL],
            fail_silently=False,
        )
        print(f"[email] Sent new-order alert to {settings.ADMIN_EMAIL} for order #{order.id}")
    except Exception as e:
        print(f"\n{'=' * 70}\n[EMAIL FAILED] Could not email the admin for order #{order.id}\nReason: {e!r}\n{'=' * 70}\n")
        logger.exception("Failed to send new-order alert email for order #%s", order.id)


def send_whatsapp_alert(order):
    """Optional: pings the store owner's WhatsApp via CallMeBot (free, personal-use API).
    No-ops quietly if CALLMEBOT_APIKEY isn't configured."""
    if not settings.CALLMEBOT_APIKEY:
        return
    text = f"New order #{order.id} from {order.full_name} — Rs {order.total:,.0f}"
    try:
        requests.get(
            "https://api.callmebot.com/whatsapp.php",
            params={"phone": settings.CALLMEBOT_PHONE, "text": text, "apikey": settings.CALLMEBOT_APIKEY},
            timeout=5,
        )
    except Exception:
        logger.exception("Failed to send WhatsApp alert for order #%s", order.id)
