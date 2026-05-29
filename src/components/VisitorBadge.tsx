import { useEffect, useState } from "react";

const SITE = "somewhere-quite";
const API_BASE = import.meta.env.VITE_VISITOR_API_URL ?? "https://jimmytheorangecat.com";
const NUM_KEY = `visitor-num-${SITE}`;
const TICKED_KEY = `visitor-ticked-${SITE}`;

export default function VisitorBadge() {
  const [count, setCount] = useState<number | null>(null);
  const [ticked, setTicked] = useState(false);

  useEffect(() => {
    setTicked(localStorage.getItem(TICKED_KEY) === "1");
    const stored = localStorage.getItem(NUM_KEY);
    if (stored) { setCount(Number(stored)); return; }
    fetch(`${API_BASE}/api/visitor?site=${SITE}`)
      .then((r) => r.json())
      .then((d) => { localStorage.setItem(NUM_KEY, String(d.count)); setCount(d.count); })
      .catch(() => {});
  }, []);

  const tick = () => { localStorage.setItem(TICKED_KEY, "1"); setTicked(true); };

  if (count === null) return null;

  return (
    <span
      style={{
        fontFamily: '"Inter", sans-serif',
        fontSize: "10px",
        color: "rgba(255,255,255,0.25)",
        letterSpacing: "0.04em",
      }}
    >
      {ticked ? (
        `✓ visitor #${count.toLocaleString()}`
      ) : (
        <>
          visitor #{count.toLocaleString()} —{" "}
          <button
            onClick={tick}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: "inherit",
              textDecoration: "underline",
              font: "inherit",
            }}
          >
            tick ✓
          </button>
        </>
      )}
    </span>
  );
}
