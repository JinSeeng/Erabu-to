// Story graph for 因果 (Inga) / 選ぶと、 (Erabu to...)
// Each scene has: id, kanji title, narration lines, progression stage, choices,
// optional yokai/journal unlocks, optional image prompt for Gemini Nano Banana.
//
// Yokai are placed authentically: Kappa lives in water, ghost bride at abandoned
// shrine, Jorogumo weaves in a lonely hut in the forest.

export const STAGES = ["peaceful", "strange", "unsettling", "distorted", "horrifying"];

export const STAGE_INDEX = Object.fromEntries(STAGES.map((s, i) => [s, i]));

export const SCENES = {
  start: {
    id: "start",
    kanji: "夕暮れの道",
    romaji: "Yūgure no michi — The Dusk Road",
    stage: "peaceful",
    imagePrompt:
      "a lonely rural Japanese countryside road at dusk, rice paddies on either side, distant thatched farmhouse, warm amber sky, a small torii shrine gate half hidden by grass",
    narration: [
      "The evening cicadas are louder than you remember.",
      "You have walked this road home a thousand times. Rice paddies breathe on either side, and the sun bleeds into the western hills.",
      "Ahead, the road forks. The main path curls down toward the village. A narrower trail leaves the road here — the old mountain shortcut your grandmother forbade.",
    ],
    choices: [
      { id: "main-road", text: "Continue on the main road", to: "shrine_torii", stamp: "主道" },
      { id: "mountain", text: "Take the mountain shortcut", to: "mountain_bridge", stamp: "山道" },
      { id: "paddies", text: "Turn back toward the rice paddies", to: "paddies_wall", stamp: "田" },
    ],
  },

  // ---------------- THIRD PATH: THE RICE PADDIES ----------------
  paddies_wall: {
    id: "paddies_wall",
    kanji: "塗り壁",
    romaji: "Nurikabe — The Painted Wall",
    stage: "strange",
    imagePrompt:
      "a narrow path through flooded rice paddies at dusk in rural Japan blocked by an impossibly tall smooth mud wall that stretches beyond sight, still water reflecting the twilight, sumi-e ink wash horror",
    narration: [
      "You choose the low road, back toward the paddies. Water reflects the last purple of the sky.",
      "The path ends against a wall. It was not here this morning. It has no top, no edge you can find.",
      "Sometimes it seems to breathe.",
    ],
    journal: {
      id: "nurikabe",
      title: "Nurikabe (塗り壁) — The Painted Wall",
      body: "A yokai that manifests as an invisible or unbending wall on lonely night roads. To force through is to be lost. To bow low and strike the base with a stick, folklore says, may cause it to lift.",
    },
    choices: [
      { id: "push", text: "Press your palms against the wall and push", to: "ending_walled_in", stamp: "押" },
      { id: "bow", text: "Bow low and tap the base three times", to: "farmhouse", stamp: "叩" },
    ],
  },

  farmhouse: {
    id: "farmhouse",
    kanji: "廃屋",
    romaji: "Haiya — The Abandoned Farmhouse",
    stage: "unsettling",
    imagePrompt:
      "the interior of an abandoned Japanese thatched-roof farmhouse at night, a single sunken hearth glowing faintly, long tongue-shape shadow across the ceiling boards, no visible figures, sumi-e ink wash horror",
    narration: [
      "The wall lifts like a curtain. Beyond it: an old farmhouse you have never seen, though you know every path in this village.",
      "The door is open. A hearth glows inside — recently fed. On the ceiling above, something long and pale is moving, as if licking.",
      "There is nowhere else to go.",
    ],
    journal: {
      id: "tenjoname",
      title: "Tenjō-name (天井嘗) — The Ceiling Licker",
      body: "A tall thin yokai who lives in the rafters of empty houses and licks the stains from the ceiling with a long, pale tongue. Harmless — unless you are a stain.",
    },
    choices: [
      { id: "sit", text: "Sit at the hearth and warm your hands", to: "ending_hearth_guest", stamp: "座" },
      { id: "search", text: "Search the house for its owner", to: "ending_licked_clean", stamp: "探" },
    ],
  },

  ending_walled_in: {
    id: "ending_walled_in",
    kanji: "壁の裏",
    romaji: "Kabe no ura — Behind the Wall",
    stage: "horrifying",
    isEnding: true,
    tone: "trapped",
    imagePrompt:
      "a lone traveller pressed against an enormous impossible dark wall at night in rice paddies, sky above without stars, sumi-e ink wash horror, quiet dread",
    narration: [
      "You press. The wall presses back — patient, curious.",
      "When you look behind you, the paddies are also a wall. So is the sky.",
      "The road you knew becomes the memory of a road. You are still walking. You will always be walking.",
    ],
  },

  ending_hearth_guest: {
    id: "ending_hearth_guest",
    kanji: "囲炉裏の客",
    romaji: "Irori no kyaku — The Hearth's Guest",
    stage: "distorted",
    isEnding: true,
    tone: "haunted",
    imagePrompt:
      "a lone figure seated cross-legged at a sunken hearth in an old Japanese farmhouse at night, thin pale limbs descending gently from the rafters to touch their hair, warm amber firelight, sumi-e ink wash horror",
    narration: [
      "You sit. The house sighs, as if it has waited for a guest for a very long time.",
      "Something long and pale reaches down from the rafters and — carefully, kindly — grooms your hair.",
      "In the morning, you will remember only warmth. Your family will notice how quiet you have become. How very, very clean.",
    ],
  },

  ending_licked_clean: {
    id: "ending_licked_clean",
    kanji: "跡の無い部屋",
    romaji: "Ato no nai heya — The Roomless of Marks",
    stage: "horrifying",
    isEnding: true,
    tone: "cursed",
    imagePrompt:
      "an empty spotless tatami room in an old farmhouse at night, a single sandal left neatly at the doorway, no other trace of anyone, faint pale tongue-shaped shadow on ceiling, sumi-e ink wash",
    narration: [
      "You search from room to room. Every room is spotless. Every corner is cleaner than any corner should be.",
      "Something on the ceiling notices the shape of you against its clean, clean wood.",
      "In the morning, the house will still be there. You will not be. And the ceiling will be spotless.",
    ],
  },

  // ---------------- ZASHIKI-WARASHI: kind child yokai ----------------
  zashiki_warashi: {
    id: "zashiki_warashi",
    kanji: "座敷童",
    romaji: "Zashiki-warashi — The Room Child",
    stage: "strange",
    imagePrompt:
      "a small barefoot Japanese child yokai with a bob haircut in a red kimono standing in a moonlit clearing among bamboo, holding out a tiny folded paper crane, warm gentle sumi-e ink wash",
    narration: [
      "A small laugh, like a bell dropped on wood, comes from the bamboo.",
      "A child in a red kimono stands very still on the path. She looks up at you with old eyes.",
      "She holds out a folded paper crane. 'For the road,' she says. 'Keep it in your sleeve.'",
    ],
    journal: {
      id: "zashiki",
      title: "Zashiki-warashi (座敷童) — The Room Child",
      body: "A rare, kind yokai who visits homes and travellers. Her paper cranes are said to protect against the binding of silk and the calling of masks. Households that treat her well prosper. Those who chase her away lose everything, quietly, over years.",
    },
    gift: "paper_crane",
    choices: [
      { id: "accept", text: "Bow, take the crane, thank her by name", to: "mountain_bridge", stamp: "受" },
    ],
  },

  // ---------------- MAIN ROAD BRANCH ----------------
  shrine_torii: {
    id: "shrine_torii",
    kanji: "苔むした鳥居",
    romaji: "Kokemushita torii — The Moss-Covered Gate",
    stage: "strange",
    imagePrompt:
      "a weathered vermilion torii gate half swallowed by moss and creeping vines beside a country road at twilight, a single stone lantern lit with a pale flame, first-person view",
    narration: [
      "You pass a small shrine you have never noticed before. Its torii lists slightly, choked with moss.",
      "A single stone lantern burns without wick or oil. The flame does not flicker in the wind.",
      "Someone — or something — has placed a white paper doll on the offering stone. Its face has been left blank.",
    ],
    journal: {
      id: "paper_doll",
      title: "Hitogata (人形) — Effigy Doll",
      body: "A blank-faced paper doll left as an offering. Folk tradition says these are used to draw sickness or misfortune away from the living — or to bind something to a place.",
    },
    choices: [
      { id: "enter", text: "Pass through the torii", to: "abandoned_shrine", stamp: "参る" },
      { id: "skip", text: "Keep walking — do not look back", to: "twilight_home", stamp: "去る" },
    ],
  },

  abandoned_shrine: {
    id: "abandoned_shrine",
    kanji: "無人の社",
    romaji: "Mujin no yashiro — The Empty Shrine",
    stage: "unsettling",
    imagePrompt:
      "an abandoned mountain shrine at dusk, wooden building weathered, a distant figure in a white bridal kimono standing beneath a plum tree with its back turned, muted indigo and pale moonlight, sumi-e ink wash",
    narration: [
      "Beyond the torii, the path opens into a small clearing. The shrine has clearly been abandoned for years.",
      "Beneath a plum tree stands a figure in a white kimono. Her back is turned. Her hair is very long, and very still.",
      "You hear no cicadas here. The world has gone quiet, as if listening to you.",
    ],
    journal: {
      id: "hanako_bride",
      title: "Yūrei-hanayome (幽霊花嫁) — The Ghost Bride",
      body: "Legend tells of a bride abandoned at this shrine on her wedding day. She waited, and waited, until the mountain claimed her. Those who see her back are said to be spared. Those who see her face are wed to her.",
    },
    choices: [
      { id: "approach", text: "Call out to her softly", to: "ending_brides_call", stamp: "呼ぶ" },
      { id: "leave", text: "Step back slowly, eyes on the ground", to: "twilight_home", stamp: "退く" },
    ],
  },

  twilight_home: {
    id: "twilight_home",
    kanji: "薄明の帰路",
    romaji: "Hakumei no kiro — The Twilight Homeward Path",
    stage: "unsettling",
    imagePrompt:
      "a lonely dusk country road stretching away, a single small figure in the far distance almost invisible, long shadows, faint red glow on the horizon, first person view walking home",
    narration: [
      "You walk on. The evening has stretched too long — the sun should have set by now.",
      "Every time you glance behind, the road is empty. Every time you look ahead, the distant figure has drawn a little closer.",
      "You do not run. You are almost home. Almost.",
    ],
    choices: [
      { id: "final", text: "Reach the outskirts of the village", to: "ending_hakumei", stamp: "帰る" },
    ],
  },

  // ---------------- MOUNTAIN BRANCH ----------------
  mountain_bridge: {
    id: "mountain_bridge",
    kanji: "苔橋",
    romaji: "Kokebashi — The Mossy Bridge",
    stage: "strange",
    imagePrompt:
      "an old wooden bridge over a dark mountain stream deep in a bamboo forest, mist rising from the water, a single ripple on otherwise still surface, first person view at dusk",
    narration: [
      "The trail climbs into cool cedar and bamboo. The village smells vanish behind you.",
      "A narrow wooden bridge crosses a stream so still it looks like ink.",
      "Something under the surface exhales — a single, deliberate ripple.",
      "On the far bank, someone has left a small offering: a cucumber, sliced neatly and placed on a lotus leaf.",
    ],
    journal: {
      id: "kappa",
      title: "Kappa (河童) — River Child",
      body: "A water yokai bound to rivers, bridges and old wells. Kappa are drawn to cucumbers and to promises. They pull the unwise beneath the water. They repay the polite.",
    },
    choices: [
      { id: "bow", text: "Bow, take up the cucumber, and offer it back to the water", to: "kappa_pact", stamp: "礼" },
      { id: "cross", text: "Cross the bridge quickly without looking down", to: "silent_grove", stamp: "急ぐ" },
      { id: "laughter", text: "Follow the small bell of laughter from the bamboo", to: "zashiki_warashi", stamp: "笑", once: true, requires: "no_gift" },
    ],
  },

  kappa_pact: {
    id: "kappa_pact",
    kanji: "河の約束",
    romaji: "Kawa no yakusoku — The River's Promise",
    stage: "distorted",
    imagePrompt:
      "a shadowy small hunched figure with a smooth wet head and a shallow dish of water on its crown, half submerged in a dark stream at dusk, only its yellow eyes visible above the water, sumi-e ink wash, atmospheric",
    narration: [
      "You bow low, offer the cucumber back, and press your forehead to the wooden plank.",
      "Something small and wet takes it from your hands. You do not look up.",
      "A voice like water over stones: 'Return the way you came, and do not follow the singing.' The dish on its head does not spill.",
    ],
    choices: [
      { id: "obey", text: "Turn back toward the village as instructed", to: "ending_river_gratitude", stamp: "従う" },
      { id: "listen", text: "Follow the faint singing you now hear on the wind", to: "silk_hut", stamp: "唄" },
    ],
  },

  silent_grove: {
    id: "silent_grove",
    kanji: "音無しの森",
    romaji: "Otonashi no mori — The Soundless Grove",
    stage: "distorted",
    imagePrompt:
      "a dense dark bamboo forest at night, no wind, no animals, thin silk threads catching moonlight between the stalks, a distant paper lantern glow, first person view",
    narration: [
      "You cross too fast. The bridge groans behind you like a tongue.",
      "Beyond the water, the forest is unnaturally still. No wind. No insects. No footsteps but your own — and, sometimes, one extra.",
      "You see silk threads shining between the bamboo, catching the last light. A paper lantern glows further in.",
    ],
    choices: [
      { id: "lantern", text: "Follow the lantern light", to: "silk_hut", stamp: "灯" },
      { id: "back", text: "Turn back and run toward the bridge", to: "ending_water_sleep", stamp: "逃げる" },
    ],
  },

  silk_hut: {
    id: "silk_hut",
    kanji: "絡の庵",
    romaji: "Karami no iori — The Tangled Hut",
    stage: "horrifying",
    imagePrompt:
      "the interior of an old Japanese thatched hut at night lit by a single paper lantern, walls draped in fine silvery silk threads, a beautiful woman in a black kimono seated with her back to the viewer, her long hair merging with the silk, sumi-e horror atmosphere",
    narration: [
      "A small hut waits in a clearing that shouldn't exist. A woman in a black kimono is seated inside, her back to you.",
      "'You've walked a long way,' she says, without turning. 'Rest. I will pour tea.'",
      "The tatami is covered in fine silvery silk. When you look up, the ceiling is not a ceiling. It is a web, and it moves.",
    ],
    journal: {
      id: "jorogumo",
      title: "Jorōgumo (絡新婦) — The Binding Bride",
      body: "A spider yokai who takes the form of a beautiful woman and weaves lonely huts in silent forests to catch travelers. Her hospitality is genuine — right until the strands tighten.",
    },
    choices: [
      { id: "flee", text: "Do not sit. Break for the door.", to: "ending_binding_bride", stamp: "破" },
      { id: "crane", text: "Reach into your sleeve for the paper crane", to: "ending_paper_crane", stamp: "鶴", requires: "paper_crane" },
    ],
  },

  // ---------------- ENDINGS ----------------
  ending_brides_call: {
    id: "ending_brides_call",
    kanji: "花嫁の呼び声",
    romaji: "Hanayome no yobigoe — The Bride's Call",
    stage: "horrifying",
    isEnding: true,
    tone: "cursed",
    imagePrompt:
      "a woman in a blood-splattered white bridal kimono slowly turning her head toward the viewer at an abandoned mountain shrine at night under a red moon, her face half in shadow, sumi-e ink horror",
    narration: [
      "She turns. Her face is beautiful. Her face is wrong.",
      "'You called,' she whispers. 'I have waited so long.'",
      "The mountain grows over the road behind you. There is no path home now — only the wedding you have accepted.",
    ],
  },

  ending_hakumei: {
    id: "ending_hakumei",
    kanji: "薄明の記憶",
    romaji: "Hakumei no kioku — Twilight Memory",
    stage: "unsettling",
    isEnding: true,
    tone: "haunted",
    imagePrompt:
      "the warm lights of a Japanese village seen from a hillside at nightfall, a lone figure in the foreground with a very long shadow that does not quite match their shape, sumi-e ink",
    narration: [
      "The lanterns of the village finally appear below. You keep walking, and do not look back.",
      "Your shadow, tonight, is a little longer than it should be. In the morning, no one will remember the shrine you saw. But you will.",
      "You have made it home. Something followed. It is patient.",
    ],
  },

  ending_river_gratitude: {
    id: "ending_river_gratitude",
    kanji: "河の恩返し",
    romaji: "Kawa no ongaeshi — The River's Gratitude",
    stage: "peaceful",
    isEnding: true,
    tone: "spared",
    imagePrompt:
      "a peaceful mountain stream at dawn, thin mist rising, a single wet cucumber leaf floating on the water, a faint smile drawn in ripples, sumi-e ink calm",
    narration: [
      "You return the way you came. The village welcomes you as if you had never left.",
      "In the days that follow, your well never runs dry. Your rice never sours. A single wet leaf sometimes appears on your doorstep at dawn.",
      "You gave respect. Something respected you back. Not all things in the mountain want to take.",
    ],
  },

  ending_water_sleep: {
    id: "ending_water_sleep",
    kanji: "水底の眠り",
    romaji: "Minasoko no nemuri — Sleep Beneath the Water",
    stage: "horrifying",
    isEnding: true,
    tone: "drowned",
    imagePrompt:
      "underwater view looking up through dark still water toward a distant wooden bridge and a small green webbed hand reaching down, weeds drifting, sumi-e ink horror",
    narration: [
      "The bridge is not where you left it. Your feet slip. The stream is deeper than any stream should be.",
      "A cool small hand takes your wrist, almost gently. It is not angry. It is not merciful. It is only hungry.",
      "The last thing you see, looking up through the black water, is the shape of the bridge, and a pale dish tilting to spill.",
    ],
  },

  ending_binding_bride: {
    id: "ending_binding_bride",
    kanji: "絹の縛",
    romaji: "Kinu no shibari — The Binding of Silk",
    stage: "horrifying",
    isEnding: true,
    tone: "trapped",
    imagePrompt:
      "silk threads wrapping a small figure in an old thatched hut at night, a woman-shaped shadow with too many limbs on the wall behind, single red paper lantern, sumi-e ink horror",
    narration: [
      "You run. The threshold blooms with silk as fine as breath and as strong as iron.",
      "She does not chase. She never has to.",
      "The hut is patient. The forest is patient. And somewhere far away, on a road you almost took, a village lantern flickers once — for someone who did not come home.",
    ],
  },

  ending_paper_crane: {
    id: "ending_paper_crane",
    kanji: "紙鶴の恩",
    romaji: "Kamitsuru no on — The Paper Crane's Kindness",
    stage: "unsettling",
    isEnding: true,
    tone: "spared",
    requiresGift: "paper_crane",
    imagePrompt:
      "a small folded red paper crane on an old tatami floor unfolding into a burst of white light, silk threads recoiling into the shadows, sumi-e ink wash with warm vermilion accent",
    narration: [
      "You reach into your sleeve. The crane is warm.",
      "As silk descends, the paper unfolds itself in your hand — a small, bright, remembered kindness.",
      "The hut lets you go. The forest lets you go. Somewhere, a child in a red kimono lifts her chin, and then, gently, is gone.",
    ],
  },

  // ---------------- SECOND ACT: VILLAGE RETURN ----------------
  // Reached after a "safe" ending on run >= 2. Familiar earlier places have subtly
  // changed based on prior choices/journal fragments the player carried across runs.
  village_return: {
    id: "village_return",
    kanji: "帰った村",
    romaji: "Kaetta mura — The Village You Returned To",
    stage: "unsettling",
    imagePrompt:
      "a small Japanese village at dusk viewed from an approaching path, lanterns lit but no people visible, one house door standing open, a distant thin figure at the well, sumi-e ink wash horror, quiet dread",
    narration: [
      "The village opens before you again. The lanterns are lit, but no one calls your name.",
      "The path is the path you have walked before. The houses are the houses you have known. And yet, something is not where you remember leaving it.",
      "At the well, a thin figure fills a bucket with slow, patient care. You cannot tell if you knew them, once.",
    ],
    journal: {
      id: "village_shift",
      title: "Mono-no-ke (物の怪) — The Shift of Things",
      body: "Some yokai do not appear. They arrive slowly, over years, in the way a familiar room becomes a little wrong. A vase moved. A shadow that stays after the lamp is blown out. The village itself, remembering something it should not.",
    },
    choices: [
      { id: "well", text: "Approach the figure at the well", to: "ending_village_haunted", stamp: "井" },
      { id: "home", text: "Walk quickly to your own door", to: "ending_village_home", stamp: "家" },
    ],
  },

  ending_village_haunted: {
    id: "ending_village_haunted",
    kanji: "井戸の記憶",
    romaji: "Ido no kioku — The Well Remembers",
    stage: "horrifying",
    isEnding: true,
    tone: "cursed",
    imagePrompt:
      "close-up of a thin figure at an old stone well at dusk turning slightly to reveal it has no lower face, only long black hair and a wet white kimono, sumi-e ink wash horror, muted vermilion accents",
    narration: [
      "The figure turns. Its face is the face of everyone in the village you have ever passed without truly seeing.",
      "'You came back,' the well says, in every voice at once. 'We were beginning to forget you.'",
      "Somewhere else, on a road you did not take, a version of you is still walking home. Somewhere else, they are still safe.",
    ],
  },

  ending_village_home: {
    id: "ending_village_home",
    kanji: "戸口の灯",
    romaji: "Toguchi no tomoshibi — The Lantern at the Door",
    stage: "unsettling",
    isEnding: true,
    tone: "spared",
    imagePrompt:
      "a warm paper lantern glowing beside an old wooden Japanese door at nightfall, a small pair of geta sandals waiting on the stone, a single moth circling, sumi-e ink wash with warm parchment tones",
    narration: [
      "You do not look at the well. You do not look at the door standing open.",
      "Your own lantern burns low. Your own tea, still warm on the table, as if someone had been waiting.",
      "You slide the door shut. Something on the other side breathes out — and then, at last, is quiet.",
    ],
  },

  // ---------------- RARE: KUCHISAKE-ONNA ----------------
  // Triggers when the player takes the main-road branch after having taken it
  // at least once before across runs. She replaces the shrine_torii scene.
  kuchisake_encounter: {
    id: "kuchisake_encounter",
    kanji: "口裂の女",
    romaji: "Kuchisake-onna — The Slit-Mouthed Woman",
    stage: "distorted",
    imagePrompt:
      "a woman in a beige surgical mask and long black hair standing very still on a dusk country road in Japan, holding a pair of scissors partially hidden behind her sleeve, muted amber light behind her, sumi-e ink wash horror, first person view",
    narration: [
      "You have walked this road before, and it has waited for you.",
      "A woman stands at the crossroads where the shrine should have been. She wears a pale surgical mask. She smiles with her eyes.",
      "'Am I pretty?' she asks softly. The scissors at her side catch the last of the light.",
    ],
    journal: {
      id: "kuchisake",
      title: "Kuchisake-Onna (口裂け女) — The Slit-Mouthed Woman",
      body: "A vengeful spirit who stops travellers at dusk crossroads and asks a single question. To answer 'yes' is to see what is behind the mask. To answer 'no' is to be cut where she was cut. The wise are said to answer with a question of their own, or with a small distraction — a hard candy, a puzzle, a name.",
    },
    choices: [
      { id: "yes", text: "'Yes. You are very beautiful.'", to: "ending_kuchisake_yes", stamp: "肯" },
      { id: "no", text: "'No — not really.'", to: "ending_kuchisake_no", stamp: "否" },
      { id: "trick", text: "Offer a hard candy from your pocket instead", to: "ending_kuchisake_candy", stamp: "飴" },
    ],
  },

  ending_kuchisake_yes: {
    id: "ending_kuchisake_yes",
    kanji: "微笑の下",
    romaji: "Bishō no shita — Beneath the Smile",
    stage: "horrifying",
    isEnding: true,
    tone: "cursed",
    imagePrompt:
      "close-up of a woman lowering a surgical mask to reveal a wide slit mouth extending ear to ear, dark blood ink drips, muted vermilion background, sumi-e ink wash horror",
    narration: [
      "She lowers the mask slowly, savouring the courtesy.",
      "'And now?' she whispers. Her mouth continues past where a mouth should end.",
      "You never answer. You never had to.",
    ],
  },
  ending_kuchisake_no: {
    id: "ending_kuchisake_no",
    kanji: "夕暮れの鋏",
    romaji: "Yūgure no hasami — Twilight Shears",
    stage: "horrifying",
    isEnding: true,
    tone: "cursed",
    imagePrompt:
      "a pair of long lacquered scissors laid neatly on a country road at dusk beside a fallen paper lantern, single crimson ribbon of ink stretching down the road, sumi-e ink wash horror, no figures",
    narration: [
      "She does not seem angry. She seems relieved.",
      "'Then let me help,' she says gently, 'so that you may match me.'",
      "The road grows longer behind you. You do not remember how you came to be lying on it.",
    ],
  },
  ending_kuchisake_candy: {
    id: "ending_kuchisake_candy",
    kanji: "飴の礼",
    romaji: "Ame no rei — The Candy's Courtesy",
    stage: "unsettling",
    isEnding: true,
    tone: "spared",
    imagePrompt:
      "a small wrapped hard candy resting on a dusk country road, a pair of geta footprints turning away, faint amber glow of a distant village, sumi-e ink wash, quiet and warm",
    narration: [
      "You bow, hold out the candy, and ask her which sweet-shop she prefers.",
      "For a long moment, she considers the paper wrapper as if it were a lantern.",
      "'The one on the north side,' she murmurs. 'They used to know my name.' And then, politely, she steps aside — and you walk home under a sky that has, for tonight, forgotten to be cruel.",
    ],
  },
};

export const ALL_ENDINGS = Object.values(SCENES).filter((s) => s.isEnding && !s.isHidden);

// -------- HIDDEN TRUTH --------
// Reached only after every non-hidden ending has been unlocked
// AND every yokai journal entry has been discovered.
export const HIDDEN_TRUTH = {
  id: "ending_hidden_truth",
  kanji: "貴方は誰",
  romaji: "Anata wa dare — Who are you?",
  stage: "horrifying",
  isEnding: true,
  isHidden: true,
  tone: "revelation",
  imagePrompt:
    "a first-person view of a rural Japanese road at dusk with several small distant villagers frozen mid-step, their faces turned toward the viewer in quiet dread, their expressions the same as those of yokai, a single red hanko seal floating above the road, sumi-e ink wash horror",
  narration: [
    "You have walked every road. You have met every mask.",
    "Only now, at the end, do you look down.",
    "Your feet do not touch the ground. Your shadow has a shape you do not recognise.",
    "The villagers hurry indoors. The bride at the shrine bows to you. The kappa hides beneath the bridge. The child does not appear.",
    "You have been the story they told to keep their children safe. You have been the reason the lanterns are lit.",
    "The scroll unrolls behind you, and the beautiful beginning was never a beginning. It was the last thing they saw.",
  ],
};

SCENES[HIDDEN_TRUTH.id] = HIDDEN_TRUTH;

export const ALL_YOKAI_JOURNAL_IDS = [
  "paper_doll",
  "hanako_bride",
  "kappa",
  "jorogumo",
  "kuchisake",
  "nurikabe",
  "tenjoname",
  "zashiki",
  "village_shift",
];

export const START_SCENE = "start";

// "Yūgure no michi — The Dusk Road" → "The Dusk Road"
export function englishName(scene) {
  const parts = (scene.romaji || "").split("—");
  return (parts[1] || parts[0] || scene.kanji).trim();
}

const SCROLL_PALETTE = {
  peaceful: "bright serene spring colours, soft golden light, gentle clouds",
  strange: "muted autumn tones, thin mist creeping in, shadows a little too long",
  unsettling: "dim twilight, heavy grey mist, indigo shadows, a faint red glow",
  distorted: "dark wet ink, twisted trees, deep indigo and crimson, figures half-erased",
  horrifying: "black ink bleeding across the paper, blood-red accents, ominous emptiness",
};

// Prompt for a scene's emakimono panel; safe endings return to brighter imagery.
export function scrollPrompt(scene) {
  const palette =
    scene.isEnding && scene.tone === "spared"
      ? "warm dawn light returning, gold leaf clouds and soft vermilion, peaceful and joyful"
      : SCROLL_PALETTE[scene.stage] || SCROLL_PALETTE.peaceful;
  return `${scene.imagePrompt}, ${palette}`;
}

// Every image the game can ask for: scene art + one scroll panel per scene.
export function allImageJobs() {
  const scenes = Object.values(SCENES).filter((s) => s.imagePrompt);
  return [
    ...scenes.map((s) => ({ scene_id: s.id, prompt: s.imagePrompt, style: "scene" })),
    ...scenes.map((s) => ({ scene_id: `scroll_${s.id}`, prompt: scrollPrompt(s), style: "scroll" })),
  ];
}
