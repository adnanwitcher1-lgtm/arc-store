"""Meta (Facebook) Conversions API — server-side Purchase event.

The browser Pixel already fires `Purchase` with eventID `order_<id>`; this sends the same event
from the server with the same event_id so Meta de-duplicates them. It keeps working when the
visitor has an ad-blocker or iOS tracking limits. Does nothing unless META_PIXEL_ID and
META_CAPI_ACCESS_TOKEN are set, and never raises (tracking must not break checkout).
"""
import hashlib
import logging
import re
import threading
import time

import requests
from django.conf import settings

logger = logging.getLogger(__name__)
GRAPH_VERSION = "v21.0"


def _hash(value):
    value = (value or "").strip().lower()
    return hashlib.sha256(value.encode()).hexdigest() if value else None


def _phone(raw):
    digits = re.sub(r"\D", "", raw or "")
    if digits.startswith("0"):  # Pakistan local format 03xx... -> 923xx...
        digits = "92" + digits[1:]
    return digits


def _client_ip(request):
    fwd = request.META.get("HTTP_X_FORWARDED_FOR", "")
    return fwd.split(",")[0].strip() if fwd else request.META.get("REMOTE_ADDR", "")


def _post(url, payload):
    try:
        resp = requests.post(url, json=payload, timeout=8)
        if resp.status_code >= 400:
            logger.warning("Meta CAPI error %s: %s", resp.status_code, resp.text[:300])
    except Exception:  # noqa: BLE001
        logger.exception("Meta CAPI request failed")


def send_purchase_event(order, request, tracking=None):
    pixel_id = getattr(settings, "META_PIXEL_ID", "")
    token = getattr(settings, "META_CAPI_ACCESS_TOKEN", "")
    if not pixel_id or not token:
        return
    tracking = tracking or {}
    try:
        first, _, last = (order.full_name or "").strip().partition(" ")
        user_data = {
            "em": [h for h in [_hash(order.email)] if h],
            "ph": [h for h in [_hash(_phone(order.phone))] if h],
            "fn": [h for h in [_hash(first)] if h],
            "ln": [h for h in [_hash(last)] if h],
            "ct": [h for h in [_hash(re.sub(r"\s+", "", order.city or ""))] if h],
            "country": [h for h in [_hash((order.country or "")[:2])] if h],
            "external_id": [_hash(str(order.user_id))],
            "client_ip_address": _client_ip(request),
            "client_user_agent": request.META.get("HTTP_USER_AGENT", ""),
        }
        if tracking.get("fbp"):
            user_data["fbp"] = tracking["fbp"]
        if tracking.get("fbc"):
            user_data["fbc"] = tracking["fbc"]
        user_data = {k: v for k, v in user_data.items() if v}

        items = list(order.items.all())
        event = {
            "event_name": "Purchase",
            "event_time": int(time.time()),
            "event_id": f"order_{order.id}",  # must match the browser Pixel eventID
            "action_source": "website",
            "event_source_url": tracking.get("event_source_url") or settings.FRONTEND_URL,
            "user_data": user_data,
            "custom_data": {
                "currency": "PKR",
                "value": float(order.total),
                "content_type": "product",
                "content_ids": [str(i.product_id) for i in items],
                "contents": [
                    {"id": str(i.product_id), "quantity": i.quantity, "item_price": float(i.unit_price)}
                    for i in items
                ],
                "num_items": sum(i.quantity for i in items),
            },
        }
        payload = {"data": [event], "access_token": token}
        if getattr(settings, "META_TEST_EVENT_CODE", ""):
            payload["test_event_code"] = settings.META_TEST_EVENT_CODE
        url = f"https://graph.facebook.com/{GRAPH_VERSION}/{pixel_id}/events"
        threading.Thread(target=_post, args=(url, payload), daemon=True).start()
    except Exception:  # noqa: BLE001
        logger.exception("Could not build Meta CAPI event")
