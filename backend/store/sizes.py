"""Free-form size parsing for the admin 'Sizes' box.

The client can type anything:
    S, M, L, XL                -> four sizes
    38, 39, 40                 -> shoe sizes
    0-50                       -> 0,1,2 ... 50          (whole-number steps)
    6-12:0.5                   -> 6, 6.5, 7 ... 12      (custom step)
    38-46, 47.5, Free Size     -> mix of everything
Separators: comma, semicolon or new line. Order typed = order shown in the shop.
"""
import re
from decimal import Decimal, InvalidOperation

MAX_SIZES = 1000  # safety net against typos like 0-99999999

_RANGE = re.compile(r"^(\d+(?:\.\d+)?)\s*(?:-|–|—|to)\s*(\d+(?:\.\d+)?)(?:\s*[:/]\s*(\d+(?:\.\d+)?))?$", re.I)


def _fmt(d: Decimal) -> str:
    text = format(d.normalize(), "f")
    return text.rstrip("0").rstrip(".") if "." in text else text


def parse_sizes(raw: str) -> list[str]:
    """Return an ordered, de-duplicated list of size labels. Raises ValueError on bad input."""
    out, seen = [], set()

    def add(label: str):
        key = label.lower()
        if key not in seen:
            seen.add(key)
            out.append(label)
            if len(out) > MAX_SIZES:
                raise ValueError(f"Too many sizes (max {MAX_SIZES}).")

    for token in re.split(r"[,;\n]+", raw or ""):
        token = token.strip()
        if not token:
            continue
        match = _RANGE.match(token)
        if match:
            try:
                start, end = Decimal(match.group(1)), Decimal(match.group(2))
                step = Decimal(match.group(3)) if match.group(3) else Decimal(1)
            except InvalidOperation:
                raise ValueError(f"Could not read the range “{token}”.")
            if step <= 0:
                raise ValueError(f"Step must be greater than 0 in “{token}”.")
            if end < start:
                raise ValueError(f"Range “{token}” must go from small to large.")
            if (end - start) / step > MAX_SIZES:
                raise ValueError(f"Range “{token}” creates too many sizes (max {MAX_SIZES}).")
            current = start
            while current <= end:
                add(_fmt(current))
                current += step
        else:
            if len(token) > 60:
                raise ValueError(f"Size “{token[:20]}…” is too long (max 60 characters).")
            add(token)
    return out
