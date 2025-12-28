async function uploadImage(endpoint) {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    if (!file) {
        alert('이미지를 선택해주세요.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const loader = document.getElementById('loader');
    const resultBox = document.getElementById('result-box');
    const resultsDiv = document.getElementById('results');
    const previewImg = document.getElementById('preview-img');

    loader.style.display = 'block';
    resultBox.style.display = 'none';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        if (data.image_base64) {
            previewImg.src = `data:image/jpeg;base64,${data.image_base64}`;
        }

        renderResults(data);
        resultBox.style.display = 'block';
    } catch (error) {
        alert('오류가 발생했습니다: ' + error);
    } finally {
        loader.style.display = 'none';
    }
}

function renderResults(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    // 1. 이미지 분류 (results)
    if (data.results && Array.isArray(data.results)) {
        renderTable(resultsDiv, data.results, {
            category: "분석 결과",
            score: "정확도"
        });
        return;
    }

    // 2. 객체 감지 (detections)
    if (data.detections && Array.isArray(data.detections)) {
        const p = document.createElement('p');
        p.textContent = `총 ${data.count}개의 객체가 감지되었습니다.`;
        resultsDiv.appendChild(p);

        renderTable(resultsDiv, data.detections, {
            category: "객체 종류",
            score: "정확도"
        });
        // bbox 정보는 너무 기술적이므로 표에서는 생략하거나 필요시 추가
        return;
    }

    // 3. 텍스트 유사도 (rank)
    if (data.rank && Array.isArray(data.rank)) {
        const p = document.createElement('p');
        p.innerHTML = `기준 문장: <strong>${data.base}</strong>`;
        resultsDiv.appendChild(p);

        renderTable(resultsDiv, data.rank, {
            rank: "순위",
            text: "비교 문장",
            score: "유사도",
            label: "판정"
        });
        return;
    }

    // 4. 얼굴 감지/랜드마크 등 기타 배열 데이터
    for (const key of ['faces', 'hands', 'top_blendshapes', 'pose_landmarks']) {
        if (data[key] && Array.isArray(data[key])) {
            renderTable(resultsDiv, data[key], {
                score: "정확도",
                label: "라벨",
                name: "항목",
                category: "카테고리"
            });
            return;
        }
    }

    // 5. 그 외 데이터 (단일 객체 등) - 감정 분석 등
    const ul = document.createElement('ul');
    ul.style.listStyle = 'none';
    ul.style.padding = '0';

    const keyMap = {
        text: "입력 텍스트",
        sentiment: "감정 분석 결과",
        score: "신뢰도",
        similarity: "유사도",
        is_same_person: "동일인 여부",
        count: "감지 개수"
    };

    for (const [key, value] of Object.entries(data)) {
        if (key === 'image_base64') continue;

        // threshold 같은 기술적 값은 제외할 수 있음
        if (key === 'threshold') continue;

        const li = document.createElement('li');
        li.style.marginBottom = '0.5rem';
        li.style.borderBottom = '1px solid #eee';
        li.style.paddingBottom = '0.5rem';

        const label = keyMap[key] || key;
        let displayValue = value;

        if (key === 'score' || key === 'similarity') {
            displayValue = (value * 100).toFixed(1) + '%';
        }

        if (typeof value === 'boolean') {
            displayValue = value ? '예 (O)' : '아니오 (X)';
        }

        li.innerHTML = `<strong style="display:inline-block; width: 120px; color:#555;">${label}</strong> <span>${displayValue}</span>`;
        ul.appendChild(li);
    }
    resultsDiv.appendChild(ul);
}

function renderTable(container, list, headerMap) {
    if (list.length === 0) {
        container.innerHTML += '<p>결과가 없습니다.</p>';
        return;
    }

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '1rem';

    // Header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.style.backgroundColor = '#f8f9fa';

    // 데이터의 키를 기반으로 헤더 생성 (headerMap에 있는 것만 표시)
    const keys = Object.keys(list[0]);
    const displayKeys = keys.filter(k => headerMap[k]); // 매핑된 키만 표시하도록 필터링 (bbox 등 숨김)

    // 만약 매핑된 키가 하나도 없으면 모든 키 표시 (fallback)
    const finalKeys = displayKeys.length > 0 ? displayKeys : keys;

    finalKeys.forEach(key => {
        const th = document.createElement('th');
        th.textContent = headerMap[key] || key;
        th.style.padding = '0.8rem';
        th.style.textAlign = 'left';
        th.style.borderBottom = '2px solid #ddd';
        th.style.color = '#333';
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');
    list.forEach(item => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #eee';

        finalKeys.forEach(key => {
            const td = document.createElement('td');
            td.style.padding = '0.8rem';

            let val = item[key];

            // 점수 포맷팅
            if (key === 'score' || key === 'similarity') {
                val = (val * 100).toFixed(1) + '%';

                // 점수에 따라 색상 강조
                if (item[key] > 0.8) td.style.color = 'green';
                else if (item[key] < 0.3) td.style.color = '#e74c3c';
                else td.style.color = '#f39c12';
                td.style.fontWeight = 'bold';
            }

            td.textContent = val;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);
}

function previewImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('preview-img').src = e.target.result;
            document.getElementById('preview-container').style.display = 'block';
        }
        reader.readAsDataURL(input.files[0]);
    }
}

async function analyzeText(endpoint) {
    const textInput = document.getElementById('text-input');
    const text = textInput.value.trim();
    if (!text) {
        alert('텍스트를 입력해주세요.');
        return;
    }

    // 유사도 분석의 경우 비교 텍스트들도 처리해야 함 (추후 확장)
    const payload = { text: text };

    // 유사도 API 예외 처리 (임시)
    if (endpoint.includes('similarity')) {
        const compareInput = document.getElementById('compare-input');
        const compareText = compareInput.value.trim();
        if (!compareText) {
            alert('비교할 텍스트를 입력해주세요.');
            return;
        }
        payload.base_text = text;
        payload.compare_texts = compareText.split('\n').filter(t => t.trim() !== '');
        delete payload.text; // remove if not needed
    }

    const loader = document.getElementById('loader');
    const resultBox = document.getElementById('result-box');

    loader.style.display = 'block';
    resultBox.style.display = 'none';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();

        renderResults(data);
        resultBox.style.display = 'block';
    } catch (error) {
        alert('오류가 발생했습니다: ' + error);
    } finally {
        loader.style.display = 'none';
    }
}
