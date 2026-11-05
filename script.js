/**
 * Dokdo Elementary School (독도초등학교) - Main Script
 * Vanilla JavaScript implementation for dynamic calendar, lunch menu, notices, gallery,
 * Participatory School Budget (학교 참여예산제), and modal interactions.
 */

// ==========================================================================
// 1. SAMPLE DATA MANAGEMENT
// ==========================================================================

const NOTICES_DATA = [
    {
        id: 1,
        category: "가정통신문",
        title: "[가정통신문] 2026학년도 2학기 방과후학교 수강 신청 안내",
        date: "2026.08.08",
        author: "교무기획부",
        views: 142,
        content: `학부모님 안녕하십니까?\n\n2026학년도 2학기 독도초등학교 방과후학교 수강 신청을 다음과 같이 안내해 드립니다. 아이들의 잠재력을 키우고 다양한 특기를 발달시킬 수 있도록 많은 관심과 참여 바랍니다.\n\n1. 신청 기간: 2026.08.12(수) ~ 08.18(화)\n2. 개설 강좌: 독도 생태 탐구, 코딩&로봇교실, 해양 바이올린, 독도 역사 탐방, 영어 연극\n3. 수강료: 전액 학교 지원 (무상 교육)\n4. 신청 방법: 학교 홈페이지 신청 시스템 또는 서면 제출`
    },
    {
        id: 2,
        category: "공지",
        title: "2026학년도 독도 사랑 어린이 글짓기 및 미술 대회 개최",
        date: "2026.08.05",
        author: "체육예술부",
        views: 215,
        content: `독도초등학교 어린이들의 창의성과 애향심을 고취하기 위해 '독도 사랑 글짓기 및 미술 대회'를 개최합니다.\n\n- 일시: 2026년 8월 21일(금) 09:00 ~ 12:00\n- 대상: 전교생 (1~6학년)\n- 주제: 독도의 아름다운 자연과 우리의 꿈\n- 시상: 각 학년별 최우수상(1명), 우수상(2명), 장려상(3명) 교육장상 수여`
    },
    {
        id: 3,
        category: "행사",
        title: "[안내] 8월 독도 해양 생태 현장체험학습 참가 안내",
        date: "2026.08.02",
        author: "체험학습부",
        views: 310,
        content: `여름 학기를 맞아 독도 동도 생태 탐방로와 바다 생물 관찰 현장체험학습이 실시됩니다.\n\n- 일시: 2026년 8월 14일(금)\n- 준비물: 편안한 운동화, 모자, 개인 수분 보충용 텀블러, 탐구 단디 장갑\n- 안전 수칙: 교사 및 해양안전요원의 지시에 절대 복종하며 개별 행동 금지`
    },
    {
        id: 4,
        category: "공지",
        title: "독도초등학교 스마트 AI 교실 개관 및 기자재 보급 안내",
        date: "2026.07.28",
        author: "정보화부",
        views: 189,
        content: `우리 학교에 최신 AI 및 AR/VR 교육이 가능한 '스마트 미래 교실'이 완공되었습니다. 전교생에게 1인 1태블릿PC가 지원되며 8월부터 본격적인 ICT 수업이 진행될 예정입니다.`
    },
    {
        id: 5,
        category: "가정통신문",
        title: "[가정통신문] 여름철 감염병 예방 및 건강 관리 수칙 안내",
        date: "2026.07.20",
        author: "보건실",
        views: 98,
        content: `여름철 식중독 및 온열 질환 예방을 위한 보건 소식입니다.\n\n- 손 씻기 생활화 (흐르는 물에 30초 이상)\n- 충분한 수분 섭취 및 음수 위생 관리\n- 야외 활동 시 자외선 차단제 바르기`
    }
];

const ACADEMIC_EVENTS = [
    { date: "2026-08-01", title: "여름방학 개학식", category: "학사일정", desc: "2학기 시작 및 전교생 등교", isImportant: true },
    { date: "2026-08-10", title: "전교 어린이회 총회", category: "학생회", desc: "어린이 회장단 2학기 공약 발표", isImportant: false },
    { date: "2026-08-14", title: "독도 해양 생태 탐방", category: "체험학습", desc: "동도 탐방로 및 해양생물 관찰", isImportant: true },
    { date: "2026-08-21", title: "독도 사랑 대회", category: "대회", desc: "글짓기 & 사생대회 진행", isImportant: false },
    { date: "2026-08-28", title: "학부모 공개수업의 날", category: "행사", desc: "전 학급 수업 공개 및 학부모 간담회", isImportant: true },

    { date: "2026-09-04", title: "독도 동아리 발표회", category: "동아리", desc: "1학기 동아리 성과 전시", isImportant: false },
    { date: "2026-09-17", title: "독도초 가을 한마당 운동회", category: "체육", desc: "청군 백군 명랑운동회", isImportant: true },
    { date: "2026-09-24", title: "추석 맞이 민속놀이 체험", category: "행사", desc: "송편 만들기 및 윷놀이", isImportant: false },

    { date: "2026-10-09", title: "한글날 기념 시울림 대회", category: "행사", desc: "아름다운 우리말 시 낭송", isImportant: false },
    { date: "2026-10-25", title: "🎉 독도의 날 축제", category: "특별행사", desc: "전국독도사랑 전교생 특별 전시회", isImportant: true }
];

const LUNCH_MENU_DATA = {
    "2026-08-10": {
        dateStr: "2026.08.10 (월)",
        title: "월요일의 영양 듬뿍 특식",
        typeBadge: "한식 특식",
        calorie: "585 kcal",
        origin: "국내산 (독도산 해산물)",
        img: "assets/lunch.jpg",
        items: [
            "친환경 찰보리밥",
            "독도 맑은 전복 미역국 🍲",
            "수제 닭강정 (달콤한 맛) 🍗",
            "브로콜리 에그 샐러드 🥗",
            "배추김치 & 오이피클 🥒",
            "생생 우유 & 생딸기 🍓"
        ],
        allergy: "①난류 ②우유 ⑤대두 ⑥밀 ⑮조개류(전복)"
    },
    "2026-08-11": {
        dateStr: "2026.08.11 (화)",
        title: "세계 요리의 날 - 이탈리안 런치",
        typeBadge: "양식Day",
        calorie: "610 kcal",
        origin: "국내산 무항생제 돼지고기",
        img: "assets/lunch.jpg",
        items: [
            "수제 해산물 토마토 파스타 🍝",
            "수제 돈가스 & 브라운 소스 🥩",
            "가든 그린 샐러드 & 오리엔탈 🥗",
            "수제 마늘 바게트 빵 🥖",
            "수제 수박 에이드 🍉",
            "친환경 우유 🥛"
        ],
        allergy: "①난류 ②우유 ⑤대두 ⑥밀 ⑦돼지고기 ⑩계란"
    },
    "2026-08-12": {
        dateStr: "2026.08.12 (수)",
        title: "수요일은 다 먹는 날 (수다날)",
        typeBadge: "인기 식단",
        calorie: "590 kcal",
        origin: "국내산 (한우 & 독도 오징어)",
        img: "assets/lunch.jpg",
        items: [
            "독도 오징어 비빔밥 & 약고추장 🦑",
            "시원한 팽이버섯 콩나물국 🥣",
            "수제 단호박 튀김 🎃",
            "열무김치 🥬",
            "블루베리 요거트 🫐",
            "고칼슘 칼슘우유 🥛"
        ],
        allergy: "②우유 ⑤대두 ⑥밀 ⑬오징어"
    }
};

const BUDGET_IDEAS_SAMPLE = [
    {
        id: 1001,
        title: "학교 운동장 친환경 잔디 & 안전 트랙 개선",
        desc: "어린이들이 체육시간이나 쉬는 시간에 마음껏 뛰어놀 수 있도록 천연 잔디 구장 보수와 미끄럼 방지 친환경 트랙을 조성해 주세요.",
        author: "김지훈 (학부모)",
        phone: "010-3849-1029",
        date: "2026.08.09",
        votes: 42
    },
    {
        id: 1002,
        title: "어린이 독서 쉼터 & 북카페 공간 조성",
        desc: "도서관 옆 빈 공간에 푹신한 소파와 독도 바다 풍경을 보며 책을 읽을 수 있는 햇살 북카페 쉼터를 만들어 주세요.",
        author: "이서연 (학생회장)",
        phone: "010-4820-9912",
        date: "2026.08.07",
        votes: 35
    },
    {
        id: 1003,
        title: "독도 자생 식물 탐구 화단 & 생태 정원",
        desc: "독도 해국과 향나무를 관찰하고 학생들이 직접 가꿀 수 있는 생태 체험 화단을 학교 앞뜰에 설치하면 좋겠습니다.",
        author: "박민준 (6학년)",
        phone: "010-5712-3344",
        date: "2026.08.05",
        votes: 28
    },
    {
        id: 1004,
        title: "학생 휴게 공간 및 힐링 라운지 설치",
        desc: "비가 오거나 해풍이 강한 날 실내에서 전교생이 보드게임과 쉼을 즐길 수 있는 층별 힐링 쉼터 공간 조성을 제안합니다.",
        author: "최유진 (학부모)",
        phone: "010-8901-2233",
        date: "2026.08.02",
        votes: 19
    },
    {
        id: 1005,
        title: "방과후학교 및 동아리 스포츠 용품 확충",
        desc: "방과후 배드민턴, 축구, 해양 탐사 동아리 활성화를 위해 최신 스포츠 교구와 안전 장비를 확충해 주세요.",
        author: "강현우 (교사)",
        phone: "010-6543-7788",
        date: "2026.07.28",
        votes: 15
    }
];

const SCHOOL_NEWS_DATA = [
    {
        id: 101,
        category: "과학/체험",
        title: "2026 독도 어린이 미래 창의 과학 싹 잔치 현장",
        date: "2026.08.07",
        desc: "스마트 미래 교실에서 진행된 로봇 코딩 및 화학 반응 탐구 체험활동 현장입니다. 어린이들이 직접 미니 로봇을 조종하며 창의성을 발휘했습니다.",
        img: "assets/news_science.jpg",
        views: 340,
        author: "과학부",
        content: `지난 8월 7일 독도초등학교 스마트 미래 실습실에서 '2026 미래 과학 싹 잔치'가 개최되었습니다.\n\n학생들은 3D 프린팅 펜 작업, 로봇 장애물 경기, 색깔 변화 화학 반응 탐구 등 다양한 부스 체험을 진행하며 과학의 원리를 쉽고 재미있게 탐구했습니다.\n\n6학년 박준서 학생은 "직접 코딩한 로봇이 독도 지도를 따라 움직이는 것이 너무 신기하고 뿌듯했다"고 소감을 전했습니다.`
    },
    {
        id: 102,
        category: "생태/탐방",
        title: "푸른 동해를 지키는 독도 생태 탐사대 활동",
        date: "2026.08.01",
        desc: "우리 학교 4~6학년 학생들이 독도 해양 자생 생물 탐사 활동을 진행하였습니다. 괭이갈매기와 해국을 직접 관찰하고 환경보호 피켓 활동을 다짐했습니다.",
        img: "assets/news_eco.jpg",
        views: 290,
        author: "생태환경부",
        content: `독도초등학교 해양 생태 탐사대가 독도 동도 탐방로와 해안가 주변 생태 조사를 마쳤습니다.\n\n학생들은 돋보기와 돋보기 카메라를 이용해 독도에 자생하는 해국, 섬기린초 및 독도 바다 속 해양 미생물을 직접 관찰하고 기록장에 꼼꼼히 기록했습니다.\n\n우리 학교는 앞으로도 지속가능한 독도 환경교육을 강화할 예정입니다.`
    },
    {
        id: 103,
        category: "체육/행사",
        title: "함께 뛰어노는 독도 어린이 한마람 봄 체육대회",
        date: "2026.07.15",
        desc: "맑은 청정 하늘 아래 펼쳐진 체육대회 현장! 청군과 백군으로 나뉘어 릴레이 달리기, 대형 공 굴리기 등 즐거운 화합의 장을 만들었습니다.",
        img: "assets/news_sports.jpg",
        views: 450,
        author: "체육부",
        content: `독도초등학교 운동장에서 전교생과 교직원이 함께하는 한마음 체육대회가 개최되었습니다.\n\n장애물 달리기, 박터뜨리기, 부모님과 함께하는 줄다리기 등 알찬 프로그램으로 모두가 웃음꽃을 피웠습니다. 모든 경기 후 참가한 어린이 전원에게 건강 상장과 기념 스티커가 전달되었습니다.`
    }
];

// ==========================================================================
// 2. STATE & LOCALSTORAGE STORAGE KEYS
// ==========================================================================
let currentNoticeFilter = "all";
let currentCalendarYear = 2026;
let currentCalendarMonth = 7; // 0-indexed (7 = August)
let budgetSortMode = "votes"; // "votes" or "newest"

const STORAGE_KEY_IDEAS = "dokdo_budget_ideas_v1";
const STORAGE_KEY_VOTES = "dokdo_voted_ideas_v1";

// Privacy Helper: Phone Number Masking (e.g., 010-1234-5678 -> 010-****-5678)
function maskPhoneNumber(phoneStr) {
    if (!phoneStr) return "010-****-****";
    const cleaned = phoneStr.replace(/[^0-9]/g, '');
    if (cleaned.length === 11) {
        return `${cleaned.slice(0, 3)}-****-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
        return `${cleaned.slice(0, 3)}-***-${cleaned.slice(6)}`;
    } else if (cleaned.length >= 7) {
        return `${cleaned.slice(0, 3)}-****-${cleaned.slice(-4)}`;
    }
    return phoneStr;
}

// LocalStorage Budget Ideas Manager
function getStoredBudgetIdeas() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_IDEAS);
        if (raw) return JSON.parse(raw);
    } catch (e) {
        console.warn("Failed to load local storage ideas", e);
    }
    localStorage.setItem(STORAGE_KEY_IDEAS, JSON.stringify(BUDGET_IDEAS_SAMPLE));
    return BUDGET_IDEAS_SAMPLE;
}

function saveStoredBudgetIdeas(ideas) {
    try {
        localStorage.setItem(STORAGE_KEY_IDEAS, JSON.stringify(ideas));
    } catch (e) {
        console.error("Failed to save local storage ideas", e);
    }
}

function getStoredVotedIds() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_VOTES);
        if (raw) return JSON.parse(raw);
    } catch (e) {
        console.warn("Failed to load voted IDs", e);
    }
    return [];
}

function addVotedId(id) {
    const list = getStoredVotedIds();
    if (!list.includes(id)) {
        list.push(id);
        try {
            localStorage.setItem(STORAGE_KEY_VOTES, JSON.stringify(list));
        } catch (e) {
            console.error("Failed to save voted ID", e);
        }
    }
}

// ==========================================================================
// 3. INITIALIZATION & EVENT LISTENERS
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initTodayDateDisplay();
    renderNotices();
    renderCalendar();
    renderLunchMenu();
    renderParticipatoryBudget();
    renderSchoolNews();
    initModalEvents();
});

// ==========================================================================
// 4. NAVIGATION & MOBILE DRAWER
// ==========================================================================
function initNavigation() {
    const mobileToggle = document.getElementById("mobileToggle");
    const mobileDrawer = document.getElementById("mobileDrawer");
    const drawerClose = document.getElementById("drawerClose");
    const drawerOverlay = document.getElementById("drawerOverlay");
    const drawerLinks = document.querySelectorAll(".drawer-link");

    function openMenu() {
        mobileToggle.classList.add("active");
        mobileToggle.setAttribute("aria-expanded", "true");
        mobileDrawer.classList.add("open");
        drawerOverlay.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeMenu() {
        mobileToggle.classList.remove("active");
        mobileToggle.setAttribute("aria-expanded", "false");
        mobileDrawer.classList.remove("open");
        drawerOverlay.classList.remove("active");
        document.body.style.overflow = "";
    }

    if (mobileToggle) mobileToggle.addEventListener("click", () => {
        mobileDrawer.classList.contains("open") ? closeMenu() : openMenu();
    });

    if (drawerClose) drawerClose.addEventListener("click", closeMenu);
    if (drawerOverlay) drawerOverlay.addEventListener("click", closeMenu);

    drawerLinks.forEach(link => {
        link.addEventListener("click", closeMenu);
    });

    // Smooth Scrolling & Active Link Highlighting
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll("section[id]");

    window.addEventListener("scroll", () => {
        let currentSection = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${currentSection}`) {
                link.classList.add("active");
            }
        });
    });
}

function initTodayDateDisplay() {
    const dateDisplay = document.getElementById("todayDateDisplay");
    if (!dateDisplay) return;

    const now = new Date(2026, 7, 10);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const formatted = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} (${days[now.getDay()]})`;
    dateDisplay.textContent = formatted;
}

// ==========================================================================
// 5. NOTICES SECTION
// ==========================================================================
function renderNotices() {
    const container = document.getElementById("noticeListContainer");
    const totalCountEl = document.getElementById("noticeTotalCount");
    const filterBtns = document.querySelectorAll("#noticeFilters .filter-btn");
    const viewMoreBtn = document.getElementById("noticeViewMoreBtn");

    if (!container) return;

    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentNoticeFilter = btn.dataset.category;
            renderList();
        });
    });

    function renderList() {
        const filtered = currentNoticeFilter === "all"
            ? NOTICES_DATA
            : NOTICES_DATA.filter(n => n.category === currentNoticeFilter);

        if (totalCountEl) totalCountEl.textContent = filtered.length;

        if (filtered.length === 0) {
            container.innerHTML = `<div style="padding:2rem; text-align:center; color:var(--text-secondary);">해당 카테고리의 공지사항이 없습니다.</div>`;
            return;
        }

        container.innerHTML = filtered.map(item => `
            <div class="notice-item" onclick="openNoticeModal(${item.id})">
                <div class="notice-main-info">
                    <span class="badge ${item.category === '가정통신문' ? 'badge-yellow' : (item.category === '행사' ? 'badge-green' : 'badge-sky')}">
                        ${item.category}
                    </span>
                    <h3 class="notice-title">${item.title}</h3>
                </div>
                <div class="notice-meta">
                    <span>${item.date}</span>
                    <span>조회 ${item.views}</span>
                </div>
            </div>
        `).join('');
    }

    renderList();

    if (viewMoreBtn) {
        viewMoreBtn.addEventListener("click", () => {
            openNoticeModal(NOTICES_DATA[0].id);
        });
    }
}

function openNoticeModal(id) {
    const item = NOTICES_DATA.find(n => n.id === id);
    if (!item) return;

    document.getElementById("modalCategory").textContent = item.category;
    document.getElementById("modalTitle").textContent = item.title;
    document.getElementById("modalDate").textContent = item.date;
    document.getElementById("modalViews").textContent = item.views;
    document.getElementById("modalAuthor").textContent = item.author;
    document.getElementById("modalContent").textContent = item.content;

    const imgWrapper = document.getElementById("modalImageWrapper");
    if (imgWrapper) imgWrapper.style.display = "none";

    showModal();
}

// ==========================================================================
// 6. ACADEMIC CALENDAR SECTION
// ==========================================================================
function renderCalendar() {
    const gridBody = document.getElementById("calendarGridBody");
    const monthTitle = document.getElementById("calendarMonthTitle");
    const eventsList = document.getElementById("eventsListContainer");
    const countBadge = document.getElementById("eventsCountBadge");

    const prevBtn = document.getElementById("prevMonthBtn");
    const nextBtn = document.getElementById("nextMonthBtn");
    const todayBtn = document.getElementById("todayMonthBtn");

    if (!gridBody || !monthTitle) return;

    if (prevBtn) prevBtn.onclick = () => changeMonth(-1);
    if (nextBtn) nextBtn.onclick = () => changeMonth(1);
    if (todayBtn) todayBtn.onclick = () => {
        currentCalendarYear = 2026;
        currentCalendarMonth = 7;
        updateView();
    };

    function changeMonth(delta) {
        currentCalendarMonth += delta;
        if (currentCalendarMonth < 0) {
            currentCalendarMonth = 11;
            currentCalendarYear--;
        } else if (currentCalendarMonth > 11) {
            currentCalendarMonth = 0;
            currentCalendarYear++;
        }
        updateView();
    }

    function updateView() {
        monthTitle.textContent = `${currentCalendarYear}년 ${currentCalendarMonth + 1}월`;

        const firstDay = new Date(currentCalendarYear, currentCalendarMonth, 1).getDay();
        const lastDate = new Date(currentCalendarYear, currentCalendarMonth + 1, 0).getDate();
        const prevMonthLastDate = new Date(currentCalendarYear, currentCalendarMonth, 0).getDate();

        let cellsHtml = "";

        for (let i = firstDay - 1; i >= 0; i--) {
            const dateNum = prevMonthLastDate - i;
            cellsHtml += `
                <div class="cal-cell other-month">
                    <span class="cal-date-num">${dateNum}</span>
                </div>
            `;
        }

        const currentMonthEvents = ACADEMIC_EVENTS.filter(evt => {
            const eDate = new Date(evt.date);
            return eDate.getFullYear() === currentCalendarYear && eDate.getMonth() === currentCalendarMonth;
        });

        for (let day = 1; day <= lastDate; day++) {
            const fullDateStr = `${currentCalendarYear}-${String(currentCalendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = currentMonthEvents.filter(e => e.date === fullDateStr);
            const isToday = (currentCalendarYear === 2026 && currentCalendarMonth === 7 && day === 10);

            const dayOfWeek = (firstDay + day - 1) % 7;
            const isSun = (dayOfWeek === 0);
            const isSat = (dayOfWeek === 6);

            let eventLabelHtml = "";
            if (dayEvents.length > 0) {
                eventLabelHtml = `<span class="cal-event-dot">${dayEvents[0].title}</span>`;
            }

            cellsHtml += `
                <div class="cal-cell ${isSun ? 'sun' : ''} ${isSat ? 'sat' : ''} ${isToday ? 'today' : ''} ${dayEvents.length ? 'has-event' : ''}">
                    <span class="cal-date-num">${day}</span>
                    ${eventLabelHtml}
                </div>
            `;
        }

        gridBody.innerHTML = cellsHtml;

        if (eventsList) {
            if (countBadge) countBadge.textContent = `${currentMonthEvents.length}개 일정`;

            if (currentMonthEvents.length === 0) {
                eventsList.innerHTML = `<div style="padding:2rem; text-align:center; color:var(--text-secondary);">이달의 예정된 주요 일정이 없습니다.</div>`;
            } else {
                eventsList.innerHTML = currentMonthEvents.map(evt => `
                    <div class="event-item ${evt.isImportant ? 'event-important' : ''}">
                        <span class="event-date-badge">${evt.date.slice(5)}</span>
                        <div>
                            <h4 class="event-title">${evt.title}</h4>
                            <p class="event-desc">${evt.desc}</p>
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    updateView();
}

// ==========================================================================
// 7. TODAY'S MENU SECTION
// ==========================================================================
function renderLunchMenu() {
    const menuKeys = Object.keys(LUNCH_MENU_DATA);
    let menuIndex = 0;

    const prevBtn = document.getElementById("prevDayMenuBtn");
    const nextBtn = document.getElementById("nextDayMenuBtn");

    if (prevBtn) prevBtn.onclick = () => {
        if (menuIndex > 0) {
            menuIndex--;
            updateMenuCard();
        }
    };

    if (nextBtn) nextBtn.onclick = () => {
        if (menuIndex < menuKeys.length - 1) {
            menuIndex++;
            updateMenuCard();
        }
    };

    function updateMenuCard() {
        const key = menuKeys[menuIndex];
        const data = LUNCH_MENU_DATA[key];
        if (!data) return;

        document.getElementById("menuDateText").textContent = data.dateStr;
        document.getElementById("menuTitle").textContent = data.title;
        document.getElementById("menuCornerBadge").textContent = data.typeBadge;
        document.getElementById("menuCalorie").textContent = data.calorie;
        document.getElementById("allergyDescText").textContent = data.allergy;

        const imgEl = document.getElementById("menuImg");
        if (imgEl && data.img) imgEl.src = data.img;

        const listEl = document.getElementById("menuItemsList");
        if (listEl) {
            listEl.innerHTML = data.items.map(item => `
                <li class="menu-item-single">
                    <span class="item-bullet">✔</span>
                    <span>${item}</span>
                </li>
            `).join('');
        }

        if (prevBtn) prevBtn.disabled = (menuIndex === 0);
        if (nextBtn) nextBtn.disabled = (menuIndex === menuKeys.length - 1);
    }

    updateMenuCard();
}

// ==========================================================================
// 8. PARTICIPATORY SCHOOL BUDGET SECTION (학교 참여예산제)
// ==========================================================================
// 카카오톡 알림: kakao-notify/Code.gs 를 Google Apps Script 웹 앱으로 배포한 뒤
// 그 웹 앱 주소(…/exec)를 아래에 넣으세요. 비워 두면 알림을 보내지 않습니다.
// (설치 방법: KAKAO_ALERT.md)
const KAKAO_NOTIFY_ENDPOINT = "";

function notifyKakao(idea) {
    if (!KAKAO_NOTIFY_ENDPOINT) return;
    // text/plain + no-cors: Apps Script 웹 앱은 CORS 사전요청(preflight)을 지원하지 않으므로
    // 단순 요청으로 보냅니다. 응답은 확인하지 않으며, 실패해도 제안 접수에는 영향이 없습니다.
    fetch(KAKAO_NOTIFY_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
            title: idea.title,
            desc: idea.desc,
            author: idea.author,
            phone: idea.phone
        })
    }).catch(() => { /* 알림 실패는 무시 */ });
}

function renderParticipatoryBudget() {
    const form = document.getElementById("budgetSubmissionForm");
    const alertMsg = document.getElementById("formAlertMsg");
    const ideasContainer = document.getElementById("budgetIdeasContainer");
    const totalBadge = document.getElementById("budgetTotalBadge");

    const sortVotesBtn = document.getElementById("sortVotesBtn");
    const sortNewestBtn = document.getElementById("sortNewestBtn");

    if (!ideasContainer) return;

    // Sort Toggle Controls
    if (sortVotesBtn) {
        sortVotesBtn.onclick = () => {
            sortVotesBtn.classList.add("active");
            if (sortNewestBtn) sortNewestBtn.classList.remove("active");
            budgetSortMode = "votes";
            renderIdeasList();
        };
    }

    if (sortNewestBtn) {
        sortNewestBtn.onclick = () => {
            sortNewestBtn.classList.add("active");
            if (sortVotesBtn) sortVotesBtn.classList.remove("active");
            budgetSortMode = "newest";
            renderIdeasList();
        };
    }

    // Form Submission Handler
    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            const name = document.getElementById("authorName").value.trim();
            const phone = document.getElementById("authorPhone").value.trim();
            const title = document.getElementById("ideaTitle").value.trim();
            const desc = document.getElementById("ideaDesc").value.trim();

            // Form Validation
            if (!name || !phone || !title || !desc) {
                showAlert("모든 필수 입력 사항(*)을 작성해 주세요.", "error");
                return;
            }

            const cleanPhone = phone.replace(/[^0-9]/g, '');
            if (cleanPhone.length < 9) {
                showAlert("올바른 연락처 번호를 입력해 주세요. (예: 010-1234-5678)", "error");
                return;
            }

            // Create New Idea Object
            const newIdea = {
                id: Date.now(),
                title: title,
                desc: desc,
                author: name,
                phone: phone,
                date: "2026.08.10",
                votes: 0
            };

            const ideas = getStoredBudgetIdeas();
            ideas.unshift(newIdea);
            saveStoredBudgetIdeas(ideas);

            notifyKakao(newIdea);

            showAlert("🎉 아이디어가 성공적으로 제안되었습니다! 소중한 의견 감사합니다.", "success");
            form.reset();
            renderIdeasList();
        };
    }

    function showAlert(msg, type) {
        if (!alertMsg) return;
        alertMsg.textContent = msg;
        alertMsg.className = `form-alert-msg ${type}`;
        alertMsg.style.display = "block";
        setTimeout(() => {
            alertMsg.style.display = "none";
        }, 4000);
    }

    // Main Render Function for Idea Cards List
    function renderIdeasList() {
        let ideas = getStoredBudgetIdeas();
        const votedIds = getStoredVotedIds();

        if (totalBadge) totalBadge.textContent = `총 ${ideas.length}건`;

        // Apply Sorting
        if (budgetSortMode === "votes") {
            ideas.sort((a, b) => b.votes - a.votes || b.id - a.id);
        } else {
            ideas.sort((a, b) => b.id - a.id);
        }

        if (ideas.length === 0) {
            ideasContainer.innerHTML = `<div style="padding:2.5rem; text-align:center; background:#fff; border-radius:var(--radius-md); color:var(--text-secondary);">아직 등록된 예산 아이디어가 없습니다. 첫 제안의 주인공이 되어보세요!</div>`;
            return;
        }

        ideasContainer.innerHTML = ideas.map(idea => {
            const hasVoted = votedIds.includes(idea.id);
            const maskedPhone = maskPhoneNumber(idea.phone);

            return `
                <div class="budget-card" id="idea-card-${idea.id}">
                    <div class="budget-card-header">
                        <div class="budget-author-badge">
                            <span class="author-name">👤 ${idea.author}</span>
                            <span class="author-phone-masked">📱 ${maskedPhone}</span>
                        </div>
                        <span class="budget-date">📅 ${idea.date}</span>
                    </div>
                    <h4 class="budget-card-title">${idea.title}</h4>
                    <p class="budget-card-desc">${idea.desc}</p>
                    <div class="budget-card-footer">
                        <div class="vote-box">
                            <span class="vote-count-num" id="vote-count-${idea.id}">${idea.votes}</span>
                            <span class="vote-count-label">명의 응원</span>
                        </div>
                        <button class="btn-vote ${hasVoted ? 'btn-voted' : ''}" 
                                onclick="handleVoteClick(${idea.id})" 
                                ${hasVoted ? 'disabled' : ''}>
                            ${hasVoted ? '✔ 추천 완료' : '👍 추천하기'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderIdeasList();
}

// Global Voting Handler
function handleVoteClick(ideaId) {
    const votedIds = getStoredVotedIds();
    if (votedIds.includes(ideaId)) return;

    const ideas = getStoredBudgetIdeas();
    const target = ideas.find(i => i.id === ideaId);
    if (!target) return;

    target.votes += 1;
    saveStoredBudgetIdeas(ideas);
    addVotedId(ideaId);

    // Dynamic UI update
    const cardEl = document.getElementById(`idea-card-${ideaId}`);
    if (cardEl) {
        const countEl = cardEl.querySelector(`#vote-count-${ideaId}`);
        const btnEl = cardEl.querySelector('.btn-vote');
        if (countEl) countEl.textContent = target.votes;
        if (btnEl) {
            btnEl.classList.add('btn-voted');
            btnEl.disabled = true;
            btnEl.innerHTML = '✔ 추천 완료';
        }
    }
}

// ==========================================================================
// 9. SCHOOL NEWS GALLERY SECTION
// ==========================================================================
function renderSchoolNews() {
    const container = document.getElementById("newsGridContainer");
    if (!container) return;

    container.innerHTML = SCHOOL_NEWS_DATA.map(news => `
        <div class="card news-card card-hover" onclick="openNewsModal(${news.id})">
            <div class="news-card-img-wrapper">
                <img src="${news.img}" alt="${news.title}" class="news-card-img">
                <span class="badge badge-sky news-card-badge">${news.category}</span>
            </div>
            <div class="news-card-body">
                <h3 class="news-card-title">${news.title}</h3>
                <p class="news-card-desc">${news.desc}</p>
                <div class="news-card-footer">
                    <span>📅 ${news.date}</span>
                    <span>👁 조회 ${news.views}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function openNewsModal(id) {
    const item = SCHOOL_NEWS_DATA.find(n => n.id === id);
    if (!item) return;

    document.getElementById("modalCategory").textContent = item.category;
    document.getElementById("modalTitle").textContent = item.title;
    document.getElementById("modalDate").textContent = item.date;
    document.getElementById("modalViews").textContent = item.views;
    document.getElementById("modalAuthor").textContent = item.author;
    document.getElementById("modalContent").textContent = item.content;

    const imgWrapper = document.getElementById("modalImageWrapper");
    const modalImg = document.getElementById("modalImage");

    if (imgWrapper && modalImg && item.img) {
        modalImg.src = item.img;
        modalImg.alt = item.title;
        imgWrapper.style.display = "block";
    }

    showModal();
}

// ==========================================================================
// 10. MODAL DIALOG UTILITIES
// ==========================================================================
function initModalEvents() {
    const modalBackdrop = document.getElementById("detailModal");
    const closeBtn = document.getElementById("modalCloseBtn");
    const confirmBtn = document.getElementById("modalConfirmBtn");

    if (closeBtn) closeBtn.onclick = hideModal;
    if (confirmBtn) confirmBtn.onclick = hideModal;

    if (modalBackdrop) {
        modalBackdrop.onclick = (e) => {
            if (e.target === modalBackdrop) hideModal();
        };
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modalBackdrop.classList.contains("active")) {
            hideModal();
        }
    });
}

function showModal() {
    const modalBackdrop = document.getElementById("detailModal");
    if (modalBackdrop) {
        modalBackdrop.classList.add("active");
        modalBackdrop.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }
}

function hideModal() {
    const modalBackdrop = document.getElementById("detailModal");
    if (modalBackdrop) {
        modalBackdrop.classList.remove("active");
        modalBackdrop.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }
}
