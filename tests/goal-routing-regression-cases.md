# Goal-routing regression cases

Purpose: verify that `Discover the next actions` classifies varied goals by the user's main objective rather than by incidental tool names.

Status: public-candidate regression specification.

| ID | Input | Expected category | Check |
|---|---|---|---|
| G01 | 취업 포트폴리오를 처음부터 준비하고 싶어 | portfolio | start from role/evaluation criteria |
| G02 | 개인 웹서비스 아이디어를 MVP로 검증하고 싶어 | product | start from user problem/success criteria |
| G03 | 데이터 분석 자격증 공부를 다시 시작하고 싶어 | study | detect certification/study goal |
| G04 | 이 정책이 실제로 효과가 있는지 근거를 조사하고 싶어 | research | evidence-first research flow |
| G05 | 내가 가진 AI들을 작업별로 어떻게 나눠 쓸지 정하고 싶어 | aiOps | AI role-allocation flow |
| G06 | 취업할 때 보여줄 작업물 사이트가 필요해 | portfolio | final hiring purpose beats site keyword |
| G07 | 작은 앱을 만들어 핵심 기능이 먹히는지 보고 싶어 | product | product validation without explicit MVP term |
| G08 | 시험까지 한 달 남았는데 뭘 먼저 공부할지 모르겠어 | study | prioritize by deadline and weakness |
| G09 | 이 선택이 합리적인지 자료를 모아서 판단하고 싶어 | research | evidence-based decision |
| G10 | AI 구독은 많은데 어떤 모델을 언제 써야 할지 모르겠어 | aiOps | model-routing intent |
| G11 | 취업 포트폴리오 사이트를 웹 빌더로 만들고 싶어 | portfolio | tool does not override final purpose |
| G12 | 웹앱 MVP를 GitHub에 구현해서 사용자 테스트까지 하고 싶어 | product | repository is a means, not the goal |
| G13 | 자격증 공부 계획을 Notion에 정리하고 싶어 | study | Notion does not override study goal |
| G14 | 최신 채용 트렌드를 조사해서 포트폴리오 방향을 잡고 싶어 | portfolio | research is subordinate to portfolio goal |
| G15 | AI 모델 가격과 성능을 조사해서 역할 분담표를 만들고 싶어 | aiOps | research is subordinate to AI allocation goal |
| G16 | 취업용 프로젝트로 작은 AI 웹앱 MVP를 만들고 싶어 | portfolio | final hiring purpose stays primary |
| G17 | 시험 공부에 어떤 AI를 쓰면 좋은지 정하고 싶어 | study | AI keyword does not override study goal |
| G18 | AI 작업 추천기 판정 규칙을 개선하고 싶어 | product | product improvement starts at first product step unless continuation is explicit |
| G19 | 뭘 해야 할지 모르겠어 | generic | avoid overconfident specific category |
| G20 | 프로젝트를 좀 더 잘하고 싶어 | generic | low-information goal stays conservative |

## Invariants

1. Return no more than five actions.
2. Group actions into Now / Next / Later.
3. Final goal outranks incidental tool names.
4. `개선` alone does not imply that earlier steps are already complete.
5. Only explicit continuation language such as `진행 중`, `이어`, or `계속` may skip early steps.
6. A selected action can be routed into the task-routing flow.
