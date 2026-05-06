import re

with open('app/login/page.tsx', 'r') as f:
    content = f.read()

# 1. toast state 및 showToast 함수 추가
old_loading = "const [loading, setLoading] = useState(false);"
new_loading = """const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };"""
content = content.replace(old_loading, new_loading)

# 2. handleKakao 핸들러 추가 및 handleNaver 교체
old_naver = "const handleNaver = () => alert('서비스 준비 중입니다.');"
new_naver = """const handleKakao = () => showToast('카카오 로그인은 서비스 준비 중입니다.');
  const handleNaver = () => showToast('네이버 로그인은 서비스 준비 중입니다.');"""
content = content.replace(old_naver, new_naver)

# 3. 카카오 버튼 onClick 교체
content = content.replace(
    "onClick={() => handleOAuth('kakao')}",
    "onClick={handleKakao}"
)

# 4. 카카오 버튼 SVG 교체 (공식 말풍선)
old_kakao_svg = """<svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                    <ellipse cx="20" cy="19" rx="18" ry="17" fill="#3C1E1E"/>
                    <ellipse cx="13" cy="19" rx="3" ry="4" fill="#FEE500"/>
                    <ellipse cx="27" cy="19" rx="3" ry="4" fill="#FEE500"/>
                    <path d="M13 26c2 2 12 2 14 0" stroke="#FEE500" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>"""
new_kakao_svg = """<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3C6.477 3 2 6.82 2 11.5c0 2.98 1.86 5.607 4.68 7.186L5.5 22l4.174-2.304C10.42 19.893 11.2 20 12 20c5.523 0 10-3.82 10-8.5S17.523 3 12 3z" fill="#191919"/>
                  </svg>"""
content = content.replace(old_kakao_svg, new_kakao_svg)

# 5. 카카오 버튼 텍스트 색상 교체
content = content.replace(
    'text-[#3C1E1E] transition active:scale-95 whitespace-nowrap"\n                  style={{ background: \'#FEE500\' }}',
    'text-[#191919] transition active:scale-95 whitespace-nowrap"\n                  style={{ background: \'#FEE500\' }}'
)

# 6. 토스트 UI 추가 (<main> 바로 안쪽)
old_main = "    <main className=\"min-h-screen flex justify-center bg-white\">\n      <div"
new_main = """    <main className="min-h-screen flex justify-center bg-white">
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-aring-ink-900 text-white text-[13px] font-medium px-5 py-3 rounded-2xl shadow-lg whitespace-nowrap">
          {toast}
        </div>
      )}
      <div"""
content = content.replace(old_main, new_main)

with open('app/login/page.tsx', 'w') as f:
    f.write(content)

print("✅ app/login/page.tsx 수정 완료!")
