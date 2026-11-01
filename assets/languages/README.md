# Built-in language audio

This folder contains 248 MP3 clips: 84 picture words and 40 short everyday phrases in each of Mandarin Chinese and Marathi. Files are loaded as needed by the static website. There are no runtime API keys or speech-service requests in the games.

The original source text lives in `src/club/language-data.js`. Clips were synthesized with **gTTS 2.5.4**, using its Google Translate text-to-speech integration and the language tags `zh-CN` and `mr`. They are generated speech, not recordings of Dhruva, family members, teachers or an impersonated speaker. The English guide's device voice is separate from these clips.

`manifest.json` records every clip's source text, language, path, byte length and SHA-256 hash of the text. Tests check the manifest against the current content and packaged audio. All clips were inspected with ffprobe (0.65–2.71 seconds) and decoded with ffmpeg during initial verification. There has been no independent human-teacher pronunciation review; no claim of complete school-syllabus coverage is made.

To regenerate changed text, use a temporary Python environment with `gTTS==2.5.4`, then run from the repository root:

```sh
node scripts/language-audio-manifest.mjs > /tmp/dhruva-language-manifest.json
python scripts/generate-language-audio.py /tmp/dhruva-language-manifest.json
```

Generation requires a network connection and sends the original generic word/phrase text to the synthesis provider. The generator reuses files whose source-text hash still matches. No installation or generation is required to play, build or deploy the checked-in website.

Reference: [gTTS documentation](https://gtts.readthedocs.io/).
