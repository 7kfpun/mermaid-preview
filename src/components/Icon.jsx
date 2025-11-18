const Icon = ({ type }) => {
  const icons = {
    flowchart: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L12 8" />
        <path d="M12 16L12 22" />
        <path d="M17 5L7 5" />
        <path d="M17 19L7 19" />
        <path d="M22 12L12 12" />
        <path d="M12 12L2 12" />
        <path d="M17 19L17 5" />
        <path d="M7 19L7 5" />
      </svg>
    ),
    sequence: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3h18v18H3z" />
        <path d="M9 9h6v6H9z" />
        <path d="M9 15v3" />
        <path d="M15 15v3" />
        <path d="M9 6V3" />
        <path d="M15 6V3" />
      </svg>
    ),
    class: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 12l9-9 9 9-9 9-9-9z" />
        <path d="M12 22V12" />
        <path d="M22 12H2" />
      </svg>
    ),
    state: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    er: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        <path d="M12 6v12" />
        <path d="M17 9l-5 5-5-5" />
      </svg>
    ),
    journey: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
        <path d="M12 12l4-4" />
        <path d="M12 12l-4 4" />
        <path d="M12 12l4 4" />
        <path d="M12 12l-4-4" />
      </svg>
    ),
    gantt: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3h18v4H3z" />
        <path d="M3 10h12v4H3z" />
        <path d="M3 17h15v4H3z" />
      </svg>
    ),
    pie: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21.21 15.89A10 10 0 118 2.83" />
        <path d="M22 12A10 10 0 0012 2v10z" />
      </svg>
    ),
    quadrant: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2v20" />
        <path d="M2 12h20" />
      </svg>
    ),
    requirement: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M9 12h6" />
        <path d="M9 16h6" />
      </svg>
    ),
    gitgraph: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2v20" />
        <path d="M12 18a6 6 0 00-6-6" />
      </svg>
    ),
    mindmap: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
        <path d="M12 12h.01" />
        <path d="M12 12l4-4" />
        <path d="M12 12l-4 4" />
      </svg>
    ),
    timeline: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3h18" />
        <path d="M3 21h18" />
        <path d="M12 3v18" />
        <path d="M8 8h8" />
        <path d="M8 16h8" />
      </svg>
    ),
    sankey: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 6h18" />
        <path d="M3 12h18" />
        <path d="M3 18h18" />
        <path d="M3 6s6 6 6 6" />
        <path d="M21 18s-6-6-6-6" />
      </svg>
    ),
    xy: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3v18h18" />
        <path d="M3 3l18 18" />
      </svg>
    ),
    block: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3h18v18H3z" />
        <path d="M9 3v18" />
        <path d="M15 3v18" />
        <path d="M3 9h18" />
        <path d="M3 15h18" />
      </svg>
    ),
    kanban: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3h6v18H3z" />
        <path d="M15 3h6v18h-6z" />
        <path d="M9 3h6v18H9z" />
      </svg>
    ),
  };
  return icons[type] || null;
};

export default Icon;
