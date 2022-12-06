import * as React from "react";

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

function getRandomChar() {
  const rand = getRandomInt(0, 60);
  return String.fromCharCode(rand + 65);
}

export type UseScrambleProps = {
  text: string;
  speed?: number;
  seed?: number;
  step?: number;
  interval?: number;
  scramble?: number;
  loop?: boolean;
  onComplete?: Function;
};

export const useScramble = (props: UseScrambleProps) => {
  //
  const {
    text,
    speed = 0.5,
    seed = 0,
    step = 1,
    interval = 1,
    scramble = 8,
    loop = false,
    onComplete,
  } = props;

  // text node ref
  const textRef = React.useRef<any>(null);

  // animation frame request
  const rafRef = React.useRef<number>(0);

  // compute
  const elapsedRef = React.useRef(0);
  const fpsInterval = 1000 / (100 * speed);

  // scramble step
  const stepRef = React.useRef<number>(0);

  // current character index ref
  const idxRef = React.useRef<number>(0);

  // scramble controller
  const controlRef = React.useRef<Array<string | number>>([]);

  // dice role with 20%
  const getRandomScramble = () => {
    const diceRoll = getRandomInt(0, 10);
    return scramble + (diceRoll < 2 ? getRandomInt(0, scramble) : 0);
  };

  // pick random character ahead in the string, and add them to the randomizer
  const seedRandomCharacters = () => {
    // for (var i = 0; i < seed; i++) {
    //   const pos = getRandomInt(idxRef.current, text.length - 1);
    //   controlRef.current[pos] = controlRef.current[pos] || getRandomScramble();
    // }
    // console.log(controlRef.current.length);
  };

  // add `step` characters to the randomizer, and increase the idxRef pointer
  const moveCharIndex = () => {
    if (idxRef.current < text.length) {
      const currentIndex = idxRef.current;
      controlRef.current[currentIndex] =
        controlRef.current[currentIndex] || getRandomScramble();
      idxRef.current += 1;
    }
    // const remainingSteps = text.length - idxRef.current;
    // const nextSteps = Math.min(step, remainingSteps);
    // for (var i = 0; i <= nextSteps; i++) {
    //   const currentIndex = idxRef.current;
    //   controlRef.current[currentIndex] =
    //     controlRef.current[currentIndex] || getRandomScramble();
    //   idxRef.current += 1;
    // }
  };

  // draw when fpsInterval time has passed. fpsInterval is computed by the `speed` prop
  const animate = (time: number) => {
    const timeElapsed = time - elapsedRef.current;

    rafRef.current = requestAnimationFrame(animate);

    if (timeElapsed > fpsInterval) {
      elapsedRef.current = time;
      draw();
    }
  };

  // redraw text on every step and increment stepRef
  const draw = () => {
    if (!textRef.current) return;

    // add random seeds on every interval
    if (stepRef.current % (interval + (2 - seed)) === 0) {
      seedRandomCharacters();
    }

    //
    if (stepRef.current % interval === 0) {
      moveCharIndex();
    }

    let newString = "";
    let charsDone = 0;

    for (var i = 0; i < text.length; i++) {
      const cPos = controlRef.current[i];

      switch (true) {
        // case i >= text.length + step:
        //   controlRef.current.splice(i, step);
        //   break;
        case typeof cPos === "string" && i > idxRef.current:
          newString += cPos;
          break;
        case typeof cPos === "string" && i <= idxRef.current:
          newString += text[i];
          charsDone++;
          break;

        case cPos === 0 || text[i] === " ":
          newString += text[i];
          controlRef.current[i] = text[i];
          charsDone++;
          break;

        case cPos > 0 && i <= idxRef.current:
          newString += getRandomChar();
          controlRef.current[i] = (controlRef.current[i] as number) - 1;
          break;
        case cPos > 0:
          newString += getRandomChar();
          break;
        default:
          newString += "<span>&nbsp;</span>";
      }
    }

    textRef.current.innerHTML = newString;

    if (charsDone === text.length) {
      console.log(controlRef.current);
      if (onComplete) {
        onComplete();
      }
      if (loop) {
        stepRef.current = 0;
        idxRef.current = 0;
        elapsedRef.current = 0;
        controlRef.current = new Array(text.length);
      } else {
        cancelAnimationFrame(rafRef.current);
      }
    }

    stepRef.current += 1;
  };

  // reset step when text is changed
  React.useEffect(() => {
    stepRef.current = 0;
    idxRef.current = 0;
    const newArray = new Array(text.length);
    const prevString = controlRef.current.join("");

    for (let i = 0; i < prevString.length; i++) {
      newArray[i] = prevString[i];
    }

    controlRef.current = newArray;

    // clearTimeout(loopRef.current)
    // console.log(text);
    // console.log(text.length);
    // stepRef.current = 0;
    // idxRef.current = 0;
    // elapsedRef.current = 0;
    // controlRef.current = new Array(text.length);
    // console.log(controlRef.current.length);
  }, [text]);

  //
  React.useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    if (speed > 0.001) {
      rafRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(rafRef.current);
    }
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [animate, speed, text]); // Make sure the effect runs only once

  return { ref: textRef };
};
