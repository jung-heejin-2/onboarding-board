import { useEffect, useMemo, useState } from "react";
<<<<<<< HEAD

type WeekFilter = "전체" | "1회차" | "2회차" | "3회차" | "4회차" | "5회차" | "6회차";
=======
type Role = "mentor" | "mentee";
type WeekFilter = "전체" | "1주차" | "2주차" | "3주차" | "4주차";
>>>>>>> 5b3b8ef2fcef7d8e383fd494e05deb06337ffdb9

type Task = {
  id: string;
  label: string;
};

type TaskGroup = {
  groupTitle: string;
  items: Task[];
};

type Week = {
  title: Exclude<WeekFilter, "전체">;
  subtitle: string;
  groups: TaskGroup[];
};

type CheckItem = {
  checked: boolean;
  comment: string;
};

type CheckState = Record<string, CheckItem>;

const STORAGE_KEY = "onboarding-on-board-state-v5";

const weeks: Week[] = [
  {
    title: "1회차",
    subtitle: "배치부서 이해",
    groups: [
      {
        groupTitle: "1-1. 배치부서 이해",
        items: [
          { id: "w1-1-1", label: "실 주요업무 이해" },
          { id: "w1-1-2", label: "실 운영수칙 이해" },
          { id: "w1-1-3", label: "이해관계자 파악" },
          { id: "w1-1-4", label: "전화응대법 숙지" },
          { id: "w1-1-5", label: "이메일/쪽지 발신 방법" },
        ],
      },
      {
        groupTitle: "1-2. 기관 예산의 이해",
        items: [
          { id: "w1-2-1", label: "경상운영비 이해" },
          { id: "w1-2-2", label: "사업비 이해" },
        ],
      },
    ],
  },
  {
    title: "2회차",
    subtitle: "담당업무 이해",
    groups: [
      {
        groupTitle: "2. 담당업무 이해",
        items: [
          { id: "w2-1-1", label: "사업지침 학습" },
          { id: "w2-1-2", label: "기본계획 및 세부계획 이해" },
          { id: "w2-1-3", label: "전년도 결과보고 방법 습득" },
        ],
      },
    ],
  },
  {
    title: "3회차",
    subtitle: "회의 추진 방법",
    groups: [
      {
        groupTitle: "3. 회의 추진 방법",
        items: [
          { id: "w3-1-1", label: "업무 회의 계획 수립" },
          { id: "w3-1-2", label: "회의 준비 및 운영" },
          { id: "w3-1-3", label: "결과보고 방법 습득" },
        ],
      },
    ],
  },
  {
    title: "4회차",
    subtitle: "구매·계약 이해",
    groups: [
      {
        groupTitle: "4. 구매·계약 이해",
        items: [
          { id: "w4-1-1", label: "계약 종류 이해(입찰, 수의계약)" },
          { id: "w4-1-2", label: "계약 관련 서류(제안요청서, 입찰공고문 등)" },
          {
            id: "w4-1-3",
            label:
              "추진 절차 안내(발주계획 작성, 계획수립, 계약체결, 선금지급, 검수, 완료보고 및 잔금지급 등)",
          },
        ],
      },
    ],
  },
  {
    title: "5회차",
    subtitle: "제안평가 운영 방법",
    groups: [
      {
        groupTitle: "5. 제안평가 운영 방법",
        items: [
          { id: "w5-1-1", label: "제안평가 계획 수립" },
          { id: "w5-1-2", label: "제안평가 준비 및 운영" },
          { id: "w5-1-3", label: "결과보고 및 정리" },
        ],
      },
    ],
  },
  {
    title: "6회차",
    subtitle: "사업점검 및 이해관계자 소통법",
    groups: [
      {
        groupTitle: "6. 사업점검 및 이해관계자 소통법",
        items: [
          { id: "w6-1-1", label: "현장점검, 현장간담회 등을 위한 이해관계자 소통 노하우 전수" },
          { id: "w6-1-2", label: "사업 점검 계획 수립, 준비 및 운영, 결과보고 방법 습득" },
        ],
      },
    ],
  },
];

function createEmpty(): CheckItem {
  return { checked: false, comment: "" };
}

function parseSavedState(raw: string | null): CheckState {
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as CheckState;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export default function App() {
  const [selectedWeek, setSelectedWeek] = useState<WeekFilter>("전체");
  const [state, setState] = useState<CheckState>(() => {
    if (typeof window === "undefined") {
      return {};
    }
    return parseSavedState(window.localStorage.getItem(STORAGE_KEY));
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const filtered = useMemo(() => {
    return selectedWeek === "전체"
      ? weeks
      : weeks.filter((w) => w.title === selectedWeek);
  }, [selectedWeek]);

  const totalTasks = weeks.reduce(
    (acc, w) => acc + w.groups.reduce((sum, g) => sum + g.items.length, 0),
    0
  );
  const done = Object.values(state).filter((s) => s.checked).length;
  const percent = totalTasks === 0 ? 0 : Math.round((done / totalTasks) * 100);

  const selectedWeeks = selectedWeek === "전체" ? weeks : weeks.filter((w) => w.title === selectedWeek);
  const selectedTotal = selectedWeeks.reduce(
    (acc, w) => acc + w.groups.reduce((sum, g) => sum + g.items.length, 0),
    0
  );
  const selectedDone = selectedWeeks.reduce((acc, w) => {
    return (
      acc +
      w.groups.reduce((sum, g) => {
        return sum + g.items.filter((item) => state[item.id]?.checked).length;
      }, 0)
    );
  }, 0);
  const selectedPercent = selectedTotal === 0 ? 0 : Math.round((selectedDone / selectedTotal) * 100);

  const toggle = (id: string) => {
    setState((prev) => {
      const cur = prev[id] ?? createEmpty();
      return {
        ...prev,
        [id]: { ...cur, checked: !cur.checked },
      };
    });
  };

  const updateComment = (id: string, value: string) => {
    setState((prev) => {
      const cur = prev[id] ?? createEmpty();
      return {
        ...prev,
        [id]: { ...cur, comment: value },
      };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-xl">
          <h1 className="text-3xl font-bold">
            EPIS 가디언즈
            <span className="block text-emerald-600">ON Board</span>
          </h1>
          <p className="mt-2 whitespace-pre-line text-sm text-gray-600">
            EPIS 가디언즈 멘토링을 돕는 보조 체크리스트 도구입니다.
            {"\n"}
            멘토링 진행 사항을 체크하고 효율적으로 교육 일정을 관리해보세요.
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>전체 진행률</span>
                <span>{percent}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            {selectedWeek !== "전체" && (
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{selectedWeek} 진행률</span>
                  <span>{selectedPercent}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-cyan-500"
                    style={{ width: `${selectedPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {(["전체", "1회차", "2회차", "3회차", "4회차", "5회차", "6회차"] as WeekFilter[]).map((w) => (
            <button
              key={w}
              onClick={() => setSelectedWeek(w)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                selectedWeek === w
                  ? "bg-emerald-600 text-white"
                  : "border border-gray-200 bg-white"
              }`}
            >
              {w}
            </button>
          ))}
        </div>

        <div className="grid gap-5">
          {filtered.map((week) => (
            <div key={week.title} className="rounded-3xl bg-white p-5 shadow">
              <div className="mb-4">
                <h2 className="text-xl font-bold">{week.title}</h2>
                <p className="text-sm text-gray-500">{week.subtitle}</p>
              </div>

              {week.groups.map((group) => (
                <div key={group.groupTitle} className="mb-4">
                  <div className="mb-2 rounded-xl bg-gray-50 px-4 py-2 font-semibold">
                    {group.groupTitle}
                  </div>

                  {group.items.map((item) => {
                    const checked = state[item.id]?.checked ?? false;
                    const comment = state[item.id]?.comment ?? "";

                    return (
                      <div key={item.id} className="mb-3">
                        <div
                          className={`flex items-center justify-between rounded-xl border p-3 ${
                            checked ? "border-emerald-200 bg-emerald-50" : "bg-white"
                          }`}
                        >
                          <span className="text-sm">{item.label}</span>
                          <button
                            type="button"
                            onClick={() => toggle(item.id)}
                            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                              checked
                                ? "bg-emerald-500 text-white"
                                : "bg-gray-200 text-gray-700"
                            }`}
                            aria-label={`${item.label} 학습완료 토글`}
                          >
                            <span
                              className={`h-3 w-3 rounded-full ${
                                checked ? "bg-white" : "bg-gray-400"
                              }`}
                            />
                            학습완료
                          </button>
                        </div>

                        <textarea
                          value={comment}
                          onChange={(e) => updateComment(item.id, e.target.value)}
                          placeholder="멘토링 내용을 메모해보세요."
                          className="mt-2 w-full rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-sm focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}