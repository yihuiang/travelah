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


def add_candidate(found: dict[str, tuple[str, str]], name: str, source: str) -> None:
    cleaned = finalize_display_name(name)
    if not cleaned or not is_valid_place(cleaned, source):
        return
    key = normalize_key(cleaned)
    priority = {"pin": 0, "address": 1, "jalan": 2, "venue": 3, "hashtag": 4, "spacy": 5}
    if key not in found or priority[source] < priority[found[key][1]]:
        found[key] = (cleaned, source)


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
    return list(found.values())


def format_likes_label(score: int) -> str:
    if score >= 10000:
        wan = score / 10000
        label = f"{int(wan)}万+" if wan == int(wan) else f"{wan:.1f}万"
        return f"🔥 {label} likes"
    return f"🔥 {score} likes"


def format_place_id(index: int) -> str:
    return f"P{index:02d}" if index < 100 else f"P{index}"


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
        state = post.get("state") or "Malaysia"
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

    ranked = sorted(
        buckets.values(),
        key=lambda p: (p["totalLikes"], len(p["postIds"])),
        reverse=True,
    )
    places: list[dict] = []

    for i, bucket in enumerate(ranked, start=1):
        if not bucket["coverImage"] or len(bucket["postIds"]) < 1:
            continue
        if len(bucket["name"]) < 3:
            continue
        state = max(bucket["states"].items(), key=lambda x: x[1])[0] if bucket["states"] else "Malaysia"
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
        "uniquePlaces": len(places),
        "mentionsBySource": dict(by_source),
    }
    return places, stats


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
    places, stats = build_places(posts, nlp, args.use_spacy)

    PLACES_OUT.write_text(json.dumps(places, ensure_ascii=False, indent=2), encoding="utf-8")
    STATS_OUT.write_text(json.dumps(stats, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Wrote {len(places)} places -> {PLACES_OUT}")
    print(f"Stats: {stats['postsWithPlaces']}/{stats['postsProcessed']} posts had places")
    print(f"Sources: {stats.get('mentionsBySource', {})}")
    print("Top 5 by likes:")
    for place in places[:5]:
        line = f"  {place['_id']} {place['name']} ({place['state']}) - {place['totalLikes']} likes, {place['postCount']} posts"
        print(line.encode("ascii", errors="replace").decode("ascii"))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
