import Head from "next/head";
import React from "react";

export default function Home() {
  const width = 58;
  const height = 35;

  const [gen, setGen] = React.useState(0);
  const [mouseDown, setMouseDown] = React.useState<boolean>(false);
  const [isDrawing, setIsDrawing] = React.useState<boolean>(false);
  const [running, setRunning] = React.useState<boolean>(false);
  const runningRef = React.useRef(running);
  runningRef.current = running;

  const [state, setState] = React.useState<boolean[]>(
    new Array(width * height).fill(false),
  );

  const runSimulation = React.useCallback(() => {
    if (!runningRef.current) {
      return;
    }

    setState((cur) => simulateGeneration(cur, width));
    setGen((cur) => cur + 1);
    setTimeout(runSimulation, 500);
  }, []);

  function updateState(cellIdx: number) {
    if (!mouseDown) {
      return;
    }

    setGen(0);
    setState((cur) => cur.map((s, i) => (i === cellIdx ? isDrawing : s)));
  }

  return (
    <>
      <Head>
        <title>Game of Life</title>
        <meta name="description" content="Game of life" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex min-h-screen w-full flex-col">
        <div className="flex w-full gap-12 p-12">
          <div>
            <h1 className="text-5xl font-extrabold">Game of Life</h1>
            <div className="flex gap-6">
              <button
                onClick={() => {
                  setState((cur) => cur.map(() => false));
                  setGen(0);
                }}
              >
                clear
              </button>
              <button
                onClick={() => {
                  setRunning((cur) => !cur);
                  runningRef.current = true;
                  runSimulation();
                }}
              >
                {running ? "stop" : "go"}
              </button>
              <span>generation: {gen}</span>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              {range(height).map((rowIdx) => (
                <div
                  key={rowIdx}
                  className="flex border-gray-500 last:border-b"
                >
                  {range(width).map((colIdx) => {
                    const cellIdx = rowIdx * width + colIdx;
                    return (
                      <Cell
                        key={cellIdx}
                        alive={state[cellIdx] ?? false}
                        onClick={() => updateState(cellIdx)}
                        onMouseDown={() => {
                          setIsDrawing(!state[cellIdx] ?? false);
                          setMouseDown(true);
                        }}
                        onMouseUp={() => setMouseDown(false)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

type CellProps = {
  alive: boolean;
  onClick: () => void;
  onMouseUp: () => void;
  onMouseDown: () => void;
};

function Cell(props: CellProps) {
  const color = props.alive ? "bg-black" : "";

  return (
    <div
      className={
        "border-l border-t border-gray-500 p-3 last:border-r hover:cursor-pointer " +
        color
      }
      onMouseEnter={props.onClick}
      onMouseDown={props.onMouseDown}
      onMouseUp={props.onMouseUp}
    ></div>
  );
}

function range(size: number) {
  return [...Array(size).keys()];
}

function simulateGeneration(state: boolean[], width: number): boolean[] {
  return state.map((_, i) => simulateCell(i, state, width));
}

function simulateCell(idx: number, state: boolean[], width: number): boolean {
  const neighborIdxs = [
    idx - width - 1,
    idx - width,
    idx - width + 1,
    idx - 1,
    idx + 1,
    idx + width - 1,
    idx + width,
    idx + width + 1,
  ];

  const aliveNeighbors = neighborIdxs
    .map((i) => (state[i] ? 1 : 0))
    .reduce((prev, cur) => prev + cur, 0 as number);
  const currentlyAlive = state[idx];

  if (!currentlyAlive && aliveNeighbors === 3) {
    return true;
  } else if (currentlyAlive && [2, 3].includes(aliveNeighbors)) {
    return true;
  }
  return false;
}
