import { useEffect, useMemo, useState } from "react";

type WeekFilter = "전체" | "DAY1" | "1회차" | "2회차" | "3회차" | "4회차" | "5회차" | "6회차";

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

const EMPLOYEE_ID_STORAGE_KEY = "onboarding-on-board-employee-id";
const STORAGE_KEY_PREFIX = "onboarding-on-board-state-v8";
const LABEL_STORAGE_KEY_PREFIX = "onboarding-on-board-labels-v3";
const DESCRIPTION_STORAGE_KEY_PREFIX = "onboarding-on-board-descriptions-v2";
const GROUP_TITLE_STORAGE_KEY_PREFIX = "onboarding-on-board-group-titles-v2";

const weeks: Week[] = [
  {
    title: "DAY1",
    subtitle: "출근 첫날 체크리스트",
    groups: [
      {
        id: "d1-1",
        groupTitle: "Ⅰ. 기본 목록",
        items: [
          { id: "d1-1-1", label: "PC 초기 설정 - Windows 비밀번호 변경" },
          { id: "d1-1-2", label: "PC 이름 설정" },
          { id: "d1-1-3", label: "부서원 연락망 확보" },
          { id: "d1-1-4", label: "직원 전화번호부 안내 확인" },
          { id: "d1-1-5", label: "규정집 위치 안내 확인" },
        ],
      },
      {
        id: "d1-2",
        groupTitle: "Ⅱ. 내부망",
        items: [
          { id: "d1-2-1", label: "그룹웨어 로그인 (SSO)" },
          { id: "d1-2-2", label: "메신저 설치" },
          { id: "d1-2-3", label: "내부망 파일전송시스템 설치" },
          { id: "d1-2-4", label: "부서 공용폴더 접속" },
          {
            id: "d1-2-5",
            label: "프린터 및 스캔 연결",
            description: "Box Operator 설치 및 스캔방법 안내",
          },
        ],
      },
      {
        id: "d1-3",
        groupTitle: "Ⅲ. 외부망",
        items: [
          { id: "d1-3-1", label: "VM FORT 설치" },
          { id: "d1-3-2", label: "외부망 파일전송시스템 설치" },
          { id: "d1-3-3", label: "메일 OTP 등록" },
        ],
      },
    ],
  },
  {
    title: "1회차",
    subtitle: "배치부서 이해",
    groups: [
      {
        id: "g1-1",
        groupTitle: "1-1. 배치부서 이해",
        items: [
          { id: "w1-1-1", label: "실 주요업무 이해" },
          { id: "w1-1-2", label: "실 운영수칙 및 준수사항 이해" },
          { id: "w1-1-3", label: "업무 이해관계자(농식품부, 관련 기관, 단체 등) 파악" },
          { id: "w1-1-4", label: "전화응대법 숙지" },
          { id: "w1-1-5", label: "이메일/쪽지 작성법 학습" },
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
          { id: "w2-1-3", label: "전년도 결과보고 분석" },
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
            label: "이해관계자 소통 노하우 전수",
            description: "현장점검, 현장간담회 등 운영 방법",
          },
          {
            id: "w6-1-2",
            label: "사업 점검 방법 습득",
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

function normalizeEmployeeId(value: string) {
  return value.trim();
}

function isValidEmployeeId(value: string) {
  return normalizeEmployeeId(value).length > 0;
}

function getSavedEmployeeId() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(EMPLOYEE_ID_STORAGE_KEY) ?? "";
}

function saveEmployeeId(employeeId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(EMPLOYEE_ID_STORAGE_KEY, normalizeEmployeeId(employeeId));
}

function getStorageKey(prefix: string, employeeId: string) {
  return `${prefix}_${normalizeEmployeeId(employeeId)}`;
}

function loadScopedState<T extends Record<string, string> | CheckState>(
  prefix: string,
  employeeId: string
): T | {} {
  if (typeof window === "undefined" || !employeeId) return {};
  return parseSavedState<T>(
    window.localStorage.getItem(getStorageKey(prefix, employeeId))
  );
}

export default function App() {
  const [selectedWeek, setSelectedWeek] = useState<WeekFilter>("전체");
  const [employeeIdInput, setEmployeeIdInput] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [employeeError, setEmployeeError] = useState("");

  const [state, setState] = useState<CheckState>({});
  const [editableLabels, setEditableLabels] = useState<LabelState>({});
  const [editableDescriptions, setEditableDescriptions] = useState<DescriptionState>({});
  const [editableGroupTitles, setEditableGroupTitles] = useState<GroupTitleState>({});
  const [editingField, setEditingField] = useState<EditingField>(null);

  useEffect(() => {
    const savedId = getSavedEmployeeId();
    if (!savedId) return;

    setEmployeeId(savedId);
    setEmployeeIdInput(savedId);
    setState(loadScopedState<CheckState>(STORAGE_KEY_PREFIX, savedId) as CheckState);
    setEditableLabels(loadScopedState<LabelState>(LABEL_STORAGE_KEY_PREFIX, savedId) as LabelState);
    setEditableDescriptions(
      loadScopedState<DescriptionState>(DESCRIPTION_STORAGE_KEY_PREFIX, savedId) as DescriptionState
    );
    setEditableGroupTitles(
      loadScopedState<GroupTitleState>(GROUP_TITLE_STORAGE_KEY_PREFIX, savedId) as GroupTitleState
    );
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !employeeId) return;
    window.localStorage.setItem(
      getStorageKey(STORAGE_KEY_PREFIX, employeeId),
      JSON.stringify(state)
    );
  }, [employeeId, state]);

  useEffect(() => {
    if (typeof window === "undefined" || !employeeId) return;
    window.localStorage.setItem(
      getStorageKey(LABEL_STORAGE_KEY_PREFIX, employeeId),
      JSON.stringify(editableLabels)
    );
  }, [employeeId, editableLabels]);

  useEffect(() => {
    if (typeof window === "undefined" || !employeeId) return;
    window.localStorage.setItem(
      getStorageKey(DESCRIPTION_STORAGE_KEY_PREFIX, employeeId),
      JSON.stringify(editableDescriptions)
    );
  }, [employeeId, editableDescriptions]);

  useEffect(() => {
    if (typeof window === "undefined" || !employeeId) return;
    window.localStorage.setItem(
      getStorageKey(GROUP_TITLE_STORAGE_KEY_PREFIX, employeeId),
      JSON.stringify(editableGroupTitles)
    );
  }, [employeeId, editableGroupTitles]);

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

  const handleEnter = () => {
    const normalized = normalizeEmployeeId(employeeIdInput);

    if (!isValidEmployeeId(normalized)) {
      setEmployeeError("사내 아이디를 입력해주세요.");
      return;
    }

    saveEmployeeId(normalized);
    setEmployeeId(normalized);
    setEmployeeIdInput(normalized);
    setEmployeeError("");
    setEditingField(null);

    setState(loadScopedState<CheckState>(STORAGE_KEY_PREFIX, normalized) as CheckState);
    setEditableLabels(loadScopedState<LabelState>(LABEL_STORAGE_KEY_PREFIX, normalized) as LabelState);
    setEditableDescriptions(
      loadScopedState<DescriptionState>(DESCRIPTION_STORAGE_KEY_PREFIX, normalized) as DescriptionState
    );
    setEditableGroupTitles(
      loadScopedState<GroupTitleState>(GROUP_TITLE_STORAGE_KEY_PREFIX, normalized) as GroupTitleState
    );
  };

  const handleResetEmployee = () => {
    setEmployeeId("");
    setEmployeeIdInput("");
    setEmployeeError("");
    setState({});
    setEditableLabels({});
    setEditableDescriptions({});
    setEditableGroupTitles({});
    setEditingField(null);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(EMPLOYEE_ID_STORAGE_KEY);
    }
  };

  if (!employeeId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-6">
        <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
          <div className="w-full rounded-3xl bg-white p-8 shadow-xl">
            <h1 className="text-3xl font-bold">
              EPIS 가디언즈
              <span className="block text-emerald-600">ON Board</span>
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              사내 아이디를 입력하면
              <br />
              해당 아이디 기준으로 체크리스트가 저장됩니다.
            </p>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                사내 아이디
              </label>
              <input
                value={employeeIdInput}
                onChange={(e) => setEmployeeIdInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleEnter();
                }}
                placeholder="사내 아이디를 입력하세요"
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
              />
              {employeeError && (
                <p className="mt-2 text-sm text-red-600">{employeeError}</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleEnter}
              className="mt-5 w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white"
            >
              입장하기
            </button>
          </div>
        </div>
      </div>
    );
  }

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

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-700">
                사내 아이디: {employeeId}
              </span>
              <button
                type="button"
                onClick={handleResetEmployee}
                className="rounded-full border border-gray-300 bg-white px-3 py-1 text-gray-700"
              >
                아이디 변경
              </button>
            </div>
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
          {(["전체", "DAY1", "1회차", "2회차", "3회차", "4회차", "5회차", "6회차"] as WeekFilter[]).map((w) => (
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

        {filtered.map((week) => {
          const isDay1 = week.title === "DAY1";
          const weekTasks = week.groups.flatMap((g) => g.items);
          const weekDone = weekTasks.length > 0 && weekTasks.every((item) => state[item.id]?.checked);

          return (
            <div
              key={week.title}
              className="mb-5 rounded-3xl bg-white p-5 shadow"
            >
              <div className="mb-2 flex items-center gap-2">
                <h2 className="font-bold">{week.title}</h2>
                {isDay1 && (
                  <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs text-white">
                    첫날
                  </span>
                )}
                {weekDone && (
                  <span className="rounded-full bg-yellow-400 px-2 py-0.5 text-xs text-black">
                    🎉 {isDay1 ? "첫날 완료" : `${week.title} 완료`}
                  </span>
                )}
              </div>

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
                                  setEditingField(isEditingItem ? null : { type: "item", id: item.id })
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
          );
        })}
      </div>
    </div>
  );
}