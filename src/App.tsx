import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'

interface ImageObject {
  id: number;
  src: string;
  verified: boolean;
  label: string;
}


function App() {
  const [images, setImages] = useState(() => generateImages(1000));

  function handleLabel (index: number, label: string) {
    setImages(images => images.map((image, i) => i === index ? { ...image, label } : image));
  }

  const labels = ["Male", "Female"];

  function getDirection (index: number) {
    return ["down","left","right"][labels.indexOf(images[index].label)+1] as "down"|"left"|"right"
  }

  return (
    <>
      <h1>Swipe Labeller</h1>
      <CardStack
        cardCount={images.length}
        renderChild={(index: number, className: string, style: React.CSSProperties) => {
          const image = images[index];
          return (
            <Card
              key={image.id}
              image={image}
              className={className}
              style={style}
            />
          );
        }}
        getDirection={getDirection}
        labels={labels}
        setLabel={handleLabel}
      />
    </>
  )
}

export default App

interface CardStackProps {
  cardCount: number;
  renderChild: (index: number, className: string, style: React.CSSProperties) => React.ReactNode;
  getDirection: (index: number) => "down" | "left" | "right";
  labels: string[];
  setLabel: (index: number, label: string) => void;
}

function CardStack ({ cardCount, renderChild, getDirection, labels, setLabel }: CardStackProps) {
  const windowSize = 10;
  const [currentIndex, setCurrentIndex] = useState(0);

  const slice = Array.from({ length: Math.min(windowSize, cardCount - currentIndex) }).map((_, i) => currentIndex + i).reverse()

  const prevIndex = currentIndex > 0 ? currentIndex - 1 : NaN;

  if (!Number.isNaN(prevIndex)) {
    slice.push(prevIndex);
  }

  const lastDirection = !Number.isNaN(prevIndex) ? getDirection(prevIndex) : null;

  const left = useCallback(() => {
    setCurrentIndex(i => i + 1);
    setLabel(currentIndex, labels[0]);
  }, [currentIndex]);

  const right = useCallback(() => {
    setCurrentIndex(i => i + 1);
    setLabel(currentIndex, labels[1]);
  }, [currentIndex]);

  useEffect(() => {
    const cb = (e: KeyboardEvent) => {
      if (["ArrowRight","ArrowLeft","ArrowUp","ArrowDown"].includes(e.key)) {
        e.preventDefault();

        if (!e.repeat) {
          switch(e.key) {
            case "ArrowLeft":
              left();
              break;
            case "ArrowRight":
              right();
              break;
            case "ArrowUp":
              setCurrentIndex(i => Math.max(0, i - 1))
              break;
            case "ArrowDown":
              setCurrentIndex(i => i + 1);
              setLabel(currentIndex, "");
              break;
          }
        }

        return false;
      }
    }

    document.addEventListener("keydown", cb);

    return () => {
      document.removeEventListener("keydown", cb);
    }
  }, [currentIndex, left, right]);

  const [startX, setStartX] = useState(NaN);
  const [currentX, setCurrentX] = useState(0);

  const onEndRef = useRef(() => {})

  useEffect(() => {
    const cb_start = (e: TouchEvent) => {
      setStartX(e.touches[0].screenX);
      setCurrentX(e.touches[0].screenX);
    }

    document.addEventListener("touchstart", cb_start);

    const cb_move = (e: TouchEvent) => {
      setCurrentX(e.touches[0].screenX);
    }

    document.addEventListener("touchmove", cb_move);

    const cb_end = () => {
      onEndRef.current();
      setStartX(NaN);
    }

    document.addEventListener("touchend", cb_end, false);
    document.addEventListener("touchcancel", cb_end, false);

    return () => {
      document.removeEventListener("touchstart", cb_start);
      document.removeEventListener("touchmove", cb_move);
      document.removeEventListener("touchend", cb_end);
      document.removeEventListener("touchcancel", cb_end);
    }

  }, []);

  const dx = currentX - startX;

  onEndRef.current = () => {
    if (dx < -200) {
      left();
    }
    else if (dx > 200) {
      right();
    }
  };

  return (
    <div className="overflow-hidden m-5 h-[650px] relative mx-auto">
      {
        slice.map((index, i) => renderChild(
          index,
          `${i >= windowSize - 2 ? "shadow-md" : ""} ${prevIndex === index && lastDirection ? `card-animation-${lastDirection}` : ""}`,
          index == currentIndex && !isNaN(dx) ? {transform: `translate(${dx}px, 0)`, transition: "none"} : {},
        ))
      }
      {slice.length === 0 && <p>No more images</p>}
      <div className="absolute left-0 top-[40%] rounded size-32 bg-gray-300/50 p-4 text-gray-400 font-bold cursor-pointer select-none" onClick={left}>
        {labels[0]}
        <span className="text-7xl block">↶</span>
      </div>
      <div className="absolute right-0 top-[40%] rounded size-32 bg-gray-300/50 p-4 text-gray-400 font-bold cursor-pointer select-none" onClick={right}>
        {labels[1]}
        <span className="text-7xl block">↷</span>
      </div>
    </div>
  )
}

function Card ({ image, className = "", style }: { image: ImageObject, className?: string, style?: React.CSSProperties }) {
  return (
    <div
      className={`card w-[420px] h-[640px] absolute left-[50%] bg-white rounded border-1 border-gray-200 p-4 m-auto flex flex-col place-items-center justify-center ${className}`}
      style={style}
    >
      <p>{image.id}</p>
      <img src={image.src} />
      <p>{image.verified?"✅":" "} {image.label}</p>
    </div>
  );
}

function generateImages (count: number) {
  return Array.from({ length: count }).map(() => {
    const id = Math.floor(Math.random()*1e9);
    return ({
      id,
      src: `https://via.assets.so/img.jpg?w=400&h=600&tc=white&bg=${encodeURIComponent(randomColour())}&t=${encodeURIComponent("#" + id)}`,
      verified: false,
      label: "",
    });
  })
}

function randomColour () {
  return hslToHex(Math.floor(Math.random()*360), 100, 50);
}

function hslToHex(h: number, s: number, l: number) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

