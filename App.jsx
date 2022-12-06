import React from "react";
import { useControls, button } from "leva";
import {LoremIpsum} from 'lorem-ipsum';

import { useScramble } from "./use-scramble";

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4
  },
  wordsPerSentence: {
    max: 16,
    min: 4
  }
});

export const App = () => {


  const [sample, setSample] = React.useState(lorem.generateWords(4))
  const values = useControls(
    {
      'Randomize': button(() =>setSample(lorem.generateWords(4))),
      speed: { value: 0.4, min: 0.1, max: 1, step: 0.1 },
      scramble: { value: 5, min: 0, max: 42, step: 1 },
      step: { value: 2, min: 1, max: 10, step: 1 },
      interval: { value: 1, min: 1, max: 20, step: 1 },
      seed: { value: 2, min: 0, max: 42, step: 1 },
      loop: false,
    }
  );

  const { ref } = useScramble({
    text: sample,
    ...values,
  });

  return <p ref={ref} />;
};
