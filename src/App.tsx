import { useEffect, useMemo, useState } from "react";

type WeekFilter = "전체" | "1회차" | "2회차" | "3회차" | "4회차" | "5회차" | "6회차";

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
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export default function App() {
  const [selectedWeek, setSelectedWeek] = useState<WeekFilter>("전체");
  const [state, setState] = useState<CheckState>(() =>
    parseSavedState(localStorage.getItem(STORAGE_KEY))
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
  const percent = Math.round((done / totalTasks) * 100);

  const selectedWeeks = selectedWeek === "전체" ? weeks : filtered;
  const selectedTotal = selectedWeeks.reduce(
    (acc, w) => acc + w.groups.reduce((sum, g) => sum + g.items.length, 0),
    0
  );
  const selectedDone = selectedWeeks.reduce(
    (acc, w) =>
      acc +
      w.groups.reduce(
        (sum, g) => sum + g.items.filter((i) => state[i.id]?.checked).length,
        0
      ),
    0
  );
  const selectedPercent = Math.round((selectedDone / selectedTotal) * 100);

  const toggle = (id: string) => {
    setState((prev) => {
      const cur = prev[id] ?? createEmpty();
      return { ...prev, [id]: { ...cur, checked: !cur.checked } };
    });
  };

  const updateComment = (id: string, value: string) => {
    setState((prev) => {
      const cur = prev[id] ?? createEmpty();
      return { ...prev, [id]: { ...cur, comment: value } };
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

          <div className="mt-4 space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span>전체 진행률</span>
                <span>{percent}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            {selectedWeek !== "전체" && (
              <div>
                <div className="flex justify-between text-sm">
                  <span>{selectedWeek} 진행률</span>
                  <span>{selectedPercent}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-cyan-500 rounded-full"
                    style={{ width: `${selectedPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6 flex gap-2 flex-wrap">
          {(["전체","1회차","2회차","3회차","4회차","5회차","6회차"] as WeekFilter[]).map(w => (
            <button key={w} onClick={()=>setSelectedWeek(w)}
              className={`px-4 py-2 rounded-full text-sm ${
                selectedWeek===w?"bg-emerald-600 text-white":"bg-white border"
              }`}
            >{w}</button>
          ))}
        </div>

        {filtered.map(week => (
          <div key={week.title} className="bg-white p-5 rounded-3xl shadow mb-5">
            <h2 className="font-bold">{week.title}</h2>

            {week.groups.map(group=>(
              <div key={group.groupTitle} className="mt-3">
                <div className="font-semibold">{group.groupTitle}</div>

                {group.items.map(item=>{
                  const checked = state[item.id]?.checked ?? false;
                  const comment = state[item.id]?.comment ?? "";

                  return (
                    <div key={item.id} className="mt-2">
                      <div className="flex justify-between p-3 border rounded-xl">
                        <span>{item.label}</span>

                        <button onClick={()=>toggle(item.id)}
                          className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                            checked?"bg-emerald-500 text-white":"bg-gray-200"
                          }`}
                        >
                          <span className={`w-3 h-3 rounded-full ${checked?"bg-white":"bg-gray-400"}`} />
                          학습완료
                        </button>
                      </div>

                      <textarea
                        value={comment}
                        onChange={e=>updateComment(item.id,e.target.value)}
                        placeholder="멘토링 내용을 메모해보세요."
                        className="w-full mt-2 p-2 rounded-xl bg-cyan-50 border"
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
  );
}