from transformers import pipeline

# 모델명 (NSMC 데이터셋으로 파인튜닝된 KoELECTRA-small)
MODEL_NAME = "daekeun-ml/koelectra-small-v3-nsmc"

# 파이프라인 생성 (자동으로 모델 및 토크나이저 다운로드)
# 첫 실행 시 다운로드 시간이 소요될 수 있습니다.
classifier = pipeline("sentiment-analysis", model=MODEL_NAME)

def analyze_sentiment(text):
    """
    주어진 텍스트에 대해 감정을 분석(긍정/부정)하여 출력합니다.
    """
    results = classifier(text)
    
    for result in results:
        label = result['label']
        score = result['score']
        
        # 라벨 해석 (모델에 따라 0/1 또는 부정/긍정 텍스트로 나옴)
        # 해당 모델은 보통 0(부정), 1(긍정)으로 학습됨
        sentiment = "알 수 없음"
        if label == '0' or label == 'LABEL_0':
            sentiment = "😠 부정 (Negative)"
        elif label == '1' or label == 'LABEL_1':
            sentiment = "😊 긍정 (Positive)"
        else:
            sentiment = label
            
        print(f"입력 텍스트: '{text}'")
        print(f"분석 결과: {sentiment}")
        print(f"신뢰도: {score:.4f}")
        print("-" * 30)

if __name__ == "__main__":
    print(">>> 한국어 감정 분석 (daekeun-ml/koelectra-small-v3-nsmc)")
    print(">>> 종료하려면 'q' 또는 'quit'을 입력하세요.\n")
    
    while True:
        user_input = input("분석할 텍스트를 입력하세요: ").strip()
        
        if user_input.lower() in ['q', 'quit', '']:
            print("프로그램을 종료합니다.")
            break
        
        analyze_sentiment(user_input)