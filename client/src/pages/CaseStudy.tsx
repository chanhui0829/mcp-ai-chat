import type { ReactNode } from 'react';

type SectionProps = {
  title: string;
  children: ReactNode;
};

type CardGridProps = {
  title: string;
  items: string[];
};

type TroubleProps = {
  title: string;
  desc: string;
};

export default function CaseStudy() {
  return (
    <div className="flex-1 h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-10">
        {/* 🔥 HERO */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
          <h1 className="flex items-center text-3xl font-bold mb-2 gap-2 leading-none">
            <span className="text-3xl">💬</span>
            <span>FlowChat</span>
          </h1>
          <p className="opacity-90">Streaming 기반 AI 채팅 애플리케이션</p>

          <div className="flex gap-2 mt-4 flex-wrap">
            {['React', 'Zustand', 'Streaming', 'UX'].map((tag) => (
              <span key={tag} className="text-xs bg-white/20 px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 🔥 개요 (카드화) */}
        <Section title="📌 프로젝트 개요">
          AI 응답을 실시간으로 스트리밍하여 자연스러운 대화 경험을 제공하는 채팅 애플리케이션입니다.
          <br></br>
          상태 관리, 라우팅, UI/UX 개선을 중심으로 설계했습니다.
        </Section>

        {/* 🔥 문제 */}
        <CardGrid
          title="⚠️ 문제 정의"
          items={[
            'AI 응답이 한 번에 출력되어 UX가 부자연스러움',
            '상태와 UI 구조가 분리되지 않아 복잡성 증가',
            '채팅 선택 상태와 라우팅 불일치',
            '스크롤 및 레이아웃 깨짐',
          ]}
        />

        {/* 🔥 해결 */}
        <CardGrid
          title="💡 해결 방법"
          items={[
            'Streaming API 기반 실시간 타이핑 UI 구현',
            'Zustand로 상태 전역 관리',
            'URL 기반 상태 관리 (/chat/:id)',
            'flex + overflow 구조 재설계',
          ]}
        />

        {/* 🔥 기술 */}
        <div>
          <h2 className="text-xl font-semibold mb-4">🛠 기술 스택</h2>

          <div className="flex flex-wrap gap-3">
            {['React', 'TypeScript', 'Zustand', 'React Query', 'Tailwind', 'Node.js'].map(
              (tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 transition rounded-xl"
                >
                  {tech}
                </span>
              )
            )}
          </div>
        </div>

        {/* 🔥 트러블슈팅 */}
        <div>
          <h2 className="text-xl font-semibold mb-4">🔥 트러블슈팅</h2>

          <div className="space-y-4">
            <Trouble
              title="채팅 클릭 시 2번 클릭 문제"
              desc="state와 routing 타이밍 충돌 → URL 기반 상태 관리로 해결"
            />

            <Trouble
              title="스크롤 시 ChatList 같이 늘어나는 문제"
              desc="flex 구조 문제 → overflow-hidden + min-h-0 적용"
            />

            <Trouble
              title="Streaming 중 텍스트 깨짐"
              desc="chunk 단위 처리 문제 → 안정적인 렌더 구조로 개선"
            />
          </div>
        </div>

        {/* 🔥 결과 */}
        <Section title="📈 결과 및 배운 점">
          상태 관리와 라우팅을 결합하여 안정적인 구조를 설계했습니다. 특히 URL 기반 상태 관리 방식은
          확장성과 유지보수 측면에서 큰 장점을 확인했습니다.
        </Section>
      </div>
    </div>
  );
}

/* ---------------- 컴포넌트 ---------------- */

function Section({ title, children }: SectionProps) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="text-gray-700 leading-7">{children}</p>
    </div>
  );
}

function CardGrid({ title, items }: CardGridProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>

      <div className="grid md:grid-cols-2 gap-4">
        {items.map((item, i) => (
          <div
            key={i}
            className="p-4 bg-white rounded-xl shadow-sm border hover:shadow-md transition"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function Trouble({ title, desc }: TroubleProps) {
  return (
    <div className="p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition">
      <div className="font-medium mb-1">{title}</div>
      <div className="text-sm text-gray-600">{desc}</div>
    </div>
  );
}
