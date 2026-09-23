# READER-VOICES (ADR-045): the Kokoro reader, a long-lived sidecar the server feeds one reading per
# stdin line and hears back from on stdout. Kokoro (Apache-2.0) runs offline on the CPU: 2-5 s of
# work per 2-5 s line on the owner's PC. Each request's parts are text (phonemised here, in the
# voice's own accent) or phonemes from the pronunciation lexicon, spliced in as given.
#   in:  {"id", "voice", "speed", "lang", "parts": [{"text"} | {"ipa"}], "out": "<file>.wav"}
#   out: {"id", "ms"} or {"id", "error"}; the first line is {"ready": true}
# Usage: <venv python> kokoro_sidecar.py <dir holding kokoro-v1.0.onnx and voices-v1.0.bin>
import json
import sys

import soundfile as sf
from kokoro_onnx import Kokoro

model_dir = sys.argv[1]
kokoro = Kokoro(f"{model_dir}/kokoro-v1.0.onnx", f"{model_dir}/voices-v1.0.bin")
print(json.dumps({"ready": True}), flush=True)

for line in sys.stdin:
    request = {}
    try:
        request = json.loads(line)
        lang = request["lang"]
        phonemes = []
        for part in request["parts"]:
            if "ipa" in part:
                phonemes.append(part["ipa"])
            elif part.get("text", "").strip():
                phonemes.append(kokoro.tokenizer.phonemize(part["text"], lang))
        said = " ".join(p.strip() for p in phonemes if p.strip())
        samples, rate = kokoro.create(
            said, voice=request["voice"], speed=request["speed"], lang=lang, is_phonemes=True
        )
        sf.write(request["out"], samples, rate)
        print(json.dumps({"id": request["id"], "ms": round(len(samples) / rate * 1000)}), flush=True)
    except Exception as error:  # a bad line must never take the reader down
        print(json.dumps({"id": request.get("id"), "error": str(error)[:300]}), flush=True)
