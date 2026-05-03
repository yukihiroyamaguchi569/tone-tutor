type NoteHandler = (midi: number) => void;

let handler: NoteHandler | null = null;

export function onMidiNote(cb: NoteHandler): void {
  handler = cb;
}

export function offMidiNote(): void {
  handler = null;
}

export async function requestMidi(): Promise<boolean> {
  if (!navigator.requestMIDIAccess) return false;
  try {
    const access = await navigator.requestMIDIAccess();
    attachInputs(access);
    access.onstatechange = () => attachInputs(access);
    return true;
  } catch {
    return false;
  }
}

function attachInputs(access: MIDIAccess): void {
  for (const input of access.inputs.values()) {
    input.onmidimessage = (e: MIDIMessageEvent) => {
      const data = e.data;
      if (!data) return;
      const status = data[0]! & 0xf0;
      const note = data[1]!;
      const velocity = data[2]!;
      if (status === 0x90 && velocity > 0) {
        handler?.(note);
      }
    };
  }
}
