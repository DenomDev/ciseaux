"use strict";

import Tape from "./tape";
import config from "./config";

let getInstrumentFrom = (instruments, ch, tape) => {
  if (!instruments.hasOwnProperty(ch)) {
    return null;
  }

  let instrument = instruments[ch];
  if (typeof instrument === "function") {
    instrument = instrument(ch, tape);
  }

  return (instrument instanceof Tape) ? instrument : null;
};

class Sequence {
  constructor(pattern, durationPerStep) {
    this.pattern = pattern;
    this.durationPerStep = durationPerStep;
  }

  apply(instruments) {
    let pattern = String(this.pattern);
    let durationPerStep = Math.max(0, +this.durationPerStep || 0);

    if (!(pattern.length && durationPerStep && instruments && typeof instruments === "object")) {
      return Tape.silence(0);
    }

    return pattern.split("").reduce((tape, ch) => {
      let instrument = getInstrumentFrom(instruments, ch, tape);

      if (instrument !== null) {
        if (instrument.duration < durationPerStep) {
          tape = tape.concat(instrument, Tape.silence(durationPerStep - instrument.duration));
        } else {
          tape = tape.concat(instrument.slice(0, durationPerStep));
        }
      } else {
        tape = tape.concat(Tape.silence(durationPerStep));
      }

      return tape;
    }, new Tape(1, config.sampleRate));
  }
}

export default Sequence;