# Figma MCP Integration

피그마와 MCP(Model Context Protocol)를 연동하여 AI 기반 디자인 시스템 자동화를 구현한 프로젝트입니다.

## 🚀 주요 기능

- **피그마 API 연동**: 디자인 파일, 컴포넌트, 스타일 정보 추출
- **MCP 서버 통신**: AI 모델과의 표준화된 통신 프로토콜
- **디자인 토큰 자동 생성**: 색상, 폰트, 간격 등의 디자인 시스템 토큰 추출
- **컴포넌트 코드 생성**: 피그마 디자인을 기반으로 React/Vue 컴포넌트 자동 생성
- **디자인 시스템 분석**: 일관성 및 접근성 분석

## 📋 요구사항

- Node.js 16.0.0 이상
- npm 또는 yarn
- 피그마 API 액세스 토큰
- MCP 서버 (선택사항)

## 🛠️ 설치 및 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 환경 변수들을 설정하세요:

```env
# Figma API 설정
FIGMA_ACCESS_TOKEN=figd_rbEKoq9gCJ1uUp1nWGjmMdfexX07s9lH6yCSLTg4

# 서버 설정
PORT=3002
NODE_ENV=development

# CORS 설정
CORS_ORIGIN=http://localhost:3002

# MCP 설정
MCP_SERVER_URL=ws://localhost:3002
MCP_CLIENT_ID=figma-mcp-client
```

### 3. 피그마 API 토큰 발급

1. [Figma Settings](https://www.figma.com/settings)에 접속
2. Account 탭에서 Personal access tokens 섹션으로 이동
3. Generate new token 클릭
4. 토큰 이름을 입력하고 생성
5. 생성된 토큰을 `.env` 파일의 `FIGMA_ACCESS_TOKEN`에 설정

## 🚀 실행

### 개발 모드
```bash
npm run dev
```

### 프로덕션 모드
```bash
npm start
```

## 📚 API 문서

### 피그마 API 엔드포인트

#### 파일 정보 가져오기
```
GET /api/figma/file/:fileKey
```

#### 노드 정보 가져오기
```
GET /api/figma/file/:fileKey/nodes?nodeIds=id1,id2,id3
```

#### 이미지 URL 가져오기
```
GET /api/figma/file/:fileKey/images?nodeIds=id1,id2&format=png&scale=1
```

#### 팀 프로젝트 목록
```
GET /api/figma/teams/:teamId/projects
```

### MCP API 엔드포인트

#### MCP 서버 연결
```
POST /api/mcp/connect
Content-Type: application/json

{
  "serverUrl": "ws://localhost:3002",
  "clientId": "figma-mcp-client"
}
```

#### MCP 상태 확인
```
GET /api/mcp/status
```

#### 도구 목록 가져오기
```
GET /api/mcp/tools
```

#### 도구 호출
```
POST /api/mcp/tools/:toolName/call
Content-Type: application/json

{
  "arguments": {
    "param1": "value1",
    "param2": "value2"
  }
}
```

#### 피그마 데이터 MCP 처리
```
POST /api/mcp/figma/process
Content-Type: application/json

{
  "fileKey": "FLhFgBPjJZoud88426oH5V",
  "nodeIds": ["node1", "node2"],
  "action": "generate_component"
}
```

## 🔧 사용 예시

### 1. 피그마 파일에서 디자인 토큰 추출

```javascript
const FigmaService = require('./src/services/figmaService');
const figmaService = new FigmaService();

// 디자인 토큰 추출
const tokens = await figmaService.extractDesignTokens('FLhFgBPjJZoud88426oH5V');
console.log('추출된 토큰:', tokens);
```

### 2. MCP를 통한 컴포넌트 코드 생성

```javascript
const MCPService = require('./src/services/mcpService');
const mcpService = new MCPService();

// MCP 서버 연결
await mcpService.connect('ws://localhost:3002', 'figma-client');

// 피그마 데이터로 컴포넌트 생성
const componentCode = await mcpService.generateComponentCode(figmaData, 'react');
console.log('생성된 컴포넌트:', componentCode);
```

## 📁 프로젝트 구조

```
src/
├── index.js              # 메인 서버 파일
├── routes/
│   ├── figma.js         # 피그마 API 라우트
│   └── mcp.js           # MCP API 라우트
├── services/
│   ├── figmaService.js  # 피그마 API 서비스
│   └── mcpService.js    # MCP 서비스
└── utils/               # 유틸리티 함수들
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 🆘 문제 해결

### 일반적인 문제들

1. **피그마 API 토큰 오류**
   - 토큰이 올바르게 설정되었는지 확인
   - 토큰의 권한이 충분한지 확인

2. **MCP 서버 연결 실패**
   - MCP 서버가 실행 중인지 확인
   - WebSocket URL이 올바른지 확인

3. **포트 충돌**
   - 다른 프로세스가 3000번 포트를 사용하고 있는지 확인
   - `.env` 파일에서 `PORT` 설정 변경

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 생성해 주세요. 