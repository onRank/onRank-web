# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# onRank

온라인 대회 랭킹 시스템 웹 애플리케이션
 
## 개발 환경 설정

1. 저장소 클론
```bash
git clone [저장소 URL]
cd onrank
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
```bash
cp .env.example .env.development
```
필요에 따라 `.env.development` 파일을 수정하세요.

4. 개발 서버 실행
```bash
npm run dev
```

## 주요 의존성
- React 18
- Vite
- React Router
- Styled Components / Emotion
- MUI
- MSW (개발용 API 모킹)
