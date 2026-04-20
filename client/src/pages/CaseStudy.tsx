import type { ReactNode } from 'react';

/* ---------------- 타입 ---------------- */

type SectionProps = {
  title: string;
  children: ReactNode;
};

type TroubleProps = {
  title: string;
  problem: string;
  cause: string;
  solution: string;
  decision: string;
  before: string;
  after: string;
};

type BlockProps = {
  label: string;
  color: string;
  text: string;
};

/* ---------------- 페이지 ---------------- */

export default function CaseStudy() {
  return (
    <div className="flex-1 h-full overflow-y-auto bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        {/* 🔥 HERO */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 text-white p-8 rounded-3xl shadow-xl">
          <h1 className="flex items-center text-4xl font-extrabold mb-3 gap-3 leading-none">
            <span className="text-4xl">💬</span>
            <span>FlowChat</span>
          </h1>
          <p className="text-lg opacity-90 font-medium">
            실시간 스트리밍 기술을 활용한 AI 인터랙션 최적화
          </p>

          <div className="flex gap-2 mt-6 flex-wrap">
            {['React', 'TypeScript', 'Zustand', 'SSE(Streaming)', 'AbortController'].map((tag) => (
              <span
                key={tag}
                className="text-xs font-bold bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-md"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <Section title="📌 프로젝트 개요">
          <div className="space-y-4">
            <p>
              사용자와 AI 간의 심리스한 대화를 위해
              <span className="mx-1 font-bold text-blue-600 bg-blue-50 px-1 rounded">
                Server-Sent Events(SSE)
              </span>
              기반 스트리밍을 구현했습니다.
            </p>
            <p>
              단순한 데이터 수신을 넘어, 실시간 환경에서 마주할 수 있는
              <span className="font-semibold text-gray-900 border-b-2 border-red-200">
                기술적 난제들
              </span>
              을 해결하며 안정적인 UX를 구축하는 데 집중했습니다.
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mt-2">
              <li className="flex items-center gap-2 text-gray-600">
                <span className="text-red-500">✔</span> Race Condition(경쟁 상태) 제어
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="text-red-500">✔</span> JSON Chunk 파싱 에러 해결
              </li>
            </ul>
          </div>
        </Section>

        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
            🛠 기술 스택
          </h2>
          <div className="flex flex-wrap gap-3">
            {['React 18', 'TypeScript', 'Zustand', 'Tailwind CSS', 'Axios (SSE)', 'Express'].map(
              (tech) => (
                <span
                  key={tech}
                  className="px-5 py-2.5 text-sm font-medium bg-white text-gray-700 rounded-xl border shadow-sm hover:border-blue-400 transition"
                >
                  {tech}
                </span>
              )
            )}
          </div>
        </div>

        {/* 🔥 트러블슈팅 */}
        <div className="space-y-8">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="w-1.5 h-6 bg-red-500 rounded-full"></span>
            🔥 핵심 트러블슈팅
          </h2>

          <Trouble
            title="비완성형 JSON Chunk 파싱 및 텍스트 깨짐"
            problem={`스트리밍 데이터가 전송될 때 JSON 문자열이 중간에 잘려 들어오면서 JSON.parse() 에러가 발생하고, 
결과적으로 답변이 화면에 출력되지 않거나 비정상적인 문자가 노출되었습니다.`}
            cause={`네트워크 패킷 단위로 쪼개진 데이터(Chunk)가 유효한 JSON 형식을 갖추지 못한 상태에서 파싱을 시도했기 때문입니다.`}
            solution={`데이터 수신부에서 전역 변수를 통한 버퍼링 로직을 구현하여 완전한 JSON 형태가 갖춰졌을 때만 파싱을 수행하도록 개선했습니다.`}
            decision={`사용자에게 중간 과정을 보여주는 것보다 '정확한 마크다운'을 보여주는 것이 대화 신뢰도에 더 중요하다고 판단했습니다.`}
            before={`답변 중간에 중괄호({})나 알 수 없는 문자가 섞여 나오며 서비스 신뢰도 저하.`}
            after={`깨짐 없는 매끄러운 타이핑 효과 구현 및 마크다운 컴포넌트의 안정적 렌더링.`}
          />

          <Trouble
            title="요청 간 경쟁 상태(Race Condition)로 인한 응답 뒤섞임"
            problem={`사용자가 짧은 간격으로 연속 질문을 보낼 경우, 먼저 보낸 질문의 답변이 나중에 도착하여 현재 질문의 답변을 덮어쓰는 문제가 발생했습니다.`}
            cause={`비동기 스트리밍 요청의 완료 순서가 보장되지 않아, 이전 응답의 'fullText'가 현재 UI 상태를 오염시켰기 때문입니다.`}
            solution={`requestId 레퍼런스를 활용해 최신 요청 ID가 아닐 경우 응답 처리를 무시하고, AbortController로 이전 네트워크 연결을 즉시 중단했습니다.`}
            decision={`UI 정합성(requestId)과 리소스 최적화(AbortController)를 동시에 달성하기 위한 선택이었습니다.`}
            before={`질문은 'A'인데 답변은 'B'가 출력되는 데이터 부정합 발생.`}
            after={`항상 마지막에 보낸 질문에 대한 답변만 화면에 노출되어 UX 일관성 확보.`}
          />
        </div>

        {/* 🔥 설계 결정 */}
        <Section title="🧠 주요 설계 결정 (Technical Decisions)">
          <ul className="list-disc pl-5 space-y-3 text-gray-700">
            <li>
              <strong>Zustand:</strong> Flux 패턴의 직관적인 상태 관리를 통해 복잡한 채팅 로직을
              간결하게 유지
            </li>
            <li>
              <strong>URL 기반 상태 관리:</strong> 채팅방 ID를 URL 파라미터로 관리하여 새로고침
              시에도 상태가 유지되는 'Single Source of Truth' 확보
            </li>
            <li>
              <strong>Streamdown 라이브러리 커스텀:</strong> 마크다운 렌더링과 스트리밍 타이핑
              효과를 결합하여 개발 생산성 향상
            </li>
          </ul>
        </Section>

        {/* 🔥 결과 */}
        <Section title="📈 프로젝트 성과 및 회고">
          단순히 API를 호출해 보여주는 것을 넘어, **네트워크 레벨의 비동기 흐름 제어**가 프론트엔드
          UX에 얼마나 큰 영향을 미치는지 체감했습니다. 특히 스트리밍 환경에서 발생하는 **데이터의
          단편화 현상**을 해결하며 브라우저가 데이터를 처리하는 원리를 더 깊게 이해하게 되었습니다.
          이후 프로젝트에서는 에러 핸들링과 네트워크 재연결 로직(Exponential Backoff 등)까지
          고려하여 더욱 견고한 서비스를 만들고 싶습니다.
        </Section>
      </div>
    </div>
  );
}

/* ---------------- 컴포넌트 ---------------- */

function Section({ title, children }: SectionProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold mb-4 text-gray-800">{title}</h2>
      <div className="text-gray-700 leading-7">{children}</div>
    </div>
  );
}

function Trouble({ title, problem, cause, solution, decision, before, after }: TroubleProps) {
  return (
    <div className="p-6 border rounded-3xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 space-y-5">
      <h3 className="font-bold text-xl text-blue-600">{title}</h3>

      <div className="grid gap-4">
        <Block label="PROBLEM" color="text-red-500 bg-red-50" text={problem} />
        <Block label="CAUSE" color="text-orange-500 bg-orange-50" text={cause} />
        <Block label="SOLUTION" color="text-blue-500 bg-blue-50" text={solution} />
        <Block label="DECISION" color="text-purple-500 bg-purple-50" text={decision} />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-2">
        <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl text-sm">
          <div className="font-bold text-red-600 mb-2 flex items-center gap-1">❌ Before</div>
          <p className="text-gray-600 leading-6">{before}</p>
        </div>

        <div className="p-4 bg-green-50/50 border border-green-100 rounded-2xl text-sm">
          <div className="font-bold text-green-600 mb-2 flex items-center gap-1">✅ After</div>
          <p className="text-gray-600 leading-6">{after}</p>
        </div>
      </div>
    </div>
  );
}

function Block({ label, color, text }: BlockProps) {
  return (
    <div className="group">
      <span className={`text-[10px] tracking-widest font-black px-2 py-0.5 rounded-md ${color}`}>
        {label}
      </span>
      <p className="text-[14px] text-gray-700 mt-1.5 leading-relaxed font-medium">{text}</p>
    </div>
  );
}
