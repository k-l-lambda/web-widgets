# Music Widgets

A package contains some music utility modules.


## Modules

* MIDI
* MusicNotation
* MidiPlayer
* MidiAudio


## Usage

Install (via GitHub Packages registry):

1) Authenticate npm to GitHub registry (once per machine):

```
// ~/.npmrc
@k-l-lambda:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
always-auth=true

# Alternatively (npm >= 6)
# npm login --registry=https://npm.pkg.github.com --scope=@k-l-lambda
```

2) Install the package:

```
yarn add @k-l-lambda/music-widgets
# or
npm install @k-l-lambda/music-widgets
```

In Node:

```
import { MIDI, MusicNotation, MidiPlayer, MidiUtils } from "@k-l-lambda/music-widgets";

// Parse a MIDI ArrayBuffer
const midi = MIDI.parseMidiData(arrayBuffer);
const notation = MusicNotation.Notation.parseMidi(midi);

const player = new MidiPlayer(midi, {
	onMidi: (event, when) => {/* route to synth */},
});

player.play();
```

In Browser (UMD):

```
<script src="/dist/musicWidgetsBrowser.umd.js"></script>
<script>
  const { MIDI, MusicNotation, MidiPlayer, MidiAudio } = window.musicWidgetsBrowser;
  // ...
</script>
```

Vue component (piano roll):

```
import { MidiRoll } from "@k-l-lambda/music-widgets";

export default { components: { MidiRoll } };
```


## Development

Prerequisites:

- Node.js (LTS)
- Yarn

Install deps:

```
yarn
```

Build library and browser bundle:

```
yarn build
```

Watch mode (TS + bundle):

```
yarn watch
```

Test app (midi-visualizer):

```
cd tests/midi-visualizer
yarn
yarn serve
# optional: in another terminal, sync parent outputs into node_modules
yarn watch
```


## Publish to GitHub Packages

The package publishes to the GitHub Packages registry at `https://npm.pkg.github.com`.

1) Ensure you are authenticated (create a Personal Access Token with `read:packages`, `write:packages` (and `delete:packages` if needed)):

```
// ~/.npmrc
@k-l-lambda:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
always-auth=true
```

2) Update version in `package.json`.

3) Build the package (includes TS compile, lib sync, UMD bundle):

```
yarn build
```

4) Publish:

```
npm publish
# or (yarn classic delegates to npm publish)
yarn publish --new-version <semver>
```

Notes:
- The build will emit `lib/` (compiled TS + MidiAudio) and `dist/` (UMD bundle).
- Ensure `.npmrc` points the `@k-l-lambda` scope to the GitHub registry and `always-auth=true`.
- Package name must be scoped to the owner (`@k-l-lambda/music-widgets`) and you must have permission in that org/owner.
- In CI, prefer `NODE_AUTH_TOKEN`/`NPM_TOKEN` env var matching the `_authToken` used in `.npmrc`.
