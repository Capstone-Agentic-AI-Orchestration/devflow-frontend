"use client";

/**
 * AnatomyOfRun — A schematic showing one real orchestration run.
 * Pure SVG, monochrome, 1.5px stroke.
 * GSAP timeline on enter: each node appears in sequence.
 * Respects prefers-reduced-motion.
 */

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap, registerGsapPlugins } from "@/lib/gsap";
import "./AnatomyOfRun.css";

interface RunNode {
  id: string;
  type: "input" | "process" | "decision" | "output";
  label: string;
  detail?: string;
  status?: "ok" | "pending" | "active";
  duration?: string;
  y: number;
}

const NODES: RunNode[] = [
  { id: "brief", type: "input", label: "brief", detail: '"Build a B2B dashboard for Bayan Cargo"', y: 0 },
  { id: "contract", type: "process", label: "contract", detail: "18 files · 12 tests · 8 acceptance criteria", status: "ok", duration: "1m 42s", y: 110 },
  { id: "agents", type: "process", label: "agents run in parallel", status: "ok", duration: "3m 08s", y: 230 },
  { id: "gate1", type: "decision", label: "gate 1 — contract review", status: "ok", duration: "2m 11s", y: 380 },
  { id: "artifacts", type: "process", label: "18 artifacts generated", status: "ok", duration: "1m 22s", y: 500 },
  { id: "gate2", type: "decision", label: "gate 2 — code review", status: "ok", duration: "4m 30s", y: 610 },
  { id: "deploy", type: "output", label: "github.com/alphaexplora/bayan-cargo-dashboard", status: "ok", y: 720 },
];

export function AnatomyOfRun() {
  const rootRef = useRef<HTMLElement>(null);
  const nodesRef = useRef<SVGGElement>(null);
  const connectorsRef = useRef<SVGGElement>(null);
  const totalRef = useRef<SVGGElement>(null);

  useGSAP(
    () => {
      registerGsapPlugins();

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const nodes = nodesRef.current?.querySelectorAll(".run-node") ?? [];
      const connectors = connectorsRef.current?.querySelectorAll(".run-connector") ?? [];
      const total = totalRef.current;

      if (reduced) {
        gsap.set([nodes, connectors, total], { opacity: 1 });
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 75%",
          toggleActions: "play none none none",
        },
      });

      tl.from(connectors, {
        opacity: 0,
        duration: 0.3,
        stagger: 0.12,
        ease: "power1.in",
      }).from(
        nodes,
        {
          opacity: 0,
          y: 12,
          duration: 0.5,
          stagger: 0.15,
          ease: "power2.out",
        },
        "-=0.2",
      ).from(
        total,
        {
          opacity: 0,
          duration: 0.4,
          ease: "power1.out",
        },
        "-=0.2",
      );
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className="anatomy">
      <div className="anatomy-inner">
        <div className="anatomy-head">
          <p className="anatomy-eyebrow">A real run</p>
          <h2 className="anatomy-title">One brief. Five agents. Eight minutes.</h2>
          <p className="anatomy-sub">
            A single prompt orchestrates four specialised agents in parallel,
            delivers contract-scoped artifacts, and ships to GitHub after two
            PM-approved gates.
          </p>
        </div>

        <div className="anatomy-schematic">
          <svg
            viewBox="0 0 700 800"
            xmlns="http://www.w3.org/2000/svg"
            className="anatomy-svg"
            role="img"
            aria-label="Schematic of a single orchestration run from brief to GitHub deploy"
          >
            <g ref={connectorsRef} className="run-connectors">
              {NODES.slice(0, -1).map((n, i) => (
                <line
                  key={`conn-${i}`}
                  className="run-connector"
                  x1="350"
                  y1={n.y + 56}
                  x2="350"
                  y2={NODES[i + 1].y - 8}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              ))}
            </g>

            <g ref={nodesRef} className="run-nodes">
              {NODES.map((node) => (
                <g key={node.id} className={`run-node run-node--${node.type}`} transform={`translate(0, ${node.y})`}>
                  {node.type === "input" && (
                    <g>
                      <rect x="120" y="0" width="460" height="56" rx="2" className="run-box" />
                      <text x="140" y="22" className="run-label">{node.label}</text>
                      {node.detail && (
                        <text x="140" y="44" className="run-detail">{node.detail}</text>
                      )}
                    </g>
                  )}

                  {node.type === "process" && (
                    <g>
                      <rect x="120" y="0" width="460" height="56" rx="2" className="run-box" />
                      <text x="140" y="22" className="run-label">{node.label}</text>
                      {(node.detail || node.duration) && (
                        <g>
                          {node.detail && (
                            <text x="140" y="44" className="run-detail">{node.detail}</text>
                          )}
                          {node.duration && (
                            <text x="560" y="22" className="run-duration">{node.duration}</text>
                          )}
                        </g>
                      )}
                    </g>
                  )}

                  {node.type === "decision" && (
                    <g>
                      <rect x="120" y="0" width="460" height="56" rx="2" className="run-box run-box--decision" />
                      <text x="140" y="22" className="run-label">{node.label}</text>
                      {node.duration && (
                        <text x="560" y="22" className="run-duration">{node.duration}</text>
                      )}
                      <text x="560" y="44" className="run-check">✓ approved</text>
                    </g>
                  )}

                  {node.type === "output" && (
                    <g>
                      <rect x="120" y="0" width="460" height="56" rx="2" className="run-box run-box--output" />
                      <text x="140" y="22" className="run-label">{node.label}</text>
                      <text x="140" y="44" className="run-detail">8m 12s · 5 agents · 18 files · 0 errors</text>
                    </g>
                  )}
                </g>
              ))}

              <g ref={totalRef} className="run-total" transform="translate(0, 790)">
                <text x="350" y="0" textAnchor="middle" className="run-total-text">
                  end-to-end: 8m 12s
                </text>
              </g>
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
