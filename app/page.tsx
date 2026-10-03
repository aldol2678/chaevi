"use client";

import { useEffect, useMemo, useState } from "react";

type Balance = "speed" | "balanced" | "accuracy";
type Saving = "saving" | "balanced" | "performance";
type Importance = "low" | "normal" | "high";
type Output = "conversation" | "document" | "code" | "site" | "image";
type Execution = "analysis" | "execute";
type Review = "none" | "helpful" | "required";
type Mode = "route" | "discover";
type Timing = "now" | "next" | "later";
type FeedbackEvaluation = "helpful" | "not_helpful";
type FeedbackReason = "wrong_category" | "wrong_ai_model" | "wrong_tool" | "wrong_order" | "unclear_result";

type Settings = {
  balance: Balance;
  saving: Saving;
  importance: Importance;
  output: Output;
  execution: Execution;
  review: Review;
};

type Recommendation = {
  ai: string;
  model: string;
  reasoning: string;
  environment: string;
  primaryTool: string;
  supportingTool: string;
  confidence: number;
  command: string;
  expectedOutput: { title: string; format: string; includes: string; scope: string };
  why: string[];
  matched: string[];
};

type TaskSeed = { title: string; category: string; why: string; expected: string; action: string };
type TaskSuggestion = Omit<TaskSeed, "action"> & { routeText: string; timing: Timing };
type FeedbackSummary = Record<string, string | number | string[]>;
type FeedbackRecord = {
  id: string;
  evaluation: FeedbackEvaluation;
  reason: FeedbackReason | null;
  mode: Mode;
  recommendation: FeedbackSummary;
  rulesVersion: string;
  createdAt: string;
  updatedAt: string;
};

const FEEDBACK_STORAGE_KEY = "chaevi.feedback.v1";
const FEEDBACK_RULES_VERSION = "v0.3";
const FEEDBACK_LIMIT = 100;

const feedbackReasons: { value: FeedbackReason; label: string }[] = [
  { value: "wrong_category", label: "분류가 맞지 않음" },
  { value: "wrong_ai_model", label: "AI·모델이 맞지 않음" },
  { value: "wrong_tool", label: "도구가 맞지 않음" },
  { value: "wrong_order", label: "추천 순서가 어색함" },
  { value: "unclear_result", label: "이유·예상 결과가 불명확함" },
];

const examples = [
  "Drive의 제품 요구사항 문서와 현재 구현의 충돌을 찾아줘",
  "GitHub 저장소의 로그인 오류를 수정하고 PR을 만들어줘",
  "캠페인 브리프를 발표용 문서로 정리해줘",
];

const goalExamples = [
  "작은 웹 제품을 만들고 실제 수요가 있는지 검증하고 싶어",
  "취업 포트폴리오를 준비하고 싶어",
  "여러 AI를 작업별로 나눠 쓰는 기준을 만들고 싶어",
];

const toolRules = [
  { tool: "Google Drive", keywords: ["drive", "드라이브", "문서", "docs", "sheet", "slides"] },
  { tool: "GitHub", keywords: ["github", "깃허브", "저장소", "repository", "repo", "pr", "코드"] },
  { tool: "Google Calendar", keywords: ["calendar", "캘린더", "일정", "약속", "회의"] },
  { tool: "Gmail", keywords: ["gmail", "메일", "이메일", "회신"] },
  { tool: "Notion", keywords: ["notion", "노션"] },
  { tool: "Website Builder", keywords: ["사이트", "웹 mvp", "landing", "랜딩", "포트폴리오", "웹페이지"] },
  { tool: "Template Creator", keywords: ["템플릿", "반복 양식", "표준 양식"] },
  { tool: "Visualization", keywords: ["시각화", "관계도", "그래프", "타임라인"] },
  { tool: "Browser", keywords: ["브라우저", "로그인", "클릭", "다운로드", "웹사이트"] },
  { tool: "Computer", keywords: ["windows", "윈도우", "로컬 앱", "컴퓨터", "엑셀 프로그램"] },
  { tool: "Figma", keywords: ["figma", "피그마", "ui/ux", "프로토타입"] },
  { tool: "Canva", keywords: ["canva", "캔바", "디자인", "포스터"] },
  { tool: "Vercel", keywords: ["vercel", "버셀", "배포", "도메인"] },
];

const directTools = new Set(["Google Drive", "GitHub", "Google Calendar", "Gmail", "Notion", "Website Builder", "Template Creator", "Visualization", "Figma", "Canva", "Vercel"]);
const hasAny = (text: string, words: string[]) => words.some((word) => text.includes(word));

const taskPacks: Record<string, TaskSeed[]> = {
  portfolio: [
    { title: "목표 역할과 평가기준 정리", category: "파악", why: "무엇을 보여줘야 하는지 먼저 정해야 제작 방향이 흔들리지 않습니다.", expected: "평가기준표", action: "목표 역할과 평가기준을 정리해줘." },
    { title: "대표 프로젝트 선정", category: "결정", why: "모든 경험보다 핵심 역량을 증명하는 사례가 중요합니다.", expected: "대표 프로젝트와 제외 이유", action: "보유 프로젝트를 비교하고 대표 사례를 골라줘." },
    { title: "사례 구조 작성", category: "설계", why: "문제·과정·결과가 연결되어야 역량을 빠르게 이해할 수 있습니다.", expected: "프로젝트 사례 구성안", action: "대표 프로젝트를 문제·역할·과정·결과·배움 구조로 설계해줘." },
    { title: "첫 화면과 대표 사례 제작", category: "제작", why: "작은 실제 화면을 먼저 만들면 설계 오류가 빨리 드러납니다.", expected: "클릭 가능한 포트폴리오 초안", action: "웹 빌더로 포트폴리오 첫 화면과 대표 사례 하나를 구현해줘." },
    { title: "외부 관점 검토", category: "검증", why: "처음 보는 사람에게도 설명이 분명한지 확인해야 합니다.", expected: "수정 우선순위", action: "포트폴리오를 외부 평가자 관점에서 검토하고 수정 우선순위를 정리해줘." },
  ],
  product: [
    { title: "사용자 문제와 성공기준 확정", category: "파악", why: "기능보다 먼저 누구의 어떤 문제를 해결하는지 잠가야 합니다.", expected: "문제정의와 MVP 성공기준", action: "대상 사용자·핵심 문제·MVP 성공기준을 한 장으로 정리해줘." },
    { title: "가장 작은 핵심 흐름 선택", category: "결정", why: "초기에는 전체 제품보다 가치가 드러나는 한 흐름을 검증하는 편이 효율적입니다.", expected: "최소 사용자 흐름", action: "핵심 사용자 흐름 하나를 고르고 제외할 기능까지 정해줘." },
    { title: "클릭 가능한 초안 제작", category: "제작", why: "실제 화면으로 사용성을 확인해야 설계 오류가 드러납니다.", expected: "작동하는 초소형 프로토타입", action: "웹 빌더로 핵심 흐름이 작동하는 초소형 프로토타입을 만들어줘." },
    { title: "대표 시나리오 검증", category: "검증", why: "정상 흐름을 끝까지 통과해야 다음 투자를 판단할 수 있습니다.", expected: "성공·실패 기록", action: "대표 사용자 시나리오로 핵심 흐름을 테스트하고 막힘과 혼동을 기록해줘." },
    { title: "다음 버전 결정", category: "운영", why: "검증 결과를 근거로 유지·수정·폐기 중 하나를 선택해야 합니다.", expected: "다음 버전 결정문", action: "프로토타입 결과를 근거로 다음 버전 범위를 결정해줘." },
  ],
  study: [
    { title: "범위와 현재 수준 확인", category: "파악", why: "현재 격차를 알아야 현실적인 계획이 나옵니다.", expected: "범위·기한·현재 수준표", action: "시험 범위와 기한, 현재 수준을 정리해줘." },
    { title: "점수 영향이 큰 약점 선택", category: "결정", why: "모든 단원을 같은 비중으로 공부하면 시간을 낭비할 수 있습니다.", expected: "우선 학습영역", action: "점수 영향과 취약도를 기준으로 우선 학습영역을 골라줘." },
    { title: "짧은 실행계획 만들기", category: "설계", why: "바로 시작할 수 있는 짧은 주기가 유지하기 쉽습니다.", expected: "1주 학습계획", action: "복습·문제풀이·오답정리를 포함한 1주 계획을 만들어줘." },
    { title: "실전 문제와 오답 기록", category: "실행", why: "읽기만으로는 실제 취약점을 확인하기 어렵습니다.", expected: "오답유형과 보완 목록", action: "실전 문제를 풀고 오답을 원인별로 분류할 기록 양식을 만들어줘." },
    { title: "결과에 맞춰 계획 조정", category: "검증", why: "계획은 실제 성과를 반영해야 합니다.", expected: "다음 주 조정안", action: "학습 결과와 오답 추세를 기준으로 다음 계획을 조정해줘." },
  ],
  research: [
    { title: "질문과 판단기준 명확화", category: "파악", why: "질문이 넓으면 자료가 늘어도 결론은 선명해지지 않습니다.", expected: "검증 가능한 질문과 기준", action: "조사 질문을 검증 가능한 형태로 좁히고 판단기준을 정해줘." },
    { title: "신뢰할 자료 수집", category: "조사", why: "출처의 최신성과 권위를 먼저 확보해야 비교 결과를 믿을 수 있습니다.", expected: "근거자료 목록", action: "공식자료와 신뢰할 수 있는 2차 자료를 구분해 수집해줘." },
    { title: "근거와 불확실성 비교", category: "분석", why: "서로 다른 전제와 빈틈을 봐야 합니다.", expected: "근거 비교표", action: "자료의 주장·근거·상충점·불확실성을 비교표로 정리해줘." },
    { title: "실행 가능한 결론 작성", category: "결정", why: "조사는 다음 행동을 바꿀 때 가치가 생깁니다.", expected: "권고안과 조건", action: "근거를 바탕으로 권고안과 적용·보류 조건을 작성해줘." },
    { title: "반대 관점 재검증", category: "검증", why: "초기 결론을 뒤집을 정보가 있는지 확인해야 합니다.", expected: "반론과 최종 판단", action: "현재 결론을 반대 관점에서 검토하고 바뀌어야 할 조건을 찾아줘." },
  ],
  aiOps: [
    { title: "보유 AI와 조건 목록화", category: "파악", why: "한도와 연결 기능을 알아야 현실적인 추천이 가능합니다.", expected: "AI·모델·한도·도구 목록", action: "현재 보유 AI와 모델, 사용한도, 연결 도구를 목록으로 정리해줘." },
    { title: "작업 유형별 역할 분담", category: "결정", why: "모든 일을 최고 모델에 맡기면 비용과 한도를 낭비합니다.", expected: "작업별 AI 역할표", action: "추론·코딩·조사·작성·검증 작업별로 주력 AI와 보조 AI를 배치해줘." },
    { title: "라우팅 규칙으로 변환", category: "설계", why: "역할표를 실제 판정 규칙으로 바꿔야 반복 사용할 수 있습니다.", expected: "하드룰과 점수 규칙", action: "역할 분담을 하드룰·점수·예외 규칙으로 변환해줘." },
    { title: "실제 작업으로 검증", category: "검증", why: "가상 예시보다 실제 작업에서 어색한 추천을 찾아야 합니다.", expected: "판정 결과와 오류 유형", action: "실제 작업 여러 개를 입력해 추천 결과를 평가하고 판정 오류를 분류해줘." },
    { title: "운영규칙 갱신", category: "운영", why: "검증 결과가 다음 추천에 반영되어야 개선됩니다.", expected: "수정된 라우팅 규칙", action: "테스트 결과를 반영해 라우팅 규칙을 갱신해줘." },
  ],
  generic: [
    { title: "목표와 완료조건 정의", category: "파악", why: "끝난 상태를 알아야 필요한 작업과 불필요한 작업을 구분할 수 있습니다.", expected: "한 문장 목표와 완료조건", action: "목표를 구체화하고 완료됐다고 판단할 조건을 정리해줘." },
    { title: "현재 상태와 정보 공백 확인", category: "파악", why: "이미 끝난 일을 반복하지 않고 실제 막힘부터 해결할 수 있습니다.", expected: "현재 상태와 정보 공백", action: "현재 상태를 복원하고 다음 판단에 부족한 정보를 구분해줘." },
    { title: "가장 작은 가치 있는 행동 선택", category: "결정", why: "큰 계획보다 결과를 빠르게 확인할 첫 행동이 중요합니다.", expected: "최우선 행동과 이유", action: "영향도·긴급도·실행가능성을 기준으로 지금 할 일 하나를 골라줘." },
    { title: "첫 결과물 만들기", category: "실행", why: "작은 결과를 만들어야 추측 대신 실제 피드백으로 판단할 수 있습니다.", expected: "검토 가능한 첫 결과", action: "최우선 행동을 검토 가능한 최소 결과물로 만들어줘." },
    { title: "결과 검증과 다음 단계 결정", category: "검증", why: "결과가 목표에 가까워졌는지 확인한 뒤 다음 투자를 결정해야 합니다.", expected: "검증 결과와 다음 행동", action: "첫 결과를 완료조건과 비교해 검증하고 다음 행동을 결정해줘." },
  ],
};

function suggestTasks(goal: string): TaskSuggestion[] {
  const normalized = goal.toLocaleLowerCase("ko-KR");
  let pack = taskPacks.generic;
  const isPortfolio = hasAny(normalized, ["포트폴리오", "포폴", "취업", "채용", "이력서"]);
  const isStudy = hasAny(normalized, ["공부", "학습", "자격증", "수업", "certification"]) || (normalized.includes("시험") && !normalized.includes("시험해"));
  const isProduct = hasAny(normalized, ["mvp", "앱", "기능", "추천기", "개발", "제품", "프로덕트"]);
  const isAiOps = hasAny(normalized, ["ai 운영", "ai 구독", "모델", "라우팅", "사용량"]) || (hasAny(normalized, ["ai", "chatgpt", "claude", "gemini"]) && hasAny(normalized, ["나눠", "배치", "역할", "언제 써", "비용 대비", "효율적으로"]));
  const isResearch = hasAny(normalized, ["조사", "비교", "분석", "선택", "결정", "리서치", "근거", "자료", "검증"]);
  const isWeakProduct = hasAny(normalized, ["서비스", "사이트", "웹"]);
  if (isPortfolio) pack = taskPacks.portfolio;
  else if (isStudy) pack = taskPacks.study;
  else if (isProduct) pack = taskPacks.product;
  else if (isAiOps) pack = taskPacks.aiOps;
  else if (isResearch) pack = taskPacks.research;
  else if (isWeakProduct) pack = taskPacks.product;

  const isBlocked = hasAny(normalized, ["막힘", "막혔", "안 돼", "안돼", "문제", "오류"]);
  const isFinishing = hasAny(normalized, ["마무리", "완성", "최종", "공개", "출시"]);
  const isProgressing = hasAny(normalized, ["진행 중", "이어", "계속"]);
  let selected = pack;
  if (isBlocked) selected = [{ title: "현재 막힘의 원인 좁히기", category: "진단", why: "해결책을 늘리기 전에 재현 조건과 부족한 정보를 고정해야 합니다.", expected: "원인 후보와 다음 확인 행동", action: "현재 막힘을 재현하고 원인 후보·증거·다음 확인 행동을 정리해줘." }, pack[1], pack[2], pack[3], pack[4]];
  else if (isFinishing) selected = [pack[3], pack[4]];
  else if (isProgressing) selected = [pack[2], pack[3], pack[4]];
  return selected.slice(0, 5).map((seed, index) => ({ ...seed, routeText: `${goal.trim()} 목표를 위해 ${seed.action}`, timing: index === 0 ? "now" : index === selected.length - 1 && selected.length > 2 ? "later" : "next" }));
}

function routeTask(task: string, settings: Settings): Recommendation {
  const normalized = task.toLocaleLowerCase("ko-KR");
  const matches = toolRules.map((rule) => ({ tool: rule.tool, score: rule.keywords.reduce((score, keyword) => score + (normalized.includes(keyword) ? 26 : 0), 0) })).filter((match) => match.score > 0).sort((a, b) => b.score - a.score);
  const codeWork = hasAny(normalized, ["수정", "구현", "리팩터링", "디버깅", "테스트", "코드", "pr"]);
  const localWork = hasAny(normalized, ["windows", "윈도우", "로컬 앱", "컴퓨터"]);
  const browserWork = hasAny(normalized, ["로그인", "클릭", "다운로드", "브라우저"]);
  const actionRequested = hasAny(normalized, ["만들", "제작", "구현", "생성", "작성", "수정", "편집"]);
  const artifactWork = settings.execution === "execute" || settings.output !== "conversation" || actionRequested;
  const complex = hasAny(normalized, ["충돌", "비교", "감사", "검증", "설계", "전체", "통합"]);
  const risky = hasAny(normalized, ["삭제", "결제", "배포", "운영", "계정", "승인"]);

  let primaryTool = matches[0]?.tool ?? "없음";
  if (primaryTool === "Browser" && matches.some((match) => directTools.has(match.tool))) primaryTool = matches.find((match) => directTools.has(match.tool))?.tool ?? "Browser";
  const support = matches.find((match) => match.tool !== primaryTool && match.score >= 26 && !(primaryTool === "GitHub" && match.tool === "Vercel"));
  const supportingTool = support && (matches.length > 1 || complex) ? `${support.tool} · 조건부` : "없음";

  let environment = "Chat";
  if (codeWork && primaryTool === "GitHub") environment = "Codex";
  else if (localWork || browserWork || artifactWork || primaryTool === "Website Builder") environment = "Work";

  const highCount = [complex, risky, settings.importance === "high", settings.review === "required"].filter(Boolean).length;
  const reasoning = highCount >= 3 ? "Extra High" : highCount >= 1 || settings.balance === "accuracy" ? "High" : "Medium";
  let ai = "ChatGPT";
  let model = "GPT-5.6 Sol";
  if (settings.review === "required" && primaryTool === "없음") { ai = "Claude"; model = "상위 추론 모델"; }
  else if (settings.saving === "saving" && settings.importance !== "high" && !risky && primaryTool === "없음") { ai = "DeepSeek"; model = "Reasoner"; }
  if (ai === "ChatGPT" && settings.balance === "speed" && reasoning === "Medium") model = "GPT-5.6 Terra";

  let confidence = 74 + (matches.length ? 8 : 0) + (primaryTool !== "없음" ? 5 : 0) + (complex ? 3 : 0) + (task.trim().length > 28 ? 4 : 0) - (matches.length > 3 ? 5 : 0);
  confidence = Math.max(62, Math.min(96, confidence));

  const matched = [primaryTool !== "없음" ? `${primaryTool} 직접 연결` : "연결 도구 불필요", environment === "Codex" ? "코드베이스 변경" : environment === "Work" ? "실제 제작·조작" : "분석 중심", complex ? "복합 판단" : "단일 작업"];
  const why = [
    `${ai}: ${primaryTool === "없음" ? "현재 작업의 추론·작성 요구" : `${primaryTool} 활용과 작업 통합`}에 적합합니다.`,
    `${reasoning}: ${complex || risky ? "충돌·검증 또는 오류 비용을 반영했습니다." : "작업 복잡도와 중요도에 맞춘 수준입니다."}`,
    `${environment}: ${environment === "Codex" ? "저장소의 실제 변경과 검증이 필요합니다." : environment === "Work" ? "결과물 제작이나 외부 도구 실행이 포함됩니다." : "대화 안의 분석만으로 완료할 수 있습니다."}`,
    primaryTool === "없음" ? "도구 없음: 모델 자체 기능으로 충분해 불필요한 호출을 생략합니다." : `${primaryTool}: 요청에 필요한 정보나 행동을 가장 직접적으로 처리합니다.`,
  ];

  const cleanTask = task.trim().replace(/[.。!！?？]+$/, "");
  const prefix = primaryTool === "없음" ? "" : `${primaryTool}을 사용해 `;
  const suffix = complex ? " 기준과 현재 상태를 구분하고, 불일치·누락·미확정 사항과 다음 행동을 근거와 함께 정리해줘." : " 완료 조건을 먼저 확인하고, 결과와 확인이 필요한 사항을 구분해줘.";
  let title = "실행 가능한 작업 결과";
  let format = "핵심 요약 + 다음 행동";
  let includes = "결론 · 근거 · 확인할 사항";
  if (complex && hasAny(normalized, ["충돌", "비교", "감사", "검증"])) { title = "기준 대비 충돌 감사표"; format = "비교표 + 우선순위 요약"; includes = "충돌 항목 · 판단 근거 · 다음 행동"; }
  else if (primaryTool === "GitHub" || settings.output === "code") { title = codeWork ? "검증된 코드 변경안" : "코드 작업 계획"; format = "변경 요약 + 코드 또는 패치"; includes = "수정 범위 · 검증 결과 · 남은 위험"; }
  else if (primaryTool === "Website Builder" || settings.output === "site") { title = "사용 가능한 사이트 초안"; format = "반응형 화면 + 주요 상호작용"; includes = "핵심 화면 · 동작 확인 · 공유 주소"; }
  else if (primaryTool === "Google Calendar") { title = "정리된 일정 결과"; format = "일정표 + 충돌 요약"; includes = "시간 · 참석자 · 충돌 또는 여유"; }
  else if (primaryTool === "Gmail") { title = "보낼 수 있는 이메일 초안"; format = "제목 + 본문 + 후속 행동"; includes = "핵심 요청 · 필요한 맥락 · 확인 사항"; }
  else if (primaryTool === "Visualization") { title = "한눈에 보는 구조 시각화"; format = "관계도 또는 타임라인"; includes = "핵심 요소 · 연결 관계 · 범례"; }
  else if (primaryTool === "Template Creator") { title = "재사용 가능한 표준 템플릿"; format = "완성 템플릿 + 사용 안내"; includes = "고정 구조 · 작성 항목 · 재사용 방법"; }
  else if (settings.output === "document") { title = "공유 가능한 정리 문서"; format = "구조화된 문서"; includes = "요약 · 본문 · 결론과 다음 행동"; }
  else if (settings.output === "image") { title = "요청에 맞춘 이미지 결과"; format = "완성 이미지 + 사용 안내"; includes = "핵심 메시지 · 시각 요소 · 활용 범위"; }

  let scope = "읽기·분석만";
  if (settings.execution === "execute" || artifactWork) scope = "제작·검증 포함";
  if (environment === "Codex") scope = "저장소 변경·테스트 포함";
  if (risky && settings.execution !== "execute") scope = "분석 후 실행 전 확인";
  return { ai, model, reasoning, environment, primaryTool, supportingTool, confidence, command: `${prefix}${cleanTask}.${suffix}`, expectedOutput: { title, format, includes, scope }, why, matched };
}

function isFeedbackRecord(value: unknown): value is FeedbackRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<FeedbackRecord>;
  return typeof record.id === "string" && (record.evaluation === "helpful" || record.evaluation === "not_helpful") && (record.reason === null || feedbackReasons.some((reason) => reason.value === record.reason)) && (record.mode === "route" || record.mode === "discover") && Boolean(record.recommendation && typeof record.recommendation === "object") && typeof record.rulesVersion === "string" && typeof record.createdAt === "string" && typeof record.updatedAt === "string";
}

function parseFeedbackRecords(raw: string | null) {
  if (!raw) return [] as FeedbackRecord[];
  try { const parsed: unknown = JSON.parse(raw); return Array.isArray(parsed) ? parsed.filter(isFeedbackRecord).slice(-FEEDBACK_LIMIT) : []; } catch { return []; }
}

function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (value: T) => void }) {
  return <fieldset className="segmented-field"><legend>{label}</legend><div className="segmented-control">{options.map((option) => <button className={value === option.value ? "active" : ""} key={option.value} onClick={() => onChange(option.value)} type="button" aria-pressed={value === option.value}>{option.label}</button>)}</div></fieldset>;
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("route");
  const [task, setTask] = useState(examples[0]);
  const [submittedTask, setSubmittedTask] = useState(examples[0]);
  const [goal, setGoal] = useState(goalExamples[0]);
  const [submittedGoal, setSubmittedGoal] = useState(goalExamples[0]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedbackRecords, setFeedbackRecords] = useState<FeedbackRecord[]>([]);
  const [feedbackReady, setFeedbackReady] = useState(false);
  const [feedbackDraft, setFeedbackDraft] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState("");
  const [settings, setSettings] = useState<Settings>({ balance: "balanced", saving: "balanced", importance: "normal", output: "conversation", execution: "analysis", review: "helpful" });

  const result = useMemo(() => routeTask(submittedTask, settings), [submittedTask, settings]);
  const suggestions = useMemo(() => suggestTasks(submittedGoal), [submittedGoal]);
  const feedbackSummary: FeedbackSummary = mode === "route" ? { ai: result.ai, model: result.model, reasoning: result.reasoning, environment: result.environment, primaryTool: result.primaryTool, supportingTool: result.supportingTool, confidence: result.confidence, expectedOutput: result.expectedOutput.title } : { count: suggestions.length, firstTitle: suggestions[0]?.title ?? "", firstCategory: suggestions[0]?.category ?? "", titles: suggestions.map((item) => item.title) };
  const feedbackId = `${mode}:${JSON.stringify(feedbackSummary)}`;
  const currentFeedback = feedbackRecords.find((record) => record.id === feedbackId) ?? null;

  useEffect(() => { const timer = window.setTimeout(() => { setFeedbackRecords(parseFeedbackRecords(window.localStorage.getItem(FEEDBACK_STORAGE_KEY))); setFeedbackReady(true); }, 0); return () => window.clearTimeout(timer); }, []);

  function resetFeedbackUi() { setFeedbackDraft(false); setFeedbackNotice(""); }
  function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) { setSettings((current) => ({ ...current, [key]: value })); resetFeedbackUi(); }
  function submit() { if (mode === "route" && task.trim()) { setSubmittedTask(task); setShowWhy(false); setCopied(false); resetFeedbackUi(); } else if (mode === "discover" && goal.trim()) { setSubmittedGoal(goal); resetFeedbackUi(); } }
  function routeSuggestedTask(item: TaskSuggestion) { setTask(item.routeText); setSubmittedTask(item.routeText); setMode("route"); resetFeedbackUi(); window.requestAnimationFrame(() => document.querySelector("#router-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" })); }
  async function copyCommand() { await navigator.clipboard.writeText(result.command); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }

  function saveFeedback(evaluation: FeedbackEvaluation, reason: FeedbackReason | null) {
    const now = new Date().toISOString();
    const existing = feedbackRecords.find((record) => record.id === feedbackId);
    const record: FeedbackRecord = { id: feedbackId, evaluation, reason, mode, recommendation: feedbackSummary, rulesVersion: FEEDBACK_RULES_VERSION, createdAt: existing?.createdAt ?? now, updatedAt: now };
    const next = [...feedbackRecords.filter((item) => item.id !== feedbackId), record].slice(-FEEDBACK_LIMIT);
    try { window.localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(next)); setFeedbackRecords(next); setFeedbackDraft(false); setFeedbackNotice(evaluation === "helpful" ? "도움 됨으로 저장했습니다." : "선택한 사유와 함께 저장했습니다."); } catch { setFeedbackNotice("이 브라우저에 피드백을 저장하지 못했습니다."); }
  }

  return <main>
    <header className="topbar"><a className="brand" href="#top" aria-label="채비 홈"><span className="brand-mark">C</span><span>채비</span><em>v0.3</em></a><div className="engine-status"><span /> 규칙 엔진 작동 중</div></header>
    <div className="page-shell" id="top">
      <section className="intro"><p className="eyebrow">{mode === "route" ? "CHAEVI · AI WORK ROUTER" : "NEXT ACTION FINDER"}</p>{mode === "route" ? <><h1>할 일을 적으면,<br /><span>가장 알맞은 작업 조합</span>을 찾습니다.</h1><p className="lede">AI·모델·추론 수준·작업환경·도구를 한 번에 추천하고, 왜 그렇게 골랐는지도 보여드립니다.</p></> : <><h1>목표를 적으면,<br /><span>가장 먼저 할 일</span>을 찾습니다.</h1><p className="lede">해야 할 일을 지금·다음·나중으로 나누고, 선택한 작업에 알맞은 AI 조합까지 이어서 추천합니다.</p></>}</section>
      <section className="workspace" id="router-workspace" aria-label="작업 추천기">
        <div className="input-panel">
          <div className="mode-switch" aria-label="추천 방식"><button type="button" aria-pressed={mode === "route"} onClick={() => { setMode("route"); resetFeedbackUi(); }}>정해진 일 배치하기</button><button type="button" aria-pressed={mode === "discover"} onClick={() => { setMode("discover"); resetFeedbackUi(); }}>목표에서 할 일 찾기</button></div>
          <div className="section-heading"><span className="step">01</span><div><h2>{mode === "route" ? "무슨 작업을 하려고 하나요?" : "어떤 목표를 이루고 싶나요?"}</h2><p>{mode === "route" ? "평소 말하듯 구체적으로 적어주세요." : "현재 상황이나 막힌 점도 함께 적으면 더 정확해집니다."}</p></div></div>
          <label className="task-box"><span className="sr-only">입력</span><textarea value={mode === "route" ? task : goal} onChange={(event) => mode === "route" ? setTask(event.target.value) : setGoal(event.target.value)} onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") submit(); }} rows={5} /><span className="char-count">{(mode === "route" ? task : goal).length}자 · Ctrl + Enter</span></label>
          <div className="example-row"><span>예시</span>{(mode === "route" ? examples : goalExamples).map((example, index) => <button key={example} type="button" onClick={() => mode === "route" ? setTask(example) : setGoal(example)}>{index + 1}</button>)}</div>
          {mode === "route" && <><div className="quick-settings"><Segmented label="속도와 정확성" value={settings.balance} options={[{ value: "speed", label: "빠르게" }, { value: "balanced", label: "균형" }, { value: "accuracy", label: "정확하게" }]} onChange={(value) => updateSetting("balance", value)} /><Segmented label="사용량과 성능" value={settings.saving} options={[{ value: "saving", label: "절약" }, { value: "balanced", label: "균형" }, { value: "performance", label: "성능 우선" }]} onChange={(value) => updateSetting("saving", value)} /></div><button className="advanced-toggle" type="button" onClick={() => setShowAdvanced((value) => !value)} aria-expanded={showAdvanced}>고급 설정 <span>{showAdvanced ? "−" : "+"}</span></button>{showAdvanced && <div className="advanced-grid"><label>중요도<select value={settings.importance} onChange={(e) => updateSetting("importance", e.target.value as Importance)}><option value="low">낮음</option><option value="normal">보통</option><option value="high">높음</option></select></label><label>결과물<select value={settings.output} onChange={(e) => updateSetting("output", e.target.value as Output)}><option value="conversation">대화</option><option value="document">문서</option><option value="code">코드</option><option value="site">사이트</option><option value="image">이미지</option></select></label><label>실제 실행<select value={settings.execution} onChange={(e) => updateSetting("execution", e.target.value as Execution)}><option value="analysis">분석만</option><option value="execute">실제 작업</option></select></label><label>독립 검증<select value={settings.review} onChange={(e) => updateSetting("review", e.target.value as Review)}><option value="none">필요 없음</option><option value="helpful">있으면 좋음</option><option value="required">필수</option></select></label></div>}</>}
          <button className="route-button" type="button" onClick={submit}>{mode === "route" ? "최적 조합 찾기" : "다음 행동 찾기"} <span>→</span></button>
        </div>
        <aside className="result-panel" aria-live="polite">
          {mode === "route" ? <><div className="result-topline"><div><span className="step inverse">02</span><p>추천 결과</p></div><div className="confidence"><strong>{result.confidence}%</strong><span>확신도</span></div></div><div className="ai-identity"><div className="ai-orb">AI</div><div><p>추천 AI</p><h2>{result.ai}</h2><span>{result.model} · {result.reasoning}</span></div></div><div className="result-grid"><div><span>작업환경</span><strong>{result.environment}</strong></div><div><span>주 도구</span><strong>{result.primaryTool}</strong></div><div className="wide"><span>보조 도구</span><strong>{result.supportingTool}</strong></div></div><div className="matched-row">{result.matched.map((item) => <span key={item}>✓ {item}</span>)}</div><div className="command-card"><div><span>추천명령어</span><button type="button" onClick={copyCommand}>{copied ? "복사됨" : "복사"}</button></div><p>“{result.command}”</p></div><div className="output-preview"><div className="output-preview-heading"><span>예상 산출물</span><strong>{result.expectedOutput.title}</strong></div><dl><div><dt>형태</dt><dd>{result.expectedOutput.format}</dd></div><div><dt>포함</dt><dd>{result.expectedOutput.includes}</dd></div><div><dt>범위</dt><dd>{result.expectedOutput.scope}</dd></div></dl></div><button className="why-button" type="button" onClick={() => setShowWhy((value) => !value)}>왜 이 조합인가요? <span>{showWhy ? "−" : "+"}</span></button>{showWhy && <div className="why-list">{result.why.map((reason, index) => <div key={reason}><span>0{index + 1}</span><p>{reason}</p></div>)}</div>}</> : <><div className="result-topline discovery-topline"><div><span className="step inverse">02</span><p>추천 작업</p></div><div className="suggestion-count"><strong>{suggestions.length}</strong><span>개</span></div></div><div className="goal-summary"><span>현재 목표</span><p>{submittedGoal}</p></div>{(["now", "next", "later"] as Timing[]).map((timing) => { const grouped = suggestions.filter((item) => item.timing === timing); if (!grouped.length) return null; const labels: Record<Timing, string> = { now: "지금 할 일", next: "다음 할 일", later: "나중에 할 일" }; return <section className={`task-group ${timing}`} key={timing}><h3><span />{labels[timing]}</h3><div className="task-list">{grouped.map((item) => <article className="task-suggestion" key={`${timing}-${item.title}`}><div className="task-suggestion-title"><span>{item.category}</span><h4>{item.title}</h4></div><p>{item.why}</p><div className="task-output"><span>예상 결과</span><strong>{item.expected}</strong></div><button type="button" onClick={() => routeSuggestedTask(item)}>이 작업으로 조합 추천받기 <span>→</span></button></article>)}</div></section>; })}</>}
          <section className="feedback-card" aria-labelledby="feedback-title"><div className="feedback-heading"><div><span>LOCAL FEEDBACK</span><h3 id="feedback-title">이 추천이 도움이 됐나요?</h3></div><strong>{feedbackRecords.length}/{FEEDBACK_LIMIT}</strong></div><div className="feedback-actions"><button type="button" disabled={!feedbackReady} aria-pressed={currentFeedback?.evaluation === "helpful"} onClick={() => saveFeedback("helpful", null)}>도움 됨</button><button type="button" disabled={!feedbackReady} aria-pressed={feedbackDraft || currentFeedback?.evaluation === "not_helpful"} onClick={() => { setFeedbackDraft(true); setFeedbackNotice(""); }}>아님</button></div>{feedbackDraft && <fieldset className="feedback-reasons"><legend>맞지 않은 이유를 하나 선택해주세요.</legend><div>{feedbackReasons.map((reason) => <button type="button" key={reason.value} onClick={() => saveFeedback("not_helpful", reason.value)}>{reason.label}</button>)}</div></fieldset>}<p className="feedback-status" role="status">{feedbackNotice || (currentFeedback ? "이 브라우저에 저장됨 · 입력 원문 미포함" : "선택은 이 브라우저에만 저장되며 입력 원문은 포함하지 않습니다.")}</p></section>
        </aside>
      </section>
      <footer><p>하드룰 → 점수 계산 → 도구 재검토</p><span>추천은 출발점입니다. 중요한 외부 변경 전에는 항상 확인합니다.</span></footer>
    </div>
  </main>;
}
