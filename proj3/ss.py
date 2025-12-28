"""문장 유사도 측정 (jhgan/ko-sbert-nli)"""
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

LABELS = [
    (0.9, "🟢 매우 유사", "거의 동일한 의미"),
    (0.7, "🟢 유사", "비슷한 의미"),
    (0.5, "🟡 보통", "약간의 관련성"),
    (0.3, "🟠 낮음", "관련성 적음"),
    (0.0, "🔴 매우 낮음", "거의 무관")
]

def get_label(score):
    for threshold, label, desc in LABELS:
        if score >= threshold:
            return label, desc
    return LABELS[-1][1:]

def show_result(s1, s2, score):
    label, desc = get_label(score)
    bar = "█" * int(score * 20) + "░" * (20 - int(score * 20))
    print(f"\n{'='*40}\n📝 문장1: {s1}\n📝 문장2: {s2}\n")
    print(f"유사도: [{bar}] {score*100:.1f}%\n판정: {label} - {desc}\n{'='*40}\n")

def main():
    print("\n🔍 한글 문장 유사도 측정기\n" + "-"*30)
    print("🔄 모델 로딩 중...")
    model = SentenceTransformer('jhgan/ko-sbert-nli')
    print("✅ 준비 완료!\n")
    
    while True:
        s1 = input("문장1 (종료:q): ").strip()
        if s1.lower() == 'q': break
        s2 = input("문장2: ").strip()
        if not s1 or not s2:
            print("⚠️ 두 문장 모두 입력하세요.\n")
            continue
        emb = model.encode([s1, s2])
        score = cosine_similarity([emb[0]], [emb[1]])[0][0]
        show_result(s1, s2, score)

if __name__ == "__main__":
    main()