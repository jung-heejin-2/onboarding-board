import { useEffect, useMemo, useState } from "react";

type WeekFilter = "전체" | "1회차" | "2회차" | "3회차" | "4회차" | "5회차" | "6회차";

type Task = {
  id: string;
  label: string;
  description?: string;
};

type TaskGroup = {
  id: string;
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

type LabelState = Record<string, string>;
type DescriptionState = Record<string, string>;
type GroupTitleState = Record<string, string>;
type CheckState = Record<string, CheckItem>;

type EditingField =
  | { type: "item"; id: string }
  | { type: "group"; id: string }
  | null;

const STORAGE_KEY = "onboarding-on-board-state-v7";
const LABEL_STORAGE_KEY = "onboarding-on-board-labels-v2";
const DESCRIPTION_STORAGE_KEY = "onboarding-on-board-descriptions-v1";
const GROUP_TITLE_STORAGE_KEY = "onboarding-on-board-group-titles-v1";

const weeks: Week[] = [
  {
    title: "1회차",
    subtitle: "배치부서 이해",
    groups: [
      {
        id: "g1-1",
        groupTitle: "1-1. 배치부서 이해",
        items: [
          { id: "w1-1-1", label: "실 주요업무 이해" },
          { id: "w1-1-2", label: "실 운영수칙 이해" },
          { id: "w1-1-3", label: "이해관계자 파악" },
          { id: "w1-1-4", label: "전화응대법 숙지" },
          { id: "w1-1-5", label: "이메일/쪽지 발신" },
        ],
      },
      {
        id: "g1-2",
        groupTitle: "1-2. 기관 예산의 이해",
        items: [
          {
            id: "w1-2-1",
            label: "경상운영비 이해",
            description: "기관업무비, 실운영비, 소모품비, 자료구입비 등",
          },
          {
            id: "w1-2-2",
            label: "사업비 이해",
            description: "일반수용비, 일반용역비, 민간경상보조, 여비, 사업추진비 등",
          },
        ],
      },
    ],
  },
  {
    title: "2회차",
    subtitle: "담당업무 이해",
    groups: [
      {
        id: "g2-1",
        groupTitle: "2. 담당업무 이해",
        items: [
          { id: "w2-1-1", label: "사업지침 학습" },
          { id: "w2-1-2", label: "기본계획 및 세부계획 이해" },
          { id: "w2-1-3", label: "전년도 결과보고 확인" },
        ],
      },
    ],
  },
  {
    title: "3회차",
    subtitle: "회의 추진 방법",
    groups: [
      {
        id: "g3-1",
        groupTitle: "3. 회의 추진 방법",
        items: [
          { id: "w3-1-1", label: "회의 계획 수립" },
          { id: "w3-1-2", label: "회의 준비 및 운영" },
          { id: "w3-1-3", label: "결과보고 작성" },
        ],
      },
    ],
  },
  {
    title: "4회차",
    subtitle: "구매·계약 이해",
    groups: [
      {
        id: "g4-1",
        groupTitle: "4. 구매·계약 이해",
        items: [
          { id: "w4-1-1", label: "구매·계약 종류 이해", description: "입찰, 수의계약" },
          { id: "w4-1-2", label: "관련 서류 이해", description: "제안요청서, 입찰공고문 등" },
          {
            id: "w4-1-3",
            label: "추진 절차 이해",
            description: "발주계획 작성, 계획수립, 계약체결, 선금지급, 검수, 완료보고 및 잔금지급 등",
          },
        ],
      },
    ],
  },
  {
    title: "5회차",
    subtitle: "제안평가 운영",
    groups: [
      {
        id: "g5-1",
        groupTitle: "5. 제안평가 운영",
        items: [
          { id: "w5-1-1", label: "제안평가 계획 수립" },
          { id: "w5-1-2", label: "제안평가 준비 및 운영" },
          { id: "w5-1-3", label: "점수산출 및 결과보고" },
        ],
      },
    ],
  },
  {
    title: "6회차",
    subtitle: "사업 점검 및 이해관계자 소통법",
    groups: [
      {
        id: "g6-1",
        groupTitle: "6. 사업 점검 및 이해관계자 소통법",
        items: [
          {
            id: "w6-1-1",
            label: "이해관계자 소통",
            description: "현장점검, 현장간담회 등을 위한 노하우",
          },
          {
            id: "w6-1-2",
            label: "사업 점검 프로세스",
            description: "사업 점검 계획 수립, 준비 및 운영, 결과보고 방법",
          },
        ],
      },
    ],
  },
];

function createEmpty(): CheckItem {
  return { checked: false, comment: "" };
}

function parseSavedState<T extends Record<string, string> | CheckState>(raw: string | null): T | {} {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as T;
  } catch {
    return {};
  }
}

export const testCases = [
  {
    name: "label map parses safely",
    input: parseSavedState<LabelState>("not-json"),
    expected: {},
  },
  {
    name: "group ids exist",
    input: weeks[0].groups[0].id,
    expected: "g1-1",
  },
  {
    name: "description remains optional",
    input: weeks[0].groups[0].items[0].description ?? "",
    expected: "",
  },
  {
    name: "editable title is preserved in merge order",
    input: { ...(parseSavedState<LabelState>('{"a":"A"}') as LabelState), b: "B" },
    expected: { a: "A", b: "B" },
  },
];

export default function App() {
  const [selectedWeek, setSelectedWeek] = useState<WeekFilter>("전체");
  const [state, setState] = useState<CheckState>(() =>
    parseSavedState<CheckState>(typeof window === "undefined" ? null : window.localStorage.getItem(STORAGE_KEY)) as CheckState
  );
  const [editableLabels, setEditableLabels] = useState<LabelState>(() =>
    parseSavedState<LabelState>(typeof window === "undefined" ? null : window.localStorage.getItem(LABEL_STORAGE_KEY)) as LabelState
  );
  const [editableDescriptions, setEditableDescriptions] = useState<DescriptionState>(() =>
    parseSavedState<DescriptionState>(typeof window === "undefined" ? null : window.localStorage.getItem(DESCRIPTION_STORAGE_KEY)) as DescriptionState
  );
  const [editableGroupTitles, setEditableGroupTitles] = useState<GroupTitleState>(() =>
    parseSavedState<GroupTitleState>(typeof window === "undefined" ? null : window.localStorage.getItem(GROUP_TITLE_STORAGE_KEY)) as GroupTitleState
  );
  const [editingField, setEditingField] = useState<EditingField>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LABEL_STORAGE_KEY, JSON.stringify(editableLabels));
  }, [editableLabels]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(DESCRIPTION_STORAGE_KEY, JSON.stringify(editableDescriptions));
  }, [editableDescriptions]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(GROUP_TITLE_STORAGE_KEY, JSON.stringify(editableGroupTitles));
  }, [editableGroupTitles]);

  const filtered = useMemo(() => {
    return selectedWeek === "전체" ? weeks : weeks.filter((w) => w.title === selectedWeek);
  }, [selectedWeek]);

  const totalTasks = weeks.reduce(
    (acc, w) => acc + w.groups.reduce((sum, g) => sum + g.items.length, 0),
    0
  );
  const done = Object.values(state).filter((s) => s.checked).length;
  const percent = totalTasks === 0 ? 0 : Math.round((done / totalTasks) * 100);

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
  const selectedPercent = selectedTotal === 0 ? 0 : Math.round((selectedDone / selectedTotal) * 100);

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

  const updateLabel = (id: string, value: string) => {
    setEditableLabels((prev) => ({ ...prev, [id]: value }));
  };

  const updateDescription = (id: string, value: string) => {
    setEditableDescriptions((prev) => ({ ...prev, [id]: value }));
  };

  const updateGroupTitle = (id: string, value: string) => {
    setEditableGroupTitles((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-xl sm:gap-6 md:flex-row md:items-stretch md:justify-between md:p-10">
          <div className="min-w-0 flex-1">
            <h1 className="text-4xl font-bold md:text-5xl">
              EPIS 가디언즈
              <span className="block text-emerald-600">ON Board</span>
            </h1>
            <p className="mt-3 text-base leading-6 text-gray-600">
              회차별 추천 체크리스트를 바탕으로
              <br />
              체계적으로 학습 내용을 기록해보세요.
            </p>
          </div>

          <div className="w-full rounded-2xl bg-black p-5 text-center text-white sm:p-6 md:max-w-[360px] md:basis-1/2 md:self-stretch">
            <div className="mb-3 text-left text-lg font-bold">📊 멘토링 진행률</div>
            <div className="text-xs opacity-80">전체</div>
            <div className="mb-2 text-xl font-bold">{percent}%</div>
            <div className="mb-3 h-2 w-full rounded-full bg-gray-700">
              <div className="h-full rounded-full bg-emerald-400" style={{ width: `${percent}%` }} />
            </div>
            {selectedWeek !== "전체" && (
              <>
                <div className="text-xs opacity-80">{selectedWeek}</div>
                <div className="mb-1 text-sm font-semibold">{selectedPercent}%</div>
                <div className="h-2 w-full rounded-full bg-gray-700">
                  <div className="h-full rounded-full bg-cyan-400" style={{ width: `${selectedPercent}%` }} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {(["전체", "1회차", "2회차", "3회차", "4회차", "5회차", "6회차"] as WeekFilter[]).map((w) => (
            <button
              key={w}
              onClick={() => setSelectedWeek(w)}
              className={`rounded-full px-4 py-2 text-sm ${
                selectedWeek === w ? "bg-emerald-600 text-white" : "border bg-white"
              }`}
            >
              {w}
            </button>
          ))}
        </div>

        {filtered.map((week) => (
          <div key={week.title} className="mb-5 rounded-3xl bg-white p-5 shadow">
            <h2 className="mb-2 font-bold">{week.title}</h2>

            {week.groups.map((group) => {
              const currentGroupTitle = editableGroupTitles[group.id] ?? group.groupTitle;

              return (
                <div key={group.id} className="mt-3">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex-1 font-semibold">
                      {editingField?.type === "group" && editingField.id === group.id ? (
                        <textarea
                          value={currentGroupTitle}
                          onChange={(e) => updateGroupTitle(group.id, e.target.value)}
                          onBlur={() => setEditingField(null)}
                          autoFocus
                          className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm font-semibold focus:border-emerald-400 focus:outline-none"
                        />
                      ) : (
                        <div>{currentGroupTitle}</div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingField(
                          editingField?.type === "group" && editingField.id === group.id
                            ? null
                            : { type: "group", id: group.id }
                        )
                      }
                      className="rounded-full border border-gray-300 bg-white px-2 py-0.5 text-xs text-gray-700"
                    >
                      편집
                    </button>
                  </div>

                  {group.items.map((item) => {
                    const checked = state[item.id]?.checked ?? false;
                    const comment = state[item.id]?.comment ?? "";
                    const currentLabel = editableLabels[item.id] ?? item.label;
                    const currentDescription = editableDescriptions[item.id] ?? item.description ?? "";
                    const isEditingItem = editingField?.type === "item" && editingField.id === item.id;

                    return (
                      <div key={item.id} className="mt-2">
                        <div
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${
                            checked ? "border-emerald-200 bg-emerald-50" : "bg-white"
                          }`}
                          onClick={() => toggle(item.id)}
                        >
                          <div className="flex flex-1 items-start gap-3 pr-3">
                            <div
                              className={`mt-1 flex h-4 w-4 items-center justify-center rounded-full border ${
                                checked ? "border-emerald-500 bg-emerald-500" : "border-gray-400"
                              }`}
                            >
                              {checked && <div className="h-2 w-2 rounded-full bg-white" />}
                            </div>

                            <div className="flex-1">
                              {isEditingItem ? (
                                <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    value={currentLabel}
                                    onChange={(e) => updateLabel(item.id, e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm font-medium focus:border-emerald-400 focus:outline-none"
                                    placeholder="제목을 입력하세요"
                                  />
                                  <textarea
                                    value={currentDescription}
                                    onChange={(e) => updateDescription(item.id, e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white p-2 text-xs text-gray-700 focus:border-emerald-400 focus:outline-none"
                                    placeholder="설명을 입력하세요"
                                    rows={2}
                                  />
                                  <div className="flex justify-end">
                                    <button
                                      type="button"
                                      onClick={() => setEditingField(null)}
                                      className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs text-white"
                                    >
                                      저장
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div>{currentLabel}</div>
                                  {currentDescription && (
                                    <div className="mt-1 text-xs text-gray-500">{currentDescription}</div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() =>
                                setEditingField(
                                  isEditingItem ? null : { type: "item", id: item.id }
                                )
                              }
                              className="rounded-full border border-gray-300 bg-white px-2 py-0.5 text-xs text-gray-700"
                            >
                              편집
                            </button>
                          </div>
                        </div>

                        <textarea
                          value={comment}
                          onChange={(e) => updateComment(item.id, e.target.value)}
                          placeholder="멘토링 내용을 메모해보세요."
                          className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-100 p-2 focus:border-gray-300 focus:outline-none"
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
