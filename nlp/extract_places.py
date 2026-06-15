"""
Extract specific POI place names from cleaned RedNote posts.

Priority: RedNote pin/address patterns > English venue names > spaCy FAC/ORG only.
Does NOT use spaCy GPE/LOC (cities/countries are too broad for Explore cards).

Reads:  server/data/merged-data.json
Writes: server/data/places.json
        server/data/places-extract-stats.json
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

import spacy

ROOT = Path(__file__).resolve().parent.parent
MERGED_DATA = ROOT / "server" / "data" / "merged-data.json"
PLACES_OUT = ROOT / "server" / "data" / "places.json"
STATS_OUT = ROOT / "server" / "data" / "places-extract-stats.json"

# --- blocklists: too broad or not a visitable POI ---

BROAD_GEO = {
    # Countries & regions
    "马来西亚", "大马", "马来", "南洋", "东南亚", "亚洲", "欧洲", "美洲",
    "中国", "日本", "韩国", "印度", "泰国", "越南", "印尼", "新加坡",
    "英国", "荷兰", "法国", "德国", "美国", "澳洲", "澳大利亚",
    "malaysia", "southeast asia", "asia", "europe",
    # States / cities (English)
    "kuala lumpur", "penang", "melaka", "malacca", "johor", "sabah", "sarawak",
    "pahang", "perak", "selangor", "kedah", "kelantan", "terengganu", "perlis",
    "negeri sembilan", "putrajaya", "labuan", "ipoh", "langkawi", "kota kinabalu",
    "malaysia", "cameron highlands",
    # States / cities (Chinese)
    "吉隆坡", "槟城", "槟城岛", "马六甲", "柔佛", "新山", "沙巴", "亚庇", "仙本那",
    "砂拉越", "古晋", "彭亨", "霹雳", "怡保", "雪兰莪", "吉兰丹", "登嘉楼",
    "玻璃市", "森美兰", "兰卡威", "金马伦", "云顶",
}

GENERIC_JUNK = {
    "旅游", "旅行", "自由行", "攻略", "打卡", "推荐", "美食", "餐厅", "酒店", "民宿",
    "周末", "假期", "小红书", "笔记", "分享", "日常", "vlog", "travel vlog",
    "巴刹", "市场", "夜市", "商场", "广场", "日落", "日出", "夜景", "风景",
    "欧式", "英式", "法式", "南洋", "紫红色", "粉色", "绿色", "蓝色",
    "马来西亚旅游", "吉隆坡旅游", "槟城自由行", "人就要去没有天花板的地方", "东北", "槟城vlog",
}

JUNK_PATTERN = re.compile(
    r"^(?:"
    r"人就要|我的|这个|那个|一个|这里|那里|"
    r"第[一二三四五六七八九十\d]+[天站]|"
    r"travel\s*vlog|vlog|"
    r"[\d#@]+|"
    r".{0,2}$"
    r")",
    re.I,
)

# Address line fragments — not visitable POI names (e.g. "Lot 9048" → "Lot").
ADDRESS_FRAGMENT = re.compile(
    r"^(?:"
    r"lot|no\.?|blk\.?|block|unit|level|floor|flr|"
    r"gate|gat|sek|spu|pula|tuah|hock|"
    r"\d+[a-z]?$"
    r")$",
    re.I,
)

SENTENCE_LIKE_PATTERN = re.compile(
    r"[，,。!！?？:：;；]|"
    r"(?:位于|路线|附近|生活|适合|推荐|攻略|终于|发现|我们|可以|一定要|超慢|"
    r"充满|打卡|一日游|三天两晚|两天一夜|vlog)",
    re.I,
)
BAD_SUBSTRINGS = (
    "路线", "建议", "记得", "我个人", "首先", "主打", "居然", "只需", "每次",
    "有没有", "不过", "虽然", "搭配", "点餐", "家庭式", "评价", "计划", "逃离",
    "开门", "价位", "拍摄", "第一天", "第二天", "第三天",
)
STATE_WORD_PATTERN = re.compile(
    r"(?:^|[\s在])(?:perak|penang|melaka|johor|sabah|sarawak|pahang|kuala\s*lumpur|"
    r"槟城|霹雳|马六甲|柔佛|沙巴|砂拉越|彭亨|吉隆坡)(?:$|[\s附近在])",
    re.I,
)

POI_HINT = re.compile(
    r"咖啡|cafe|café|restaurant|bistro|kitchen|bar|grill|"
    r"餐厅|饭店|食阁|档口|小吃|茶室|甜品|烘焙|"
    r"酒店|hotel|resort|hostel|homestay|farmstay|farm|"
    r" mosque|mosque|清真寺|教堂|寺庙|庙|"
    r"博物馆|museum|gallery|"
    r"公园|park|garden|海滩|beach|"
    r"街|路|lane|mall|tower|塔|坊|阁|楼|湾|岛|"
    r"庄园|榴莲|durian",
    re.I,
)

# RedNote / address patterns (highest precision)
PIN_RULE = re.compile(
    r"📍\s*([^\n#@]+?)(?=\s+\d{1,4}\s*[,，、]|\s+\d{1,4}\s+[A-Za-z]|\s*[,，。\n#]|$)",
)
PIN_SIMPLE = re.compile(r"📍\s*([^\n,，。#@]{2,35})")
LOCATED_RULE = re.compile(r"(?:位于|坐落于|地址[:：]?)\s*([^\n,，。]{2,40})")
JALAN_RULE = re.compile(
    r"([^\n,，。]{2,30}?)\s+(?:\d+[,\s-]*)?(?:Jalan|Jln\.?|Lorong|Persiaran|Psis\.?|Lebuh|Lot)\b",
    re.I,
)
ENGLISH_VENUE = re.compile(
    r"\b([A-Za-z][A-Za-z0-9'&\.\s\-]{2,45}(?:"
    r"Cafe|Coffee|Restaurant|Hotel|Resort|Farmstay|Farm|Bistro|Bar|Kitchen|Museum|Mosque|Gallery|Park"
    r"))\b",
    re.I,
)
HASHTAG_PLACE = re.compile(r"#([^\s#]{2,20}(?:咖啡|餐厅|酒店|街|坊|公园|博物馆|巴刹|市场))")

NER_LABELS = {"FAC", "ORG"}  # landmarks & businesses only — no GPE/LOC

SOURCE_PRIORITY = {"pin": 0, "address": 1, "jalan": 2, "venue": 3, "hashtag": 4, "spacy": 5}

# Direction / waypoint names (lobby, entrance) — not standalone destinations.
ROUTE_LANDMARK = re.compile(
    r"(?:^路线|^route\b|\b(?:lobby|entrance|大堂|入口|扶梯|escalator|"
    r"parking(?:\s*lot)?|car\s*park|bus\s*stop|train\s*station|"
    r"airport|mrt|lrt)\b)",
    re.I,
)

# Keep extraction focused on Malaysia travel posts.
MALAYSIA_HINT_PATTERN = re.compile(
    r"malaysia|kuala\s*lumpur|penang|melaka|malacca|johor|sabah|sarawak|"
    r"pahang|perak|selangor|kedah|kelantan|terengganu|perlis|"
    r"negeri\s*sembilan|putrajaya|labuan|langkawi|ipoh|genting|kundasang|"
    r"吉隆坡|槟城|马六甲|柔佛|沙巴|砂拉越|彭亨|霹雳|雪兰莪|吉打|吉兰丹|登嘉楼|"
    r"玻璃市|森美兰|兰卡威|怡保|云顶|金马伦|马来西亚",
    re.I,
)
OUTSIDE_GEO_PATTERN = re.compile(
    r"东北|哈尔滨|吉林|长白山|延吉|长春|松花湖|天池|伪满|"
    r"北京|上海|广州|深圳|重庆|杭州|成都|西安|武汉|南京|苏州|"
    r"中国|china|japan|korea|thailand|vietnam|indonesia|singapore|europe",
    re.I,
)


def normalize_key(name: str) -> str:
    return re.sub(r"\s+", " ", name.strip().lower())


def is_address_fragment(name: str) -> bool:
    key = normalize_key(name)
    if ADDRESS_FRAGMENT.match(key):
        return True
    # "Lot 9048" style — number-only tail with short prefix
    if re.fullmatch(r"lot\s*\d+", key):
        return True
    return False


def sanitize_text(text: str) -> str:
    if not text:
        return ""
    cleaned = "".join(ch for ch in text if not (0xD800 <= ord(ch) <= 0xDFFF))
    return cleaned.encode("utf-8", errors="ignore").decode("utf-8", errors="ignore")


def is_malaysia_post(post: dict) -> bool:
    state = sanitize_text(str(post.get("state") or "")).strip()
    if state and state != "Malaysia":
        return True

    text = sanitize_text(
        " ".join(
            [
                str(post.get("sourceKeyword") or ""),
                str(post.get("location") or ""),
                str(post.get("title") or ""),
                str(post.get("description") or ""),
            ]
        )
    )
    if not text:
        return False

    has_malaysia_hint = bool(MALAYSIA_HINT_PATTERN.search(text))
    outside_hits = OUTSIDE_GEO_PATTERN.findall(text)

    # Strong outside signal with no Malaysia hint -> skip post
    if outside_hits and not has_malaysia_hint:
        return False
    # Multiple outside mentions almost always indicate non-Malaysia itinerary
    if len(outside_hits) >= 2:
        return False

    return has_malaysia_hint or state == "Malaysia"


def clean_name(raw: str) -> str | None:
    name = raw.strip()
    name = re.sub(r"^[📍🏠🌴✨🔥]+\s*", "", name)
    name = re.sub(r"\s+", " ", name)
    name = name.strip(" ,，。!！?？~～·|｜/\\-")
    if not name or len(name) > 45:
        return None
    if re.fullmatch(r"[\W\d_]+", name):
        return None
    return name


def is_blocked(name: str) -> bool:
    key = normalize_key(name)
    if is_address_fragment(name):
        return True
    if key in {normalize_key(x) for x in BROAD_GEO}:
        return True
    if key in {normalize_key(x) for x in GENERIC_JUNK}:
        return True
    if JUNK_PATTERN.match(name):
        return True
    # Pure style/color words
    if re.fullmatch(r"[\u4e00-\u9fff]{2}(?:式|风|色)", name):
        return True
    return False


def is_valid_place(name: str, source: str) -> bool:
    cleaned = clean_name(name)
    if not cleaned:
        return False
    if is_blocked(cleaned):
        return False

    if source in ("pin", "address", "jalan"):
        if SENTENCE_LIKE_PATTERN.search(cleaned):
            return False
        if source in ("address", "jalan") and len(cleaned) < 10 and not POI_HINT.search(cleaned):
            return False
        return len(cleaned) >= 3

    if source == "venue":
        if "vlog" in cleaned.lower():
            return False
        return len(cleaned) >= 4

    if source == "hashtag":
        if "vlog" in cleaned.lower():
            return False
        return len(cleaned) >= 3 and POI_HINT.search(cleaned)

    if source == "spacy":
        if SENTENCE_LIKE_PATTERN.search(cleaned):
            return False
        if len(cleaned) < 3:
            return False
        if POI_HINT.search(cleaned):
            return True
        # Longer unique names from FAC/ORG
        if len(cleaned) >= 5 and not re.fullmatch(r"[\u4e00-\u9fff]{2,4}", cleaned):
            return True
        return len(cleaned) >= 6

    return False


def finalize_display_name(raw: str) -> str | None:
    name = raw.strip()
    if "📍" in name:
        name = name.split("📍")[-1].strip()
    name = re.sub(r"[\U00010000-\U0010ffff]", "", name)  # emoji
    name = re.sub(r"\s+", " ", name).strip()
    name = re.sub(r"\s+\d{1,4}$", "", name)
    name = re.sub(r"^(?:位于|路线|地址|附近)\s*", "", name)
    # Keep only the first segment before punctuation/arrows.
    name = re.split(r"[，,。!！?？:：;；|｜]|⬆️|⬅️|➡️|->|→", name)[0].strip()
    name = name.strip(" ,，。!！?？~～·|｜/\\-")
    # Drop leading state labels like "Perak 在Pangkor..."
    name = re.sub(
        r"^(?:Perak|Penang|Melaka|Johor|Sabah|Sarawak|Pahang|Kuala\s*Lumpur|"
        r"槟城|霹雳|马六甲|柔佛|沙巴|砂拉越|彭亨|吉隆坡)\s+[在于靠近附近].*",
        "",
        name,
        flags=re.I,
    )
    if STATE_WORD_PATTERN.search(name) and len(name) > 18:
        return None
    if SENTENCE_LIKE_PATTERN.search(name) and len(name) > 12:
        return None
    if any(token in name for token in BAD_SUBSTRINGS):
        return None
    if "vlog" in name.lower():
        return None
    if len(name.split()) > 7:
        return None
    return clean_name(name)


def is_route_landmark(name: str) -> bool:
    key = normalize_key(name)
    if key.startswith("路线") or key.startswith("route "):
        return True
    if len(key.split()) <= 5 and ROUTE_LANDMARK.search(name):
        return True
    return False


def add_candidate(found: dict[str, tuple[str, str]], name: str, source: str) -> None:
    cleaned = finalize_display_name(name)
    if not cleaned or not is_valid_place(cleaned, source) or is_route_landmark(cleaned):
        return
    key = normalize_key(cleaned)
    if key not in found or SOURCE_PRIORITY[source] < SOURCE_PRIORITY[found[key][1]]:
        found[key] = (cleaned, source)


def collapse_extractions_in_post(extractions: list[tuple[str, str]]) -> list[tuple[str, str]]:
    """Within one post: drop route waypoints and merge substring name variants."""
    items: list[tuple[str, str, str]] = []
    for name, source in extractions:
        final = finalize_display_name(name)
        if not final or not is_valid_place(final, source):
            continue
        items.append((final, source, normalize_key(final)))

    if not items:
        return []

    non_route = [(n, s, k) for n, s, k in items if not is_route_landmark(n)]
    if non_route:
        items = non_route

    keys = [k for _, _, k in items]
    drop_keys: set[str] = set()
    for ka in keys:
        for kb in keys:
            if ka != kb and ka in kb and len(ka) >= 10:
                drop_keys.add(ka)

    result: list[tuple[str, str]] = []
    seen: set[str] = set()
    for name, source, key in sorted(items, key=lambda x: (-len(x[0]), SOURCE_PRIORITY.get(x[1], 9))):
        if key in drop_keys or key in seen:
            continue
        seen.add(key)
        result.append((name, source))
    return result


def pick_display_name(names: list[str], sources: set[str]) -> str:
    """Prefer real venue names over address fragments or caption titles."""
    candidates = [n for n in names if not is_address_fragment(n)]
    if not candidates:
        candidates = list(names)

    def score(name: str) -> tuple:
        penalty = 0
        has_cjk = bool(re.search(r"[\u4e00-\u9fff]", name))
        if is_address_fragment(name):
            penalty += 200
        if SENTENCE_LIKE_PATTERN.search(name):
            penalty += 100
        if has_cjk and re.search(
            r"(?:Farmstay|Hotel|Resort|Cafe|Restaurant|Lobby|Gaming|Camping)", name, re.I
        ):
            penalty += 80
        if len(name) > 42:
            penalty += 40
        if len(name) < 6:
            penalty += 60
        if "pin" in sources:
            penalty -= 15
        if POI_HINT.search(name):
            penalty -= 25
        # Prefer fuller English venue names; shorter wins for mixed caption titles.
        length_key = -len(name) if not has_cjk else len(name)
        return (penalty, length_key)

    return min(candidates, key=score)


def merge_bucket_fields(target: dict, source: dict) -> None:
    target.setdefault("_allNames", set()).add(target["name"])
    target["_allNames"].add(source["name"])
    for state, count in source["states"].items():
        target["states"][state] += count
    target["categories"].update(source["categories"])
    target["sources"].update(source["sources"])
    target["totalLikes"] += source["totalLikes"]
    target["totalCollected"] += source["totalCollected"]
    for post_id in source["postIds"]:
        if post_id not in target["postIds"]:
            target["postIds"].append(post_id)
    if source["bestLikes"] > target["bestLikes"]:
        target["bestLikes"] = source["bestLikes"]
        target["coverImage"] = source["coverImage"]
        target["description"] = source["description"]
    all_names = list(target["_allNames"])
    target["name"] = pick_display_name(all_names, target["sources"])


def merge_similar_buckets(buckets: dict[str, dict]) -> tuple[dict[str, dict], int]:
    """Merge places that are substring aliases or share posts with overlapping names."""
    keys = list(buckets.keys())
    parent = {k: k for k in keys}

    def find(k: str) -> str:
        while parent[k] != k:
            parent[k] = parent[parent[k]]
            k = parent[k]
        return k

    def union(a: str, b: str) -> None:
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[rb] = ra

    def names_overlap(ka: str, kb: str) -> bool:
        if ka in kb or kb in ka:
            return len(min(ka, kb, key=len)) >= 10
        words_a = set(ka.split())
        words_b = set(kb.split())
        shared = words_a & words_b
        return len(shared) >= 2 and len(shared) >= min(len(words_a), len(words_b)) - 1

    for i, ka in enumerate(keys):
        ba = buckets[ka]
        for kb in keys[i + 1 :]:
            bb = buckets[kb]
            if is_address_fragment(buckets[ka]["name"]) or is_address_fragment(buckets[kb]["name"]):
                continue
            if ka in kb or kb in ka:
                if len(min(ka, kb, key=len)) >= 10:
                    union(ka, kb)
                continue
            if set(ba["postIds"]) & set(bb["postIds"]) and names_overlap(ka, kb):
                union(ka, kb)

    groups: dict[str, list[str]] = defaultdict(list)
    for k in keys:
        groups[find(k)].append(k)

    merged: dict[str, dict] = {}
    merges = 0
    for group_keys in groups.values():
        if len(group_keys) > 1:
            merges += len(group_keys) - 1
        primary_key = max(group_keys, key=lambda k: (len(k), buckets[k]["totalLikes"]))
        combined = buckets[primary_key].copy()
        combined["states"] = defaultdict(int, dict(combined["states"]))
        combined["categories"] = set(combined["categories"])
        combined["sources"] = set(combined["sources"])
        combined["postIds"] = list(combined["postIds"])
        combined["_allNames"] = {combined["name"]}
        for other_key in group_keys:
            if other_key == primary_key:
                continue
            merge_bucket_fields(combined, buckets[other_key])
        combined.pop("_allNames", None)
        merged[primary_key] = combined

    return merged, merges


def extract_rule_based(text: str) -> dict[str, tuple[str, str]]:
    found: dict[str, tuple[str, str]] = {}

    for pattern in (PIN_RULE, PIN_SIMPLE):
        for match in pattern.finditer(text):
            add_candidate(found, match.group(1), "pin")

    for match in LOCATED_RULE.finditer(text):
        add_candidate(found, match.group(1), "address")

    for match in JALAN_RULE.finditer(text):
        add_candidate(found, match.group(1), "jalan")

    for match in ENGLISH_VENUE.finditer(text):
        add_candidate(found, match.group(1), "venue")

    for match in HASHTAG_PLACE.finditer(text):
        add_candidate(found, match.group(1), "hashtag")

    return found


def extract_spacy(nlp, text: str, found: dict[str, tuple[str, str]]) -> None:
    text = sanitize_text(text)
    if not text.strip():
        return
    try:
        doc = nlp(text[:5000])
    except (UnicodeError, ValueError):
        return
    for ent in doc.ents:
        if ent.label_ not in NER_LABELS:
            continue
        add_candidate(found, ent.text, "spacy")


def extract_places_from_post(nlp, post: dict, use_spacy: bool) -> list[tuple[str, str]]:
    title = sanitize_text(post.get("title") or "")
    desc = sanitize_text(post.get("description") or "")
    text = f"{title}\n{desc}"

    found = extract_rule_based(text)
    if use_spacy:
        extract_spacy(nlp, text, found)
    return collapse_extractions_in_post(list(found.values()))


def format_likes_label(score: int) -> str:
    if score >= 10000:
        wan = score / 10000
        label = f"{int(wan)}万+" if wan == int(wan) else f"{wan:.1f}万"
        return f"🔥 {label} likes"
    return f"🔥 {score} likes"


def format_place_id(index: int) -> str:
    return f"P{index:02d}" if index < 100 else f"P{index}"


STATE_FROM_TEXT = [
    (re.compile(r"槟城|penang", re.I), "Penang"),
    (re.compile(r"吉隆坡|kuala\s*lumpur|\bkl\b", re.I), "Kuala Lumpur"),
    (re.compile(r"马六甲|melaka|malacca", re.I), "Melaka"),
    (re.compile(r"砂拉越|sarawak|古晋|kuching", re.I), "Sarawak"),
    (
        re.compile(
            r"沙巴|sabah|亚庇|仙本那|kundasang|昆达山|kinabalu|神山|kota\s*kinabalu|\bkk\b",
            re.I,
        ),
        "Sabah",
    ),
    (re.compile(r"彭亨|pahang|金马伦|cameron|genting|云顶", re.I), "Pahang"),
    (re.compile(r"霹雳|perak|怡保|ipoh", re.I), "Perak"),
    (re.compile(r"柔佛|johor|新山", re.I), "Johor"),
    (re.compile(r"雪兰莪|selangor", re.I), "Selangor"),
]

KNOWN_PLACE_STATES = {
    normalize_key("Kundasang"): "Sabah",
    normalize_key("Hounon Ridge Farmstay"): "Sabah",
    normalize_key("Hounon Ridge Farmstay & Camping"): "Sabah",
    normalize_key("Konunukan Garden & Camping Ground"): "Sabah",
    normalize_key("Zing Sunset Bar"): "Sabah",
    normalize_key("pax -Zing Sunset Bar"): "Sabah",
}


def infer_state_from_text(*parts: str) -> str | None:
    text = " ".join(p for p in parts if p)
    for pattern, state in STATE_FROM_TEXT:
        if pattern.search(text):
            return state
    return None


def infer_post_state(post: dict) -> str:
    from_text = infer_state_from_text(
        post.get("sourceKeyword") or "",
        post.get("location") or "",
        post.get("title") or "",
        post.get("description") or "",
    )
    if from_text:
        return from_text
    state = str(post.get("state") or "Malaysia").strip()
    return state if state else "Malaysia"


def resolve_place_state(name: str, bucket_states: dict[str, int]) -> str:
    name_key = normalize_key(name)
    if name_key in KNOWN_PLACE_STATES:
        return KNOWN_PLACE_STATES[name_key]
    from_name = infer_state_from_text(name)
    if from_name:
        return from_name
    if bucket_states:
        return max(bucket_states.items(), key=lambda x: x[1])[0]
    return "Malaysia"


def build_places(posts: list[dict], nlp, use_spacy: bool) -> tuple[list[dict], dict]:
    buckets: dict[str, dict] = defaultdict(
        lambda: {
            "name": "",
            "states": defaultdict(int),
            "categories": set(),
            "totalLikes": 0,
            "totalCollected": 0,
            "postIds": [],
            "coverImage": None,
            "bestLikes": -1,
            "description": "",
            "sources": set(),
        }
    )

    posts_with_places = 0
    total_mentions = 0
    by_source: dict[str, int] = defaultdict(int)
    skipped_non_malaysia = 0

    for post in posts:
        if not is_malaysia_post(post):
            skipped_non_malaysia += 1
            continue
        extracted = extract_places_from_post(nlp, post, use_spacy)
        if not extracted:
            continue
        posts_with_places += 1
        likes = int(post.get("likesScore") or 0)
        collected = int(re.sub(r"\D", "", str(post.get("collected") or "0")) or 0)
        state = infer_post_state(post)
        categories = post.get("categories") or []
        image = post.get("image")
        snippet = (post.get("description") or post.get("title") or "")[:160]

        seen_in_post: set[str] = set()
        for name, source in extracted:
            final_name = finalize_display_name(name)
            if not final_name:
                continue
            key = normalize_key(final_name)
            if key in seen_in_post:
                continue
            seen_in_post.add(key)
            total_mentions += 1
            by_source[source] += 1

            bucket = buckets[key]
            bucket["name"] = final_name
            bucket["states"][state] += 1
            bucket["categories"].update(categories)
            bucket["sources"].add(source)
            bucket["totalLikes"] += likes
            bucket["totalCollected"] += collected
            if post.get("id") and post["id"] not in bucket["postIds"]:
                bucket["postIds"].append(post["id"])
            if likes > bucket["bestLikes"]:
                bucket["bestLikes"] = likes
                bucket["coverImage"] = image
                bucket["description"] = snippet

    buckets, merge_count = merge_similar_buckets(dict(buckets))

    ranked = sorted(
        buckets.values(),
        key=lambda p: (p["totalLikes"], len(p["postIds"])),
        reverse=True,
    )
    places: list[dict] = []

    for i, bucket in enumerate(ranked, start=1):
        if not bucket["coverImage"] or len(bucket["postIds"]) < 1:
            continue
        if is_address_fragment(bucket["name"]):
            continue
        if len(bucket["name"]) < 3:
            continue
        state = resolve_place_state(bucket["name"], dict(bucket["states"]))
        likes_score = bucket["totalLikes"]
        places.append(
            {
                "_id": format_place_id(i),
                "name": bucket["name"],
                "state": state,
                "categories": sorted(bucket["categories"]),
                "totalLikes": likes_score,
                "likesLabel": format_likes_label(likes_score),
                "totalCollected": bucket["totalCollected"],
                "postCount": len(bucket["postIds"]),
                "coverImage": bucket["coverImage"],
                "description": bucket["description"],
                "postIds": bucket["postIds"],
                "extractSources": sorted(bucket["sources"]),
            }
        )

    stats = {
        "postsProcessed": len(posts),
        "postsSkippedNonMalaysia": skipped_non_malaysia,
        "postsWithPlaces": posts_with_places,
        "placeMentions": total_mentions,
        "duplicateBucketsMerged": merge_count,
        "uniquePlaces": len(places),
        "mentionsBySource": dict(by_source),
    }
    return places, stats


DISPLAY_NAME_OVERRIDES = {
    normalize_key("Hounon Ridge Farmstay & Camping"): "Hounon Ridge Farmstay",
    normalize_key("pax -Zing Sunset Bar"): "Zing Sunset Bar",
}


# Manually curated cover images (survive re-extraction).
CURATED_COVERS = {
    normalize_key("半山芭巴刹"): "/places/P01.png",
    normalize_key("Hounon Ridge Farmstay"): "/places/Hounon Ridge Farmstay Sabah.jpg",
    normalize_key("Hounon Ridge Farmstay & Camping"): "/places/Hounon Ridge Farmstay Sabah.jpg",
    normalize_key("Kundasang"): "/places/Kudasang.jpg",
}


def apply_display_overrides(places: list[dict]) -> None:
    for place in places:
        override = DISPLAY_NAME_OVERRIDES.get(normalize_key(place["name"]))
        if override:
            place["name"] = override


def load_preserved_covers() -> dict[str, str]:
    """Keep manually curated local cover images across re-extraction."""
    covers = dict(CURATED_COVERS)
    if not PLACES_OUT.exists():
        return covers
    try:
        existing = json.loads(PLACES_OUT.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return covers
    for place in existing:
        cover = place.get("coverImage") or ""
        if not cover.startswith("/places/"):
            continue
        name_key = normalize_key(place.get("name", ""))
        if name_key and name_key not in covers:
            covers[name_key] = cover
    return covers


GOOGLE_PRESERVE_FIELDS = (
    "googlePlaceId",
    "googleRating",
    "googleReviewCount",
    "openingHours",
    "googleMapsUri",
    "googleDescription",
    "googleEnrichedAt",
)


def load_preserved_google() -> dict[str, dict]:
    if not PLACES_OUT.exists():
        return {}
    try:
        existing = json.loads(PLACES_OUT.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return {}
    preserved: dict[str, dict] = {}
    for place in existing:
        if not place.get("googleEnrichedAt"):
            continue
        name_key = normalize_key(place.get("name", ""))
        if not name_key:
            continue
        preserved[name_key] = {k: place[k] for k in GOOGLE_PRESERVE_FIELDS if k in place}
    return preserved


def apply_preserved_google(places: list[dict], preserved: dict[str, dict]) -> None:
    for place in places:
        name_key = normalize_key(place["name"])
        extra = preserved.get(name_key)
        if extra:
            place.update(extra)


def apply_preserved_covers(places: list[dict], covers: dict[str, str]) -> None:
    for place in places:
        name_key = normalize_key(place["name"])
        local = covers.get(name_key)
        if not local and "hounon ridge" in name_key:
            local = covers.get("hounon ridge farmstay & camping") or covers.get("hounon ridge farmstay")
        if local:
            place["coverImage"] = local


def main() -> int:
    parser = argparse.ArgumentParser(description="Extract specific places from merged RedNote posts")
    parser.add_argument("--limit", type=int, default=0, help="Process only first N posts (0 = all)")
    parser.add_argument("--model", default="zh_core_web_sm", help="spaCy Chinese model")
    parser.add_argument(
        "--use-spacy",
        action="store_true",
        help="Enable spaCy FAC/ORG extraction (off by default for higher precision)",
    )
    args = parser.parse_args()

    if not MERGED_DATA.exists():
        print(f"Missing {MERGED_DATA}. Run: cd server && npm run import:trending", file=sys.stderr)
        return 1

    print(f"Loading spaCy model: {args.model}")
    try:
        nlp = spacy.load(args.model)
    except OSError:
        print(
            f"Model '{args.model}' not found. Run:\n"
            f"  python -m spacy download {args.model}",
            file=sys.stderr,
        )
        return 1

    posts = json.loads(MERGED_DATA.read_text(encoding="utf-8"))
    if args.limit > 0:
        posts = posts[: args.limit]
        print(f"Processing first {len(posts)} posts (--limit)")

    print(f"Extracting specific places from {len(posts)} posts...")
    preserved_covers = load_preserved_covers()
    preserved_google = load_preserved_google()
    places, stats = build_places(posts, nlp, args.use_spacy)
    apply_display_overrides(places)
    apply_preserved_covers(places, preserved_covers)
    apply_preserved_google(places, preserved_google)

    PLACES_OUT.write_text(json.dumps(places, ensure_ascii=False, indent=2), encoding="utf-8")
    STATS_OUT.write_text(json.dumps(stats, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Wrote {len(places)} places -> {PLACES_OUT}")
    print(f"Stats: {stats['postsWithPlaces']}/{stats['postsProcessed']} posts had places")
    if stats.get("duplicateBucketsMerged"):
        print(f"Merged {stats['duplicateBucketsMerged']} duplicate place buckets")
    print(f"Sources: {stats.get('mentionsBySource', {})}")
    print("Top 5 by likes:")
    for place in places[:5]:
        line = f"  {place['_id']} {place['name']} ({place['state']}) - {place['totalLikes']} likes, {place['postCount']} posts"
        print(line.encode("ascii", errors="replace").decode("ascii"))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
