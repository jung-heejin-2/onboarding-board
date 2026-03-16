type Role = "mentor" | "mentee";
type WeekFilter = "전체" | "1주차" | "2주차" | "3주차" | "4주차";

type Task = {
  id: string;
  label: string;
  description?: string;
};

type Week = {
  title: Exclude<WeekFilter, "전체">;
  subtitle: string;
  tasks: Task[];
};

type CheckItem = {
  mentor: boolean;
  mentee: boolean;
  mentorComment: string;
  menteeComment: string;
};

type CheckState = Record<string, CheckItem>;

type MenteeBoard = {
  id: string;
  name: string;
};

const menteeBoards: MenteeBoard[] = [
  { id: "mentee-1", name: "농정원" },
  { id: "mentee-2", name: "농정투" },
  { id: "mentee-3", name: "농정쓰리" },
  { id: "mentee-4", name: "농정포" },
  { id: "mentee-5", name: "농정파이브" },
];

const W1_4_DESCRIPTION = [
  "1. 사내메신저 설정(쪽지 발송, 검색, 개인그룹, 머리말 등)",
  "2. 외부메일 설정(OTP 등록, QR 컴퓨터 등록)",
].join("\n");

const STORAGE_KEY = "onboarding-on-board-state-v1";

const weeks: Week[] = [
  {
    title: "1주차",
    subtitle: "기본 적응",
    tasks: [
      {
        id: "w1-1",
        label: "그룹웨어 기본 사용",
        description: "복무·출장 입력, 게시판 경로 찾기",
      },
      {
        id: "w1-2",
        label: "조직 구성원 파악",
        description: "조직도(연락망) 확인 및 전화기 사용법",
      },
      {
        id: "w1-3",
        label: "업무 자료 탐색",
        description: "부서 문서 검색, 전체 문서 검색, 공유디스크 검색",
      },
      {
        id: "w1-4",
        label: "소프트웨어 사용법",
        description: W1_4_DESCRIPTION,
      },
    ],
  },
  {
    title: "2주차",
    subtitle: "업무 이해",
    tasks: [
      {
        id: "w2-1",
        label: "팀 업무 구조 파악",
        description: "연간 업무 일정 및 업무분장 파악",
      },
      {
        id: "w2-2",
        label: "예산지침 및 편성내역",
        description: "2026년 예산지침 및 편성 내역자료 공유 및 설명",
      },
      {
        id: "w2-3",
        label: "전자결재 작성 및 상신 절차 이해",
        description: "기안문 작성법, 결재선 지정, 회수 및 재상신 등",
      },
      {
        id: "w2-4",
        label: "담당 사업 관련 인수인계",
        description: "ex) 제안 평가 준비, 회의 준비 등",
      },
    ],
  },
  {
    title: "3주차",
    subtitle: "실무 확장",
    tasks: [
      {
        id: "w3-1",
        label: "계획안 기안 및 전자결재 상신",
        description: "기안문 작성 및 상신 교육 및 실습",
      },
      {
        id: "w3-2",
        label: "결과보고 작성 및 등록",
        description: "결과보고 작성 및 상신 교육 및 실습",
      },
      {
        id: "w3-3",
        label: "지출결의 작성 및 증빙 처리",
        description: "지출 결의 및 증빙 처리 교육 및 실습",
      },
      {
        id: "w3-4",
        label: "멘토 피드백 및 수정 보완",
        description: "실습 내용 확인 및 피드백 제공",
      },
    ],
  },
  {
    title: "4주차",
    subtitle: "최종 점검",
    tasks: [
      {
        id: "w4-1",
        label: "업무 단독 처리 시뮬레이션",
        description: "멘토의 도움 없이 단독으로 업무를 처리해봐요!",
      },
      {
        id: "w4-2",
        label: "보고 라인 및 일정 관리 점검",
        description: "4주간 멘티가 진행했던 업무를 다시 한 번 점검해보아요!",
      },
      {
        id: "w4-3",
        label: "온보딩 회고 면담",
        description: "4주간의 프로그램은 어땠나요?",
      },
      {
        id: "w4-4",
        label: "개인 업무 목표 설정",
        description: "추후 업무 계획을 세워보아요!",
      },
    ],
  },
];

function createInitialBoards(): Record<string, CheckState> {
  return menteeBoards.reduce<Record<string, CheckState>>((acc, mentee) => {
    acc[mentee.id] = {};
    return acc;
  }, {});
}

function createEmptyCheckItem(): CheckItem {
  return {
    mentor: false,
    mentee: false,
    mentorComment: "",
    menteeComment: "",
  };
}

export function getUpdatedChecks(
  prev: CheckState,
  taskId: string,
  owner: Role,
  currentRole: Role
): CheckState {
  if (owner !== currentRole) {
    return prev;
  }

  const current = prev[taskId] ?? createEmptyCheckItem();

  return {
    ...prev,
    [taskId]: {
      mentor: owner === "mentor" ? !current.mentor : current.mentor,
      mentee: owner === "mentee" ? !current.mentee : current.mentee,
      mentorComment: current.mentorComment,
      menteeComment: current.menteeComment,
    },
  };
}

export function updateTaskComment(
  prev: CheckState,
  taskId: string,
  owner: Role,
  currentRole: Role,
  value: string
): CheckState {
  if (owner !== currentRole) {
    return prev;
  }

  const current = prev[taskId] ?? createEmptyCheckItem();

  return {
    ...prev,
    [taskId]: {
      mentor: current.mentor,
      mentee: current.mentee,
      mentorComment: owner === "mentor" ? value : current.mentorComment,
      menteeComment: owner === "mentee" ? value : current.menteeComment,
    },
  };
}

export function filterWeeks(data: Week[], selectedWeek: WeekFilter, search: string): Week[] {
  const normalizedSearch = search.trim().toLowerCase();

  return data
    .filter((week) => selectedWeek === "전체" || week.title === selectedWeek)
    .map((week) => ({
      ...week,
      tasks: week.tasks.filter((task) => {
        if (normalizedSearch === "") return true;
        const searchable = `${task.label} ${task.description ?? ""}`.toLowerCase();
        return searchable.includes(normalizedSearch);
      }),
    }))
    .filter((week) => week.tasks.length > 0 || normalizedSearch === "");
}

export function serializeBoardState(state: Record<string, CheckState>): string {
  return JSON.stringify(state);
}

export function parseBoardState(value: string | null): Record<string, CheckState> {
  if (!value) {
    return createInitialBoards();
  }

  try {
    const parsed = JSON.parse(value) as Record<string, CheckState>;
    const initialBoards = createInitialBoards();

    return Object.keys(initialBoards).reduce<Record<string, CheckState>>((acc, boardId) => {
      acc[boardId] = parsed[boardId] ?? {};
      return acc;
    }, {});
  } catch {
    return createInitialBoards();
  }
}

export const testCases = [
  {
    name: "멘티 모드에서는 멘토 체크를 변경하지 않음",
    input: getUpdatedChecks({}, "w1-1", "mentor", "mentee"),
    expected: {},
  },
  {
    name: "멘토 모드에서 멘토 체크를 토글함",
    input: getUpdatedChecks({}, "w1-1", "mentor", "mentor"),
    expected: {
      "w1-1": { mentor: true, mentee: false, mentorComment: "", menteeComment: "" },
    },
  },
  {
    name: "검색어가 설명에도 반응함",
    input: filterWeeks(weeks, "1주차", "otp 등록"),
    expectedLength: 1,
  },
  {
    name: "멘티 보드가 5개 생성됨",
    input: createInitialBoards(),
    expectedBoardCount: 5,
  },
  {
    name: "멘토 모드에서 멘토 의견만 저장됨",
    input: updateTaskComment({}, "w1-1", "mentor", "mentor", "멘토 메모"),
    expected: {
      "w1-1": { mentor: false, mentee: false, mentorComment: "멘토 메모", menteeComment: "" },
    },
  },
  {
    name: "멘티 모드에서는 멘토 의견을 수정하지 못함",
    input: updateTaskComment({}, "w1-1", "mentor", "mentee", "수정 시도"),
    expected: {},
  },
  {
    name: "기존 체크 상태를 유지한 채 멘티 의견을 저장함",
    input: updateTaskComment(
      { "w1-1": { mentor: true, mentee: false, mentorComment: "확인", menteeComment: "" } },
      "w1-1",
      "mentee",
      "mentee",
      "멘티 의견"
    ),
    expected: {
      "w1-1": { mentor: true, mentee: false, mentorComment: "확인", menteeComment: "멘티 의견" },
    },
  },
  {
    name: "멘토 체크 토글 시 기존 멘트는 유지됨",
    input: getUpdatedChecks(
      {
        "w1-2": {
          mentor: false,
          mentee: true,
          mentorComment: "가이드 완료",
          menteeComment: "확인했습니다",
        },
      },
      "w1-2",
      "mentor",
      "mentor"
    ),
    expected: {
      "w1-2": {
        mentor: true,
        mentee: true,
        mentorComment: "가이드 완료",
        menteeComment: "확인했습니다",
      },
    },
  },
  {
    name: "설명 줄바꿈 문자열이 그대로 보존됨",
    input: weeks[0].tasks[3].description,
    expected: W1_4_DESCRIPTION,
  },
  {
    name: "설명이 없는 항목도 검색어 없으면 유지됨",
    input: filterWeeks(weeks, "2주차", ""),
    expectedLength: 1,
  },
  {
    name: "2주차 설명 검색이 동작함",
    input: filterWeeks(weeks, "2주차", "예산지침"),
    expectedLength: 1,
  },
  {
    name: "설명 컴포넌트용 문자열 상수에 줄바꿈이 포함됨",
    input: W1_4_DESCRIPTION.includes("\n"),
    expected: true,
  },
  {
    name: "저장 상태 직렬화 후 다시 복원 가능",
    input: parseBoardState(
      serializeBoardState({
        "mentee-1": {
          "w1-1": { mentor: true, mentee: false, mentorComment: "ok", menteeComment: "" },
        },
        "mentee-2": {},
        "mentee-3": {},
        "mentee-4": {},
        "mentee-5": {},
      })
    ),
    expected: {
      "mentee-1": {
        "w1-1": { mentor: true, mentee: false, mentorComment: "ok", menteeComment: "" },
      },
      "mentee-2": {},
      "mentee-3": {},
      "mentee-4": {},
      "mentee-5": {},
    },
  },
  {
    name: "잘못된 저장값이면 초기 상태로 복구됨",
    input: parseBoardState("not-json"),
    expectedBoardCount: 5,
  },
];

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3 text-center">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs text-slate-300">{label}</div>
    </div>
  );
}

function RoleButton({
  value,
  label,
  currentRole,
  onClick,
}: {
  value: Role;
  label: string;
  currentRole: Role;
  onClick: (role: Role) => void;
}) {
  const active = currentRole === value;

  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`rounded-2xl px-4 py-2 text-sm font-semibold transition-all ${
        active
          ? "bg-emerald-600 text-white shadow-lg"
          : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}

function PersonButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-4 py-2 text-sm font-semibold transition-all ${
        active
          ? "bg-slate-900 text-white shadow-lg"
          : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}

function TaskDescription({ description }: { description?: string }) {
  if (!description) {
    return <div className="mt-1 text-xs text-slate-500">텍스트는 추후 자유롭게 수정 가능합니다.</div>;
  }

  return <div className="mt-1 whitespace-pre-line text-xs text-slate-500">{description}</div>;
}

export default function OnboardingOnBoardDashboard() {
  const [role, setRole] = useState<Role>("mentee");
  const [search, setSearch] = useState("");
  const [selectedWeek, setSelectedWeek] = useState<WeekFilter>("전체");
  const [selectedBoardId, setSelectedBoardId] = useState<string>(menteeBoards[0].id);
  const [boardChecks, setBoardChecks] = useState<Record<string, CheckState>>(() => {
    if (typeof window === "undefined") {
      return createInitialBoards();
    }

    return parseBoardState(window.localStorage.getItem(STORAGE_KEY));
  });

  const selectedBoard = menteeBoards.find((board) => board.id === selectedBoardId) ?? menteeBoards[0];
  const currentChecks = boardChecks[selectedBoard.id] ?? {};

  const filteredWeeks = useMemo(() => filterWeeks(weeks, selectedWeek, search), [selectedWeek, search]);

  const totalTasks = weeks.reduce((acc, week) => acc + week.tasks.length, 0);
  const mentorDone = Object.values(currentChecks).filter((item) => item.mentor).length;
  const menteeDone = Object.values(currentChecks).filter((item) => item.mentee).length;
  const bothDone = Object.values(currentChecks).filter((item) => item.mentor && item.mentee).length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((bothDone / totalTasks) * 100);

  const toggleCheck = (taskId: string, owner: Role) => {
    setBoardChecks((prev) => {
      const boardState = prev[selectedBoard.id] ?? {};
      return {
        ...prev,
        [selectedBoard.id]: getUpdatedChecks(boardState, taskId, owner, role),
      };
    });
  };

  const handleCommentChange = (taskId: string, owner: Role, value: string) => {
    setBoardChecks((prev) => {
      const boardState = prev[selectedBoard.id] ?? {};
      return {
        ...prev,
        [selectedBoard.id]: updateTaskComment(boardState, taskId, owner, role, value),
      };
    });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, serializeBoardState(boardChecks));
  }, [boardChecks]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 text-slate-800">
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <div className="mb-6 overflow-hidden rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                ON 보드 · 온보딩 체크리스트
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                멘토와 멘티가 함께 보는
                <span className="block text-emerald-600">온보딩 ON 보드</span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                멘토와 멘티가 역할과 이름을 선택한 뒤, 각 보드에서 1주차부터 4주차까지 진행 상황을 함께 체크할 수 있는 대시보드입니다.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <RoleButton value="mentor" label="멘토 모드" currentRole={role} onClick={setRole} />
                <RoleButton value="mentee" label="멘티 모드" currentRole={role} onClick={setRole} />
                <span className="ml-1 rounded-full bg-slate-100 px-3 py-2 text-xs text-slate-600">
                  현재 선택: {role === "mentor" ? "멘토" : "멘티"}
                </span>
              </div>

              <div className="mt-5">
                <div className="mb-2 text-sm font-semibold text-slate-700">진행할 보드 선택</div>
                <div className="flex flex-wrap gap-2">
                  {menteeBoards.map((board) => (
                    <PersonButton
                      key={board.id}
                      label={board.name}
                      active={board.id === selectedBoard.id}
                      onClick={() => setSelectedBoardId(board.id)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[24px] bg-slate-900 p-5 text-white shadow-lg">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-400">현재 보드</div>
                  <div className="text-lg font-bold">{selectedBoard.name}</div>
                </div>
                <div className="rounded-full bg-white/10 px-3 py-1 text-xs">
                  {role === "mentor" ? "멘토 화면" : "멘티 화면"}
                </div>
              </div>

              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-slate-300">공동 완료율</span>
                <span className="font-semibold">{progressPercent}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-700">
                <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <StatCard value={mentorDone} label="멘토 체크" />
                <StatCard value={menteeDone} label="멘티 체크" />
                <StatCard value={bothDone} label="공동 완료" />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="교육명 검색"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-400"
            />
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value as WeekFilter)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400"
            >
              <option value="전체">전체</option>
              <option value="1주차">1주차</option>
              <option value="2주차">2주차</option>
              <option value="3주차">3주차</option>
              <option value="4주차">4주차</option>
            </select>
          </div>

          <div className="rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800 ring-1 ring-amber-200">
            현재 선택한 보드에서만 체크가 반영됩니다.
            <br />
            멘토는 멘토 칸, 멘티는 멘티 칸만 수정됩니다.
          </div>
        </div>

        <div className="mb-4 rounded-[24px] border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
          <span className="font-semibold">선택 중:</span> {selectedBoard.name} · {role === "mentor" ? "멘토" : "멘티"}
          <div className="mt-2 text-xs text-emerald-700">체크와 코멘트는 이 브라우저에 자동 저장됩니다.</div>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {filteredWeeks.map((week) => (
            <section key={week.title} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-end justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{week.title}</h2>
                  <p className="text-sm text-slate-500">{week.subtitle}</p>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {week.tasks.length}개 항목
                </div>
              </div>

              <div className="space-y-3">
                {week.tasks.map((task) => {
                  const mentorChecked = currentChecks[task.id]?.mentor ?? false;
                  const menteeChecked = currentChecks[task.id]?.mentee ?? false;
                  const mentorComment = currentChecks[task.id]?.mentorComment ?? "";
                  const menteeComment = currentChecks[task.id]?.menteeComment ?? "";

                  return (
                    <div key={task.id} className="rounded-2xl border border-slate-200 p-4 transition hover:shadow-sm">
                      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{task.label}</div>
                          <TaskDescription description={task.description} />
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleCheck(task.id, "mentor")}
                          className={`flex min-w-[96px] items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                            mentorChecked
                              ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300"
                              : "bg-slate-50 text-slate-600 ring-1 ring-slate-200"
                          } ${role !== "mentor" ? "cursor-not-allowed opacity-60" : "hover:-translate-y-0.5"}`}
                          disabled={role !== "mentor"}
                        >
                          <span className={`h-2.5 w-2.5 rounded-full ${mentorChecked ? "bg-emerald-500" : "bg-slate-300"}`} />
                          멘토 체크
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleCheck(task.id, "mentee")}
                          className={`flex min-w-[96px] items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                            menteeChecked
                              ? "bg-cyan-100 text-cyan-700 ring-1 ring-cyan-300"
                              : "bg-slate-50 text-slate-600 ring-1 ring-slate-200"
                          } ${role !== "mentee" ? "cursor-not-allowed opacity-60" : "hover:-translate-y-0.5"}`}
                          disabled={role !== "mentee"}
                        >
                          <span className={`h-2.5 w-2.5 rounded-full ${menteeChecked ? "bg-cyan-500" : "bg-slate-300"}`} />
                          멘티 체크
                        </button>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div className="rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-100">
                          <div className="mb-2 text-xs font-semibold text-emerald-700">멘토 멘트</div>
                          <textarea
                            value={mentorComment}
                            onChange={(e) => handleCommentChange(task.id, "mentor", e.target.value)}
                            placeholder="멘토 코멘트를 입력하세요"
                            disabled={role !== "mentor"}
                            className="min-h-[96px] w-full rounded-2xl border border-emerald-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                          />
                        </div>

                        <div className="rounded-2xl bg-cyan-50 p-3 ring-1 ring-cyan-100">
                          <div className="mb-2 text-xs font-semibold text-cyan-700">멘티 멘트</div>
                          <textarea
                            value={menteeComment}
                            onChange={(e) => handleCommentChange(task.id, "mentee", e.target.value)}
                            placeholder="멘티 코멘트를 입력하세요"
                            disabled={role !== "mentee"}
                            className="min-h-[96px] w-full rounded-2xl border border-cyan-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
