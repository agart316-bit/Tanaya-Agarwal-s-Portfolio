/* ==========================================================================
   Mobile portfolio — Tanaya Agarwal
   Ported from the "Mobile Portfolio v2" prototype to plain JS.
   Loaded by index.html only below 560px, and by mobile.html for preview.
   Requires: three.min.js + liquid-ether-vanilla.js (already on the page).
   ========================================================================== */

(function () {
"use strict";

const L = (t) => ({ kind: "lead", text: t });
const P = (t) => ({ kind: "para", text: t });
const H = (h, t) => ({ kind: "head", head: h, text: t });
const I = (src, alt) => ({ kind: "img", src, alt });
const G = (...items) => ({ kind: "grid", items: items.map((x) => ({ src: x[0], alt: x[1] })) });
const S = (...items) => ({ kind: "strip", items: items.map((x) => ({ src: x[0], alt: x[1] })) });
const C = (t) => ({ kind: "cap", text: t });

const PROJECTS = {
  p1: {
    num: "1", index: "01 / 13", cat: "Illustration & Motion", title: "Men Of Platinum",
    kicker: "Illustration & Motion", accent: "#4a525e",
    lede: "A social campaign for the MS Dhoni Signature Collection that shows the platinum before it becomes jewellery — blueprint to finished piece.",
    hero: "projects/1/project-1-1.webp", heroAlt: "Men of Platinum campaign key visual",
    rail: [
      { label: "Role", value: "Concept, research & illustration" },
      { label: "Year", value: "2025" },
      { label: "Medium", value: "Illustration for social — Illustrator, Photoshop" },
      { label: "Client", value: "Famous Innovations, for Men of Platinum" }
    ],
    tags: ["Illustration", "Campaign", "Motion"],
    blocks: [
      L("Men of Platinum is a platinum jewellery brand by PGI India, and this collection was a collaboration with MS Dhoni built around composure, self-belief and quiet strength. I led ideation, research and execution. The concept was to take viewers from blueprint to finished piece — making the craftsmanship visible rather than only the result."),
      I("projects/1/project-1-4.webp", "Illustrated product, finished state"),
      H("Hand-illustrated, handed off", "I illustrated every product in the collection across multiple versions and angles, then handed the files to the video team, who used them as the base for reels and social posts. Working in illustration rather than product photography meant the construction of each piece could stay visible — the blueprint reads as a drawing, not a render."),
      G(["projects/1/project-1-2.webp", "Illustration, blueprint stage"], ["projects/1/project-1-11.webp", "Illustration, finished stage"], ["projects/1/project-1-7.webp", "Product illustration, alternate angle"], ["projects/1/project-1-5.webp", "Product illustration, detail"])
    ],
    band: { label: "Live", bg: "#e0e4e9", ink: "#2b323c", note: "Published across Men of Platinum’s social channels during the collection launch.", cols: "1fr", images: [{ src: "projects/1/project-1-13-poster.webp", alt: "Campaign video still" }] },
    credits: "Credits — Made at Famous Innovations, Mumbai, for Men of Platinum (PGI India). Video editing by the in-house motion team.",
    nextKey: "p3", nextTitle: "Digital Illustrations"
  },

  p3: {
    num: "3", index: "02 / 13", cat: "Illustration & Motion", title: "Digital Illustrations",
    kicker: "Illustration", accent: "#1f7fa8",
    lede: "Two series — five postcards that walk you into Santorini, and two recipe cards for the cakes I kept coming back to.",
    hero: "projects/3/project-3-1.webp", heroAlt: "Santorini postcard series, opening piece",
    rail: [
      { label: "Role", value: "Illustration" },
      { label: "Year", value: "2022 – 2024" },
      { label: "Medium", value: "Procreate, Illustrator" },
      { label: "Output", value: "5 postcards, 2 recipe cards" }
    ],
    tags: ["Illustration", "Colour", "Series"],
    blocks: [
      H("Santorini in 5", "Five digital postcards, each capturing a different aspect of the place and pulling the viewer closer with every piece. The first introduces it by name; after that the text steps back and lets the imagery do the work. The palette stays in one world throughout — powder blue skies, white plaster, cobalt shutters, the occasional burst of magenta bougainvillea — while the scale shifts from wide landscape views down to a church bell and a vase of flowers. The idea was to make someone feel like they had been there, not just seen a photo of it."),
      G(["projects/3/project-3-2.webp", "Santorini postcard two"], ["projects/3/project-3-3.webp", "Santorini postcard three"], ["projects/3/project-3-4.webp", "Santorini postcard four"], ["projects/3/project-3-5.webp", "Santorini postcard five"]),
      H("Comfort Food", "During lockdown I started baking and turned it into a small business, Truffle and Hustle. Carrot cake and lemon cake were the two recipes I kept returning to, and for a long time my references were a photo on my phone or measurements scrawled on paper. I illustrated them instead — hand-lettered ingredients built around the finished dish — so they could go up in the kitchen and actually be used."),
      G(["projects/3/project-3-6.webp", "Carrot cake recipe card"], ["projects/3/project-3-7.webp", "Lemon cake recipe card"])
    ],
    band: null,
    credits: "Credits — Illustration and lettering: Tanaya Agarwal.",
    nextKey: "p4", nextTitle: "ArtsyDesign.co"
  },

  p4: {
    num: "4", index: "03 / 13", cat: "Print & Editorial", title: "Artsy Design.co",
    kicker: "Illustration & Product", accent: "#bf6484",
    lede: "A unicorn-themed stationery line for teenagers — illustrated, then styled and shot for launch.",
    hero: "projects/4/project-4-1.webp", heroAlt: "Stationery brand composition",
    rail: [
      { label: "Role", value: "Illustration, styling & photography" },
      { label: "Year", value: "2020" },
      { label: "Medium", value: "Illustrator, Photoshop, product photography" },
      { label: "Client", value: "ArtsyDesign.co" }
    ],
    tags: ["Illustration", "Product", "Photography"],
    blocks: [
      L("The target audience was teenage girls, so everything about the line needed to feel bold, playful and full of colour: hot pinks, purples, gold accents, bold stripes and patterns — the kind of stationery that actually makes you want to use it. I was involved across the whole process, from research and illustration through to the product shoot and social."),
      I("projects/4/project-4-2.webp", "Notebook and stationery flat lay"),
      H("Illustrated, then shot", "I drew the artwork for the collection and then styled and photographed the promotional imagery myself, which kept the colour of the print and the colour of the photograph in the same register. The sets were built to be shot from above so the patterns stay flat and readable at social crop."),
      G(["projects/4/project-4-3.webp", "Gift set with notebook and stationery"], ["projects/4/project-4-4.webp", "Stationery in open presentation box"])
    ],
    band: { label: "In market", bg: "#f7e3e7", ink: "#6a3346", note: "The line launched to market as a boxed stationery set.", cols: "1fr", images: [{ src: "projects/4/project-4-5.webp", alt: "Pastel pens and stationery arrangement" }] },
    credits: "Credits — Made at ArtsyDesign.co. Illustration, styling and product photography: Tanaya Agarwal.",
    nextKey: "p5", nextTitle: "Dream Journals"
  },

  p5: {
    num: "5", index: "04 / 13", cat: "Print & Editorial", title: "Dream Journals",
    kicker: "Print & Product", accent: "#3d8f95",
    lede: "A 200-page bullet journal for students — hand-illustrated month by month and sold in hardcover and leather-bound editions.",
    hero: "projects/5/project-5-3.webp", heroAlt: "Dream Journals hero image",
    rail: [
      { label: "Role", value: "Founder, design & illustration" },
      { label: "Year", value: "2020" },
      { label: "Medium", value: "Print — Illustrator, Procreate, InDesign" },
      { label: "Output", value: "200-page journal, two bindings" }
    ],
    tags: ["Editorial", "Illustration", "Product"],
    blocks: [
      L("Dream Journals started from something I was already doing: hand-drawing my own journal every year. Friends kept asking me to make them one, and eventually I wanted a way to make it available to anyone who wanted one but did not have the time or inclination to draw it themselves. I founded it through the Young Entrepreneurship Academy programme and took it to production."),
      I("projects/5/project-5-6.webp", "Dream Journals, cover"),
      H("Built around what students actually need", "Each month is hand-illustrated around its own theme, but the layout is fixed and practical: monthly and weekly calendars, a homework and project tracker, a budget tracker, sleep, mood and habit trackers. The illustration changes twelve times; the grid never does — which is what makes a 200-page book usable for a full academic year."),
      G(["projects/5/project-5-4.webp", "Illustrated month opener"], ["projects/5/project-5-5.webp", "Illustrated month opener"]),
      I("projects/5/project-5-1.webp", "Planner page, tracker spread"),
      G(["projects/5/project-5-7.webp", "Weekly spread"], ["projects/5/project-5-9.webp", "Journal interior detail"])
    ],
    band: {
      label: "In hand", bg: "#daecec", ink: "#23494c",
      note: "Produced in hardcover and leather-bound editions and sold to students. Eight of the illustrated spreads — swipe through.",
      cols: "1fr",
      images: [
        { src: "projects/5/project-5-11.webp", alt: "Illustrated spread 1 of 8" },
        { src: "projects/5/project-5-12.webp", alt: "Illustrated spread 2 of 8" },
        { src: "projects/5/project-5-13.webp", alt: "Illustrated spread 3 of 8" },
        { src: "projects/5/project-5-14.webp", alt: "Illustrated spread 4 of 8" },
        { src: "projects/5/project-5-15.webp", alt: "Illustrated spread 5 of 8" },
        { src: "projects/5/project-5-16.webp", alt: "Illustrated spread 6 of 8" },
        { src: "projects/5/project-5-17.webp", alt: "Illustrated spread 7 of 8" },
        { src: "projects/5/project-5-18.webp", alt: "Illustrated spread 8 of 8" }
      ]
    },
    credits: "Credits — Founded through the Young Entrepreneurship Academy. Design, illustration and production: Tanaya Agarwal.",
    nextKey: "p6", nextTitle: "Lost in Translation"
  },

  p6: {
    num: "6", index: "05 / 13", cat: "Print & Editorial", title: "Lost in Translation",
    kicker: "Print & Editorial", accent: "#5b6068",
    lede: "A self-published booklet about Indian craft rebranded as Western trend — typeset so the footnotes carry more weight than the headlines.",
    hero: "projects/6/project-6-1.webp", heroAlt: "Lost in Translation, two copies of the printed cover",
    rail: [
      { label: "Role", value: "Interviews, design & typesetting" },
      { label: "Year", value: "2026" },
      { label: "Medium", value: "Print — InDesign, Illustrator" },
      { label: "Output", value: "94-page booklet, US Letter, saddle stitched" }
    ],
    tags: ["Editorial", "Typography", "Publishing"],
    blocks: [
      L("Indian culture has been trending for a while now — turmeric lattes, Prada sandals, mangal sutras rebranded as minimalist jewellery — and the closer you look, the harder it is to find the people who actually made any of it. This book sits with that gap. Three conversations across fashion, wellness and jewellery ask the people who work closest to these traditions what gets taken, what gets renamed, and what gets left behind."),
      I("projects/6/project-6-2.webp", "Abstract page, centred monospace text on an otherwise empty spread"),
      H("Hierarchy, set in type", "The argument of the book is about who gets to speak first. A Western brand takes centre stage and the origin is reduced to an aesthetic, so the typography reverses that order. Questions are set in Chandira, a display face that references Devanagari letterforms without borrowing them, and they interrupt the page rather than introduce it. The answers sit in plain monospace, unembellished, so the voices are never dramatised. Where a conversation turns, a single phrase is pulled out at full scale and left alone."),
      G(["projects/6/project-6-3.webp", "WORN, the opening section with Akshata Bhojania, illuminated capitals in pink"], ["projects/6/project-6-4.webp", "Question spread, the question in Chandira and the answer in monospace with footnotes below"]),
      I("projects/6/project-6-5.webp", "A pulled quote at full scale facing the running answer"),
      H("Footnotes as the foundation", "Kolhapuri chappals, chikankari, vastu, ayurveda, turmeric, kanji — each term is struck through where it appears and rebuilt underneath. The footnotes are not small academic asides; they are given size and space, because context is the first thing that gets cut. Each interview carries its own colour over one restrained structure, and nothing bleeds off the page, which keeps the whole thing printable at home. The white space is doing the same work as the footnotes: it marks what is missing."),
      G(["projects/6/project-6-7.webp", "Wellness section, a phrase from the interview built across the spread in type and image"], ["projects/6/project-6-9.webp", "ADORNED, the jewellery section with Neetu Agarwal, illuminated capitals in blue"])
    ],
    band: { label: "In hand", bg: "#e3e5e7", ink: "#33373c", note: "Printed two-up on standard copy paper, folded, stapled and glued — the assembly instructions are bound into the back. It is published through Invisible Press, a distributed DIY imprint that only exists when someone prints it: the reader becomes the publisher.", cols: "1fr", images: [{ src: "projects/6/project-6-12.webp", alt: "Assembly instructions facing the colophon at the end of the book" }] },
    credits: "Credits — Published through Invisible Press, New York City, 2026. Interviews with Akshata Bhojania and Neetu Agarwal. Typefaces: Chandira, DejaVu Sans Mono, Zapfino. Design and typesetting: Tanaya Agarwal.",
    nextKey: "p7", nextTitle: "Black Hole"
  },

  p7: {
    num: "7", index: "06 / 13", cat: "Print & Editorial", title: "Black Hole",
    kicker: "Print & Editorial", accent: "#33406e",
    lede: "A Wikipedia article rebuilt as a printed book — designed as a single gradual descent, where every spread pulls the reader further in.",
    hero: "projects/7/project-7-1.webp", heroAlt: "Black Hole, matte black cover with a glossy black title that only appears when light hits it",
    rail: [
      { label: "Role", value: "Design & typesetting" },
      { label: "Year", value: "2022" },
      { label: "Medium", value: "Print — InDesign, Illustrator" },
      { label: "Output", value: "Book & glossary booklet, 8.3 × 5.7 in" }
    ],
    tags: ["Editorial", "Systems", "Typography"],
    blocks: [
      L("A Wikipedia article set as a printed book, thinking about how typography, layout and imagery shape the way something is read. I chose black holes because the subject already carries scale and mystery, and I wanted to see whether design could reflect an idea rather than only organise it."),
      H("The whole book as one descent", "It opens with a bright white index that asks questions instead of listing chapters — navigating the descent. From there the book moves into full-bleed black pages with images running across every one, and never comes back up. New topics open on a wide single column before dropping into two narrower ones, so the measure tightens as the reader goes deeper."),
      G(["projects/7/project-7-4.webp", "The white index spread, questions instead of chapter titles"], ["projects/7/project-7-5.webp", "Opening chapter spread, wide column dropping into two narrower ones"]),
      I("projects/7/project-7-6.webp", "Etymology spread, full-bleed black with handwritten annotation across the recto"),
      G(["projects/7/project-7-8.webp", "Observational evidence chapter opener"], ["projects/7/project-7-9.webp", "Alternatives spread, body text facing handwritten equations"]),
      H("Definitions kept out of the way", "Terms set in italics are carried into a separate glossary booklet, so a definition never interrupts the flow of a page. The references and notes return to white at the end, closing the descent where it started. The cover is matte black with a glossy black title that only appears when light hits it.")
    ],
    band: { label: "In hand", bg: "#dee2ef", ink: "#1e2848", note: "The glossary booklet sits alongside the book, white against matte black — the only place the descent lets up.", cols: "1fr", images: [{ src: "projects/7/project-7-10.webp", alt: "The glossary booklet resting on the matte black book" }] },
    credits: "Credits — Source text from the Wikipedia article “Black hole,” CC BY-SA. Design, typesetting and photography: Tanaya Agarwal.",
    nextKey: "p8", nextTitle: "Paintings"
  },

  p8: {
    num: "8", index: "07 / 13", cat: "Fine Art", title: "Paintings",
    kicker: "Fine Art", accent: "#c4622e",
    lede: "Four canvases about being partly seen, and about the places that hold what you remember.",
    hero: "projects/8/project-8-1.webp", heroAlt: "Eclipsed Gaze, acrylic on canvas",
    rail: [
      { label: "Role", value: "Painting" },
      { label: "Year", value: "2022 – 2024" },
      { label: "Medium", value: "Acrylic on canvas" },
      { label: "Output", value: "4 original works" }
    ],
    tags: ["Fine Art", "Colour"],
    blocks: [
      H("Eclipsed Gaze", "A portrait where the eyes are covered — not by accident but by the painting itself. A loose sweep of blue and green cuts across her face and drips down. She is still, calm, chin resting in her hand. The eclipse is the point: something is hidden and she does not seem to mind. I was interested in what it looks like to be seen partially, and how much of a person still comes through."),
      H("Refuge", "Home as the place that holds every memory you make in it. The painting layers two gardens: my grandmother’s childhood home and the one I grew up in. The dense overgrowth was intentional — the leaves spill toward the viewer to pull you into the space rather than show it to you. The canvas is large for the same reason. Safety feels immersive, not distant."),
      I("projects/8/project-8-2.webp", "Refuge, acrylic on canvas"),
      H("Escape to the Edge", "Nostalgia pulls you back to places, not only times. For me it has always been beaches — Mumbai, Abu Dhabi, Koh Samui. This triptych, inspired by the work of Hema Upadhyay, looks at those coastlines from a bird’s-eye view: shapes, textures, the way land and water meet. The urge to drop into a place that makes you feel alright the moment you see it."),
      S(["projects/8/project-8-3.webp", "Escape to the Edge, left panel"], ["projects/8/project-8-4.webp", "Escape to the Edge, centre panel"], ["projects/8/project-8-5.webp", "Escape to the Edge, right panel"]),
      H("Boulevard of Broken Tattoos", "Ideas collect — tattoo concepts, images, lines you want to put on your body but never quite do. Mine kept accumulating. This painting is what that pile looks like when it is all put onto one canvas. Tattoos are how I process identity, and this is that process with nowhere to go but inward, in colours that stick with you."),
      I("projects/8/project-8-6.webp", "Boulevard of Broken Tattoos, acrylic on canvas")
    ],
    band: null,
    credits: "Credits — Acrylic on canvas. Painting and photography: Tanaya Agarwal.",
    nextKey: "p9", nextTitle: "Black N White"
  },

  p9: {
    num: "9", index: "08 / 13", cat: "Fine Art", title: "Black N White",
    kicker: "Fine Art", accent: "#26221e",
    lede: "Two series in stippling and charcoal, all about what memory keeps and what it flattens.",
    hero: "projects/9/project-9-2.webp", heroAlt: "Vehicles of Memory, stippled objects",
    rail: [
      { label: "Role", value: "Drawing" },
      { label: "Year", value: "2022 – 2024" },
      { label: "Medium", value: "Ink on paper (stippling), charcoal" },
      { label: "Output", value: "2 series" }
    ],
    tags: ["Fine Art", "Drawing"],
    blocks: [
      H("Vehicles of Memory", "You cannot hold onto moments, only the things that remind you of them. This piece collects objects I kept over the years, each one carrying a memory I was not ready to let go of. Drawn in stippling: a thousand dots forming one image, the same way a thousand small moments form one memory."),
      G(["projects/9/project-9-2-rose.webp", "Stippled rose, drawn at full size"], ["projects/9/project-9-2-elephant.webp", "Stippled elephant toy, drawn at full size"]),
      C("Detail — two plates at full size, where the dots stop resolving into objects."),
      H("Slides from Juhu", "Juhu is my childhood neighbourhood and still the place I think of as home. I went back to the same spots and drew them live, letting charcoal do what a photograph cannot — carry the weight of what those places mean. The grid reads like flipping through an old photo album, in black and white because memory has its own rawness."),
      I("projects/9/project-9-3.webp", "Slides from Juhu, charcoal collage")
    ],
    band: null,
    credits: "Credits — Ink on paper (stippling) and charcoal. Drawing and photography: Tanaya Agarwal.",
    nextKey: "p13", nextTitle: "The Upside Down"
  },

  p10: {
    num: "10", index: "10 / 13", cat: "Fine Art", title: "Pottery",
    kicker: "Ceramics", accent: "#a4553a",
    lede: "Two clay collections: a Winnie the Pooh set you can actually hold, and a studio tool that stops being clutter.",
    hero: "projects/10/project-10-1.webp", heroAlt: "Pottery collection on black ground",
    rail: [
      { label: "Role", value: "Making & glazing" },
      { label: "Year", value: "2022 – 2024" },
      { label: "Medium", value: "Hand-built clay, wheel throwing, glaze" },
      { label: "Output", value: "2 collections" }
    ],
    tags: ["Ceramics", "Product", "Craft"],
    blocks: [
      H("Pooh-tery", "A pottery collection inspired by Winnie the Pooh. The story is set in the English countryside and each piece pulls from a different part of it: a honey pot, Piglet, tree-bark texture, Eeyore. Jars, mugs and bowls, all in clay and glaze. It started from a genuine love for the story and became an excuse to translate something nostalgic into something you can hold."),
      I("projects/10/project-10-2.webp", "Pooh-tery, lidded vessel"),
      H("Pot!", "Pot! is a multifunctional studio tool — brush holder, water cup and palette in one. As an artist I was always looking for a palette that did not disrupt the feel of my workspace; most of them do. Pot! was the answer: something that blends into a desk rather than cluttering it, and works just as well for anything else you need it for."),
      I("projects/10/project-10-4.webp", "Pot!, studio multitool with brush")
    ],
    band: { label: "In hand", bg: "#eddfd6", ink: "#4e2418", note: "Thrown, glazed and used — the scale is set by the hand that holds it.", cols: "1fr", images: [{ src: "projects/10/project-10-3.webp", alt: "Hand holding ceramic bowl and cup" }] },
    credits: "Credits — Hand-built and wheel-thrown clay, glazed. Making and photography: Tanaya Agarwal.",
    nextKey: "p11", nextTitle: "Installations"
  },

  p11: {
    num: "11", index: "11 / 13", cat: "Spatial / Installation", title: "Installations",
    kicker: "Installation", accent: "#b8830f",
    lede: "Three installations about food, shame and the things you carry — painted, printed and braided.",
    hero: "projects/11/project-11-1.webp", heroAlt: "Eat Up!, painted wooden blocks",
    rail: [
      { label: "Role", value: "Concept & making" },
      { label: "Year", value: "2022 – 2024" },
      { label: "Medium", value: "Cyanotype, textile, acrylic, mixed media" },
      { label: "Output", value: "3 installations" }
    ],
    tags: ["Installation", "Textile", "Mixed Media"],
    blocks: [
      H("Eat Up!", "This piece is about the relationship between food and how we are taught to think about it. The food pyramid gets reconstructed in our heads as we grow up, and health takes a back seat to what is expected of us. I painted that shift onto wooden blocks in the colours and format of a children’s toy, because that is often where it starts — bright, familiar, and a little unsettling up close."),
      H("Airing out your Dirty Laundry", "My relationship with food has been an emotional one, and growing up I was taught to keep that quiet. This work pushes back. Using cyanotype I printed food directly onto garments — touching it, working with it — and hand-stitched labels that read like fashion tags but carry the phrases people hear when they are battling issues with food. Clothes on a rack, displayed without apology."),
      G(["projects/11/project-11-3.webp", "Cyanotype textile detail"], ["projects/11/project-11-4.webp", "Garments with stitched labels on rack"]),
      H("Fabrication", "Textiles from different parts of my life, braided and knotted together. Every memory, experience and turning point is literally tied in, and the wire and knots mark the moments where things changed. The colours reference other works in my practice, each carrying its own story. It keeps extending, because the story is not finished — a non-representational version of me, in progress."),
      I("projects/11/project-11-5.webp", "Fabrication, braided textile on pedestal")
    ],
    band: { label: "Installed", bg: "#f6e9cf", ink: "#54390a", note: "Airing out your Dirty Laundry, shown on a garment rack at exhibition scale.", cols: "1fr", images: [{ src: "projects/11/project-11-2.webp", alt: "Dyed garments on rack, installed" }] },
    credits: "Credits — Cyanotype, textile, acrylic and mixed media. Concept, making and documentation: Tanaya Agarwal.",
    nextKey: "p12", nextTitle: "The Borges Stories"
  },

  p12: {
    num: "12", index: "12 / 13", cat: "Web & App Design", title: "The Borges Stories",
    kicker: "Web Design", accent: "#2f6f6b",
    lede: "Three Borges stories rebuilt as three websites, each interface designed to behave the way its story behaves.",
    hero: "projects/12/project-12-1.webp", heroAlt: "Entry screen asking the reader one question",
    rail: [
      { label: "Role", value: "Concept, design & build" },
      { label: "Year", value: "2024" },
      { label: "Medium", value: "Web — Figma, HTML/CSS/JS" },
      { label: "Output", value: "Live site, three stories" }
    ],
    tags: ["Interaction", "Narrative systems", "Type"],
    blocks: [
      L("The obvious move — illustrate the stories, wrap them in a scrolling e-book — would have made three pretty pages and adapted nothing. So the interface itself became the adaptation, and the entry screen asks one question before you read: what do you believe about how stories move. The three answers route to the three stories, which is how three unrelated worlds ended up sharing a single door."),
      I("projects/12/project-12-2.webp", "The Book of Sand card grid"),
      H("Three malfunctions", "Each story breaks a different rule of its own interface. The Book of Sand has no first or last page, so the reader draws its cards at random, like tarot — only once all of them are drawn does the grid flip into the intended sequence. The Circular Ruins is about a dreamer who is himself dreamt, so the screen tears itself down and rebuilds as you navigate. The Garden of Forking Paths branches on selection — two readers never take the same route. None of it is decoration: each behaviour is a deliberate malfunction, tuned to feel tactile but slightly wrong."),
      G(["projects/12/project-12-3.webp", "Book of Sand, card open in place"], ["projects/12/project-12-5.webp", "The Circular Ruins, the screen reached twice"]),
      I("projects/12/project-12-6.webp", "The Garden of Forking Paths, branching route"),
      H("One typeface holding it together", "Three worlds behaving this differently read as three separate projects unless something is unyielding, so every world is stripped to one monospace face, black on off-white — no colour, no imagery, no per-story logo. It shipped as a live site and all three stories read end to end on desktop and mobile. What I would change: the malfunctions are legible to a reader who already trusts the piece, and the Book of Sand draw loses everyone else. The flip into sequence should announce itself.")
    ],
    band: { label: "In use", bg: "#d7e8e6", ink: "#22403e", note: "Each world holds its behaviour at phone width. The malfunctions had to survive a thumb, not just a cursor.", cols: "1fr 1fr", images: [{ src: "projects/12/project-12-8.webp", alt: "Book of Sand on mobile" }, { src: "projects/12/project-12-9.webp", alt: "Circular Ruins on mobile" }] },
    credits: "Credits — Stories by Jorge Luis Borges. Concept, design and build: Tanaya Agarwal.",
    nextKey: "p14", nextTitle: "Bindaas"
  },

  p13: {
    num: "13", index: "09 / 13", cat: "Fine Art", title: "The Upside Down",
    kicker: "Fine Art", accent: "#26221e",
    lede: "Candy Land redrawn in ink for a generation raised on collapsing certainties — a playable board where the thing waiting at the end is an empty wrapper.",
    hero: "projects/13/project-13-2.webp", heroAlt: "The Upside Down game board, ink and hatching",
    rail: [
      { label: "Role", value: "Drawing & game design" },
      { label: "Year", value: "2024" },
      { label: "Medium", value: "Ink on paper, hatching — board and cards digital" },
      { label: "Output", value: "Playable board and card deck" }
    ],
    tags: ["Fine Art", "Drawing", "Game design"],
    blocks: [
      L("Candy Land was my favourite childhood board game, and this is a version of it made after the fact. As we grow up the things we loved early get overwritten by what happens later, and the softer part of a person ends up sealed under something harder. I redrew the board in ink, using hatching to hold two registers at once: what is visible on the surface, and what has been buried beneath it."),
      I("projects/13/project-13-1.webp", "The Upside Down, the original ink drawing"),
      H("No moves, only cards", "The original has no player agency: you draw, you follow, you win or lose on luck. I kept that intact because it mirrors how we move through most things now — trends, feeds, peer pressure — without actually choosing any of it. The card structure stays identical to Candy Land. What changes is the board, which is deliberately chaotic, because the overwhelm is the point."),
      I("projects/13/project-13-3.webp", "The full deck: colour cards and landmark cards"),
      H("What wears a person down", "The landmarks along the path are the things that actually do the wearing now — recession, pandemic, climate anxiety, algorithmic surveillance — drawn as Weeping Bough, Doomscroll Patch, Burnout Bog, The Drip, Side Hustle, Block and The Slump. The goal at the end of the road is The Empty Wrapper, because the prescribed path of school, job, house, retirement no longer promises anything worth arriving at."),
      I("projects/13/project-13-4.webp", "Landmark cards and the printed deck box")
    ],
    band: { label: "In hand", bg: "#e6e4e0", ink: "#26221e", note: "Printed as a deck and a folding board. At table size the hatching stops reading as texture and starts reading as weather.", cols: "1fr", images: [{ src: "projects/13/project-13-5.webp", alt: "The deck and colour cards laid out" }] },
    credits: "Credits — Ink on paper, with the board and card deck produced digitally. After Candy Land (Eleanor Abbott, 1949). Drawing, game design and photography: Tanaya Agarwal.",
    nextKey: "p10", nextTitle: "Pottery"
  },

  p14: {
    num: "14", index: "13 / 13", cat: "Web & App Design", title: "Bindaas",
    kicker: "App Design", accent: "#16309b",
    lede: "A travel guide for girls backpacking solo across India, where every listing is verified by a girl who went there herself.",
    hero: "projects/14/project-14-1.webp", heroAlt: "Home screen, Rishikesh",
    rail: [
      { label: "Role", value: "Concept, UX & UI" },
      { label: "Year", value: "2026" },
      { label: "Medium", value: "Figma — wireframes" },
      { label: "Output", value: "Ten screens, one flow" }
    ],
    tags: ["Product", "Safety", "Type"],
    blocks: [
      L("What a girl travelling alone in India actually wants to know is not on any listing page. Is the dorm floor women-only, how late does that street stay lit, how far is the nearest auto, and has anyone like me slept here. That information exists, but it is scattered across group chats and comment threads, and it expires. Bindaas is built on one rule: nothing appears on a listing unless a girl who went there put it there."),
      H("Four fields, always in the same order", "Every listing in the app — a hostel, a café, a 4am jeep — carries the same strip: dorm type, how late the street stays lit, distance to autos, and how many girls have confirmed it. Same four, same order, so you learn to read it in a glance and can compare two places without re-reading either. When a field has no answer it says not confirmed yet rather than filling in a plausible guess, and every price carries the date it was last confirmed, because a stale fare is what gets you overcharged at the station."),
      G(["projects/14/project-14-2.webp", "Sleep list, strip leading each row"], ["projects/14/project-14-3.webp", "Eat list with a benchmark price plaque"]),
      C("The strip leads the row on sleep, where it matters most; on eat it sits under a benchmark price, so an overcharge is obvious before you order."),
      H("Backup, and where the paint stops", "Backup sits in the same corner of every screen: two chosen contacts, a one-tap check-in before 10pm, a fake incoming call, offline copies of documents, and a hold-to-send SOS. Setting it up once is the whole interaction — after that it just sits there. It is also the one screen where the truck-art language drops out entirely. No extruded titles, no Hindi second line, no painted plaques. If you are opening this screen you are not in the mood for a personality, so it stays flat, dark and calm."),
      I("projects/14/project-14-4.webp", "Backup screen, calm and unpainted"),
      H("A city as an issue", "The home screen went through two readings. The first is a feed. The second treats each city as an issue of a zine — numbered sections, a contents page, a monsoon note across the bottom — which gave the guide a reason to have an editorial voice instead of a ranking algorithm. Both keep the four fields intact; only the framing around them changes."),
      G(["projects/14/project-14-5.webp", "City home read as a zine issue"], ["projects/14/project-14-6.webp", "Do list, each listing marked alone-ok"]),
      H("Fares, finds, and the longer route", "The map offers a route that is four minutes longer and stays on lit road the whole way, and says how many girls walked it this month. Drops is the week's traffic from girls in town — fare corrections, a tailor behind the post office, two spare seats in a jeep — the stuff that is true for a week and then is not. The trip planner shares cities and dates with home, and only cities and dates: a plan your mother can follow without a live dot on a map."),
      S(["projects/14/project-14-7.webp", "Map with lit-route option"], ["projects/14/project-14-8.webp", "Drops feed of fare corrections and finds"], ["projects/14/project-14-9.webp", "Trip planner, cities and dates shared"]),
      H("Stamps, not a score", "The profile counts states crossed as painted roundels rather than points or levels — travel is the reward, and a leaderboard would push girls to move faster than they should. The visual language throughout borrows from Indian truck art: painted tin plaques, hand-lettered extruded titles, Hindi set beside English. What I would change: the strip is dense at four fields, and on the smallest phones the fourth wraps to its own line — it wants a compressed variant before this gets built."),
      I("projects/14/project-14-10.webp", "Profile, stamps as painted roundels")
    ],
    band: null,
    credits: "Credits — Concept, UX and UI: Tanaya Agarwal. Wireframes in Figma.",
    nextKey: "p1", nextTitle: "Men Of Platinum"
  }
};

const ORDER = ["p1","p3","p4","p5","p6","p7","p8","p9","p10","p11","p12","p13","p14"];
const CATS = ["Illustration & Motion","Print & Editorial","Fine Art","Spatial / Installation","Web & App Design"];
const DOCK_TITLES = { about: "About", resume: "Resume", references: "References", contacts: "Contacts", photos: "Photos" };

const EXPERIENCES = [
  { id:"artsy", company:"Artsy Design.Co", date:"2021", tags:["Internship","Branding","Illustrator"],
    body:"I conceptualized and launched a targeted product collection for teenagers, managing product development, photoshoots, and client relationships. Created and promoted engaging social media content, fostering new client relationships and expanding the collection’s reach to the teenage demographic.",
    projectKey:"p4" },
  { id:"dream", company:"Dream Journals", date:"2019-2021", tags:["Founder","Designer","Sales"],
    body:"I designed and produced a 200-page hand-illustrated bullet journal, overseeing printing, binding, quality control, and creative elements. Managed sales and marketing strategies, including pop-up events, online platforms, and customer interactions, while maintaining accurate financial records.",
    projectKey:"p5" },
  { id:"truffle", company:"Truffle N Hustle", date:"2020-2022", tags:["Founder","Packaging","Operations"],
    body:"I launched and grew a home-baked goods company, developing unique recipes and selling over 200 cakes, demonstrating strong customer demand and business viability. Managed marketing, social media promotion, packaging design, and sales logistics, including order fulfilment and customer interactions.",
    projectKey:null },
  { id:"artclub", company:"Art Club", date:"2022", tags:["Events","Organiser"],
    body:"I coordinated artistic initiatives, developing project plans and facilitating collaborations. Supported students' artistic growth, hosted exhibitions, and fostered a collaborative creative environment.",
    projectKey:null },
  { id:"kalakaar", company:"Kalakaar", date:"2023", tags:["Art Direction","Leadership"],
    body:"I raised funds for underfunded organisations by hosting an event showcasing creativity and supporting social causes. Collaborated with NGOs, incorporating stalls, games, and activities to engage attendees, increase awareness, and foster community participation.",
    projectKey:null },
  { id:"designera", company:"Design Era", date:"2024", tags:["Exhibition","Curation","Artist"],
    body:"Presented selected work in a public showcase, shaping narrative flow, curation, and presentation format to communicate process and final outcomes.",
    projectKey:null },
  { id:"famous", company:"Famous Innovations", date:"2025", tags:["Internship","Strategy","Illustrator"],
    body:"I designed visual assets and layouts for digital and print campaigns across multiple brand clients. Supported pitch development through concept ideation, reference research, and visual storytelling. Collaborated with cross-functional creative teams in fast-paced agency environments.",
    projectKey:"p1" }
];

const LETTERS = [
  { id:"anika", from:"Anika Gupta Goenka", role:"College counsellor & art educator",
    salutation:"Dear Administrator,",
    paras:[
      "This is to certify that I have taught Tanaya Agarwal from December 2022 through October 2023. I have been mentoring her through the portfolio process as a college counsellor and art educator.",
      "Tanaya is a serious, organized and intelligent student whose work has moved from the cliche to layered over this past year. Her skills have also grown, adding ceramics and embroidery to the list. Even though she doesn't show it on the outside, her work reflects emotion and deeply personal anecdotes. The themes in her work are mature and deserve to be shared with the world. Tanaya works on ideas on her iPad, loves feedback and reworks her projects based on this.",
      "Tanaya will thrive in a creatively charged environment at a top art and design school where she can be pushed to explore media and concepts. She's a fairly independent person, so I'd love to see her collaborate with people from different backgrounds. I would be happy to provide further information if required.",
      "Thanking you,"
    ],
    signoff:"Sincerely,\nAnika Gupta Goenka" },
  { id:"tj", from:"TJ Thomas", role:"Head of Visual Art",
    salutation:"Dear Administrator,",
    paras:[
      "As her visual art teacher since the beginning of 10th grade, I have watched her grow tremendously as an artist and as a person. I can attest to her dedication, passion, and ability to learn quickly.",
      "She has an insatiable curiosity and an eagerness to learn new skills and techniques, which is a testament to her work ethic and thirst for knowledge. For example, Tanaya was interested in cyanotype, so with my support she learned the chemistry needed and mixed her own chemicals to create prints. Her work continues to address complex concepts and uses imagery in new ways asking the audience to re-evaluate traditional symbols in visual art.",
      "Outside of school, Tanaya takes ownership of her learning while working to enhance her technical skills and explore new media. She is a very hard worker both in and out of the class. Tanaya launched a company called Dream Journals through the YEA program, she has completed an Adobe Illustrator and Photoshop course, as well as an independent pottery course. She has designed her own journals that were sold online during her internship with a stationary company called Artsy Design.co. Her creativity is boundless, and Tanaya always strives to push the boundaries and try new things.",
      "Studying visual arts has not only enhanced Tanaya's artistic skills but has also influenced her personal growth. Tanaya has become more aware of her artistic voice in which Tanaya incorporates into her work. Over the last two years, I have had watch Tanaya move away from the normal cliche imagery teenagers sway towards, to creating strong conceptual meaning in her work. For example, she made an installation about eating disorders and printed fruit on clothes, hung them on a clothesline and used the metaphor ‘Airing your Dirty Laundry’."
    ],
    signoff:"Sincerely,\nTJ Thomas\nHead of Visual Art" }
];

const PALETTES = {
  Pink: ['#ef2475', '#ffa4db', '#ff72a1'],
  Cool: ['#5b7cfa', '#a6c8ff', '#7ad6f0'],
  Mono: ['#8f8f96', '#d6d6dc', '#b0b0b8']
};
/* ==========================================================================
   State
   ========================================================================== */

var START_UNLOCKED = true;    /* set to false to bring the lock screen back */
var SHOW_NAMEPLATE = true;
var ETHER_PALETTE  = "Pink";

var state = {
  locked: !START_UNLOCKED,
  unlocking: false,
  screen: null,
  allWork: false,
  workOpen: false,
  openExp: null,
  openLetter: null,
  dots: "",
  clock: "",
  dateLine: ""
};

var root = null;
var ether = null;
var timers = {};

/* ==========================================================================
   Helpers
   ========================================================================== */

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function thumbFor(key) {
  return "assets/thumbs/project-" + PROJECTS[key].num + ".webp";
}

function $(sel) {
  return root ? root.querySelector(sel) : null;
}

/* ==========================================================================
   Markup — home screen, dock, lock screen
   ========================================================================== */

var HOME_ICONS = [
  { key: "p1",  left: "38%", top: "22%", icon: "assets/thumbs/icon-1.webp",  alt: "Men of Platinum app icon",     label: "Men of Platinum" },
  { key: "p6",  left: "62%", top: "31%", icon: "assets/thumbs/icon-6.webp",  alt: "Lost in Translation app icon", label: "Lost in Translation" },
  { key: "p5",  left: "12%", top: "31%", icon: "assets/thumbs/icon-5.webp",  alt: "Dream Journals app icon",      label: "Dream Journals" },
  { key: "p13", left: "74%", top: "48%", icon: "assets/thumbs/icon-13.webp", alt: "The Upside Down app icon",     label: "The Upside Down" },
  { key: "p12", left: "0%",  top: "48%", icon: "assets/thumbs/icon-12.webp", alt: "The Borges Stories app icon",  label: "The Borges Stories" }
];

var DOCK_APPS = [
  { key: "about",      icon: "assets/about.webp",      label: "About" },
  { key: "resume",     icon: "assets/resume.webp",     label: "Resume" },
  { key: "references", icon: "assets/references.webp", label: "References" },
  { key: "contacts",   icon: "assets/contact.webp",    label: "Contacts" }
];

function homeHTML() {
  var icons = HOME_ICONS.map(function (a) {
    return '' +
      '<a data-app="' + a.key + '" href="#" style="position:absolute;left:' + a.left + ';top:' + a.top + ';width:96px;padding:7px 4px;display:flex;flex-direction:column;align-items:center;gap:5px;border-radius:10px;text-decoration:none">' +
        '<img src="' + a.icon + '" alt="' + esc(a.alt) + '" draggable="false" style="max-width:66px;max-height:66px;width:auto;height:auto">' +
        '<span style="display:block;width:100%;font-size:12px;line-height:1.14;text-align:center;color:rgb(48,48,48);text-shadow:0 1px 6px rgba(0,0,0,.28)">' + esc(a.label) + '</span>' +
      '</a>';
  }).join("");

  var dockIcons = DOCK_APPS.map(function (a) {
    return '<a data-app="' + a.key + '" href="#" aria-label="' + esc(a.label) + '" style="display:block;width:46px;height:46px;margin:0 5px;border-radius:11px;overflow:hidden;background:rgba(255,255,255,.10)">' +
      '<img src="' + a.icon + '" alt="" style="width:100%;height:100%;object-fit:cover"></a>';
  }).join("");

  return '' +
    '<div style="position:absolute;inset:0;background:#fff;animation:fadeIn 500ms ease both;isolation:isolate">' +

      '<div id="m-ether" style="position:absolute;inset:0;overflow:hidden;touch-action:none;z-index:0;opacity:.9"></div>' +

      '<div style="position:absolute;left:0;right:0;top:0;bottom:88px;z-index:2">' +

        (SHOW_NAMEPLATE ?
          '<div style="position:absolute;inset:0;z-index:0;pointer-events:none;user-select:none;display:flex;align-items:flex-start;justify-content:center;padding-top:14px;animation:nameplateReveal 1.8s cubic-bezier(.16,1,.3,1) .3s both">' +
            '<span style="display:block;width:100%;margin-top:10px;font-family:\'Bebas Neue\',sans-serif;font-weight:400;font-size:52px;line-height:.92;letter-spacing:0;text-align:center;text-transform:uppercase;white-space:nowrap;color:rgba(255,255,255,.2)">Tanaya Agarwal</span>' +
          '</div>' : "") +

        '<div style="position:absolute;left:0;right:0;top:0;bottom:0;z-index:1;pointer-events:none;background:url(\'assets/desktop-crouching-folders.webp\') center bottom 64px / auto 54% no-repeat"></div>' +

        '<div style="position:absolute;inset:0;z-index:2">' + icons + '</div>' +
      '</div>' +

      '<div style="position:absolute;left:0;right:0;bottom:10px;z-index:5;display:flex;justify-content:center;pointer-events:none">' +
        '<div style="pointer-events:auto;display:flex;align-items:flex-end;padding:9px 12px;border-radius:22px;background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.35);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-shadow:0 6px 32px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.14)">' +
          dockIcons +
          '<div style="width:1px;height:30px;margin:0 4px 8px;align-self:flex-end;background:rgba(255,255,255,.22)"></div>' +
          '<a data-app="allwork" href="#" aria-label="All Work" style="display:flex;align-items:center;justify-content:center;width:46px;height:46px;margin:0 5px;border-radius:11px;background:rgba(163,160,155,.92);color:rgba(45,42,38,.95)">' +
            '<svg viewBox="0 0 36 36" fill="none" style="width:54%;height:54%">' +
              '<rect x="4" y="4" width="12" height="12" rx="3" fill="currentColor" opacity="0.85"></rect>' +
              '<rect x="20" y="4" width="12" height="12" rx="3" fill="currentColor" opacity="0.85"></rect>' +
              '<rect x="4" y="20" width="12" height="12" rx="3" fill="currentColor" opacity="0.85"></rect>' +
              '<rect x="20" y="20" width="12" height="12" rx="3" fill="currentColor" opacity="0.85"></rect>' +
            '</svg>' +
          '</a>' +
        '</div>' +
      '</div>' +
    '</div>';
}

function lockHTML() {
  return '' +
    '<div data-unlock="1" style="position:absolute;inset:0;z-index:200;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:13% 0 8%;background-color:#000;background:linear-gradient(rgba(255,255,255,.7),rgba(255,255,255,.7)),url(\'assets/lockscreen-bg.webp\') center / cover no-repeat">' +

      '<div style="display:flex;flex-direction:column;align-items:center;gap:3px;text-align:center">' +
        '<div id="m-clock" style="font-size:64px;font-weight:200;letter-spacing:-2px;line-height:1;color:#FE5BAC;text-shadow:0 2px 30px rgba(0,0,0,.4)"></div>' +
        '<div id="m-date" style="font-size:13px;font-weight:300;letter-spacing:.2px;color:#FE5BAC;text-shadow:0 1px 12px rgba(0,0,0,.35)"></div>' +
      '</div>' +

      '<div style="display:flex;flex-direction:column;align-items:center;gap:8px">' +
        '<img src="assets/user.webp" alt="User avatar" style="width:52px;height:52px;border-radius:50%;object-fit:contain;border:1px solid rgba(255,255,255,.2);box-shadow:0 4px 20px rgba(0,0,0,.4)">' +
        '<div style="font-size:13px;color:#FE5BAC;text-shadow:0 0 9px #fff,0 1px 10px #fff">Tanaya\'s Portfolio</div>' +
        '<div style="width:min(180px,72%);margin-top:2px">' +
          '<div style="display:flex;align-items:center;gap:5px;padding:5px 5px 5px 12px;background:rgba(255,255,255,.11);border:1px solid rgba(255,255,255,.18);border-radius:999px;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);box-shadow:0 2px 12px rgba(0,0,0,.22)">' +
            '<div style="flex:1;min-width:0;display:flex;align-items:center;overflow:hidden">' +
              '<span id="m-dots" style="font-size:14px;letter-spacing:4px;color:#FE5BAC;white-space:nowrap"></span>' +
              '<span style="display:inline-block;width:1.5px;height:13px;margin-left:1px;flex-shrink:0;border-radius:1px;background:rgba(254,91,172,.88);animation:caretBlink 1.1s step-start infinite"></span>' +
            '</div>' +
            '<span style="flex-shrink:0;width:28px;height:28px;border-radius:50%;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.12);display:grid;place-items:center">' +
              '<svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1L10 5.5L5.5 10M10 5.5H1" stroke="#FE5BAC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>' +
            '</span>' +
          '</div>' +
          '<div style="margin-top:9px;text-align:center;font-size:11px;letter-spacing:.15px;color:rgba(254,91,172,.8)">Tap anywhere to enter</div>' +
        '</div>' +
      '</div>' +
    '</div>';
}

/* ==========================================================================
   Markup — all work list
   ========================================================================== */

function allWorkHTML() {
  var rows = "";
  CATS.forEach(function (cat) {
    rows += '<div style="padding:26px 20px 8px;font:400 16px/1.05 \'Bebas Neue\',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:rgba(26,23,20,.42)">' + esc(cat) + '</div>';
    ORDER.filter(function (k) { return PROJECTS[k].cat === cat; }).forEach(function (k) {
      var pr = PROJECTS[k];
      var meta = pr.kicker;
      rows += '' +
        '<a data-app="' + k + '" href="#" style="display:flex;align-items:center;gap:14px;width:100%;padding:12px 20px;border-left:2px solid transparent;text-decoration:none;color:rgba(26,23,20,.5);font:400 13px/1.3 \'Helvetica Neue\',Arial,sans-serif">' +
          '<span style="flex:0 0 auto;width:52px;height:52px;border-radius:8px;overflow:hidden;background:#e2ded7"><img src="' + thumbFor(k) + '" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover"></span>' +
          '<span style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:3px">' +
            '<span style="font-size:13px;font-weight:500;color:#1a1714">' + esc(pr.title) + '</span>' +
            '<span style="font-size:11.5px;color:rgba(26,23,20,.45)">' + esc(meta) + '</span>' +
          '</span>' +
        '</a>';
    });
  });

  return '' +
    '<div style="position:absolute;inset:0;z-index:60;display:flex;flex-direction:column;background:#ede9e3;animation:pageIn 480ms cubic-bezier(.32,.72,0,1) both">' +
      '<button type="button" data-allwork-back="1" style="position:absolute;top:16px;left:16px;z-index:2;display:inline-flex;align-items:center;gap:7px;height:36px;padding:0 14px;border:0;border-radius:999px;background:rgba(26,23,20,.06);color:rgba(26,23,20,.65);font-size:12.5px;letter-spacing:.02em;cursor:pointer">' +
        '<svg width="9" height="14" viewBox="0 0 9 14" fill="none"><path d="M8 1L2 7L8 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>' +
        'Desktop' +
      '</button>' +
      '<div style="flex:1;overflow-y:auto;padding:64px 0 40px">' + rows + '</div>' +
    '</div>';
}

/* ==========================================================================
   Markup — window chrome
   ========================================================================== */

var TABS = [
  { tab: "work",       icon: "assets/work.webp",       label: "Work" },
  { tab: "about",      icon: "assets/about.webp",      label: "About" },
  { tab: "resume",     icon: "assets/resume.webp",     label: "Resume" },
  { tab: "references", icon: "assets/references.webp", label: "References" },
  { tab: "contacts",   icon: "assets/contact.webp",    label: "Contact" }
];

function tabsHTML() {
  return TABS.map(function (t) {
    return '<button type="button" data-tab="' + t.tab + '" style="flex:0 0 auto;height:34px;padding:0 11px;display:inline-flex;align-items:center;gap:7px;border-radius:17px;border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.22);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);font-family:\'Bebas Neue\',sans-serif;font-size:14px;letter-spacing:.03em;color:#111;cursor:pointer">' +
      '<span style="width:20px;height:20px;border-radius:5px;flex-shrink:0;background:url(\'' + t.icon + '\') center/cover no-repeat;box-shadow:inset 0 0 0 1px rgba(255,255,255,.12)"></span>' + t.label +
      '</button>';
  }).join("");
}

function windowHTML() {
  var s = state.screen;
  var raw = PROJECTS[s] || null;
  var title = raw ? raw.title : (DOCK_TITLES[s] || "Project");

  return '' +
    '<div style="position:absolute;inset:0;z-index:100;display:grid;place-items:center">' +
      '<div data-close="1" style="position:absolute;inset:0;background:rgba(8,8,12,.24);backdrop-filter:blur(10px) saturate(1.08);-webkit-backdrop-filter:blur(10px) saturate(1.08)"></div>' +

      '<div style="position:relative;z-index:1;width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:rgba(36,36,42,.68);border:1px solid rgba(255,255,255,.18);backdrop-filter:blur(30px) saturate(1.45);-webkit-backdrop-filter:blur(30px) saturate(1.45);animation:winOpen 430ms cubic-bezier(.22,1,.36,1) both">' +

        '<div style="flex:0 0 auto;background:rgba(255,255,255,.22);border-bottom:1px solid rgba(255,255,255,.35);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)">' +
          '<div style="height:46px;display:flex;align-items:center;gap:8px;padding:0 10px 0 6px">' +
            '<div style="flex:0 0 auto;display:flex">' +
              '<button type="button" data-close="1" aria-label="Close" style="width:21px;height:40px;display:grid;place-items:center;border:0;background:transparent;cursor:pointer"><span style="display:block;width:13px;height:13px;border-radius:50%;background:#ff5f57"></span></button>' +
              '<button type="button" data-close="1" aria-label="Restore" style="width:21px;height:40px;display:grid;place-items:center;border:0;background:transparent;cursor:pointer"><span style="display:block;width:13px;height:13px;border-radius:50%;background:#febc2e"></span></button>' +
              '<button type="button" aria-label="Maximize" style="width:21px;height:40px;display:grid;place-items:center;border:0;background:transparent;cursor:pointer"><span style="display:block;width:13px;height:13px;border-radius:50%;background:#28c840"></span></button>' +
            '</div>' +
            '<div style="flex:1 1 auto;min-width:0;height:30px;display:flex;align-items:center;justify-content:center;padding:0 14px;border-radius:15px;background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.35);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);font-size:14px;font-weight:500;letter-spacing:.2px;color:rgba(255,255,255,.92);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(title) + '</div>' +
          '</div>' +

          '<div style="display:flex;gap:6px;padding:0 10px 9px;overflow-x:auto;scrollbar-width:none">' + tabsHTML() + '</div>' +
        '</div>' +

        '<div id="m-content" style="flex:1 1 auto;position:relative;overflow-y:auto;overflow-x:hidden;background:#fff;-webkit-overflow-scrolling:touch">' +
          contentHTML(s) +
          '<div id="m-workpanel"></div>' +
        '</div>' +
      '</div>' +
    '</div>';
}

/* ==========================================================================
   Markup — window content
   ========================================================================== */

function contentHTML(s) {
  if (PROJECTS[s]) return projectHTML(s);
  if (s === "about") return aboutHTML();
  if (s === "resume") return resumeHTML();
  if (s === "references") return referencesHTML();
  if (s === "contacts") return contactsHTML();
  if (s === "photos") return photosHTML();
  return "";
}

function aboutHTML() {
  var roles = '<div style="display:flex;align-items:center;min-height:34px;flex:0 0 auto;gap:22px;padding-right:22px;font-family:\'Bebas Neue\',sans-serif;font-size:16px;letter-spacing:.06em;color:#fe5bac;text-transform:uppercase;white-space:nowrap"><span>Visual Designer</span><span>|</span><span>Creative Coder</span><span>|</span><span>Art Director</span><span>|</span><span>Illustrator</span><span>|</span><span>Photographer</span><span>|</span></div>';

  return '' +
    '<div style="min-height:100%;width:100%;display:flex;flex-direction:column;background:#fff;font-family:\'JetBrains Mono\',ui-monospace,Menlo,monospace;color:#1d1d1d">' +
      '<div style="flex:1 1 auto;padding:28px 22px 30px;display:flex;flex-direction:column;gap:28px">' +
        '<div style="display:flex;flex-direction:column;gap:12px">' +
          '<div style="padding:10px;background:#f5f5f3;border:1px solid rgba(0,0,0,.12);width:242px;height:268px;align-self:center"><img src="dock/about/tanaya.webp" alt="Portrait of Tanaya" style="width:100%;height:250px;object-fit:cover;filter:grayscale(1) contrast(1.05)"></div>' +
          '<div style="display:flex;justify-content:space-between;gap:12px;font-size:11px;line-height:1.8;color:#8a8a8a;width:234px;height:19px;align-self:center"><span>portrait.jpg</span><span>Manhattan, NY</span></div>' +
        '</div>' +
        '<div>' +
          '<img src="dock/about/Name.webp" alt="Tanaya Agarwal" style="width:min(300px,100%);height:auto;margin-bottom:22px">' +
          '<p style="margin:0;font-size:13.6px;line-height:1.85;color:#4a4a4a;text-wrap:pretty">Creative design student at Parsons School of Design with a multidisciplinary background spanning branding, visual storytelling, digital content, and self-initiated ventures. Interested in design and creative technology roles that balance concept, strategy, and execution, with the long-term aim of evolving into a creative director. Comfortable collaborating across design, branding, and front-end-adjacent creative teams.</p>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:16px">' +
          '<div style="border:1px solid rgba(254,91,172,.45);border-radius:14px;background:#f7f7f5;padding:20px 20px 22px">' +
            '<div style="margin-bottom:16px;font-size:12.5px;color:#fe5bac">about.txt</div>' +
            '<div style="font-size:13px;line-height:2;color:#4a4a4a">' +
              '<div><span style="color:#a8a8a8">01</span>&nbsp;&nbsp;Grew up in</div>' +
              '<div style="color:#1d1d1d;padding-left:4ch">Mumbai, India</div>' +
              '<div style="height:.7em"></div>' +
              '<div><span style="color:#a8a8a8">02</span>&nbsp;&nbsp;Now living in</div>' +
              '<div style="color:#1d1d1d;padding-left:4ch">New York, United States</div>' +
            '</div>' +
          '</div>' +
          '<div style="border:1px solid rgba(254,91,172,.45);border-radius:14px;background:#f7f7f5;padding:20px 20px 22px">' +
            '<div style="margin-bottom:16px;font-size:12.5px;color:#fe5bac">education.txt</div>' +
            '<div style="display:flex;flex-direction:column;gap:16px;font-size:13px;line-height:1.85">' +
              '<div><div style="color:#1d1d1d">Parsons School of Design</div><div style="color:#6a6a6a">Communication Design, BFA</div></div>' +
              '<div><div style="color:#1d1d1d">Dhirubhai Ambani Int\'l School</div><div style="color:#6a6a6a">International Baccalaureate, DP</div></div>' +
            '</div>' +
          '</div>' +
          '<div style="border:1px solid rgba(254,91,172,.45);border-radius:14px;background:#f7f7f5;padding:20px 20px 22px">' +
            '<div style="margin-bottom:16px;font-size:12.5px;color:#fe5bac">skills/</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:7px 18px;font-size:12.4px;line-height:1.7;color:#4a4a4a">' +
              '<div>Adobe CS</div><div>Art Direction</div>' +
              '<div>Concept Dev</div><div>Storytelling</div>' +
              '<div>Branding</div><div>Layout Design</div>' +
              '<div>Design Thinking</div><div>Illustration</div>' +
              '<div>Photography</div><div>Canva</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div style="flex:0 0 auto;background:#4f4f53;overflow:hidden">' +
        '<div style="display:flex;width:max-content;animation:rolesScroll 26s linear infinite">' + roles + roles + '</div>' +
      '</div>' +
    '</div>';
}

function resumeHTML() {
  var items = EXPERIENCES.map(function (x) {
    var tags = x.tags.map(function (t) {
      return '<span style="font-family:\'Glypha\',\'ITC Glypha\',\'Palatino Linotype\',Palatino,serif;font-size:10px;line-height:1;letter-spacing:.08em;text-transform:uppercase;color:#131313;opacity:.92">' + esc(t) + '</span>';
    }).join("");

    var link = x.projectKey ?
      '<a data-app="' + x.projectKey + '" href="#" style="display:inline-flex;align-items:center;gap:6px;margin-top:14px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#fe5bac;border-bottom:1px solid rgba(254,91,172,.4);padding-bottom:3px">View project →</a>' : "";

    return '' +
      '<div style="border-bottom:1px solid #7f7f7f">' +
        '<button type="button" data-exp="' + x.id + '" style="width:100%;border:0;background:transparent;text-align:left;cursor:pointer;padding:15px 18px;display:flex;flex-direction:column;gap:8px">' +
          '<span style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;width:100%">' +
            '<span style="font-family:\'Bebas Neue\',sans-serif;font-size:27px;line-height:1;text-transform:uppercase;color:#fe5bac">' + esc(x.company) + '</span>' +
            '<span style="flex:0 0 auto;font-family:\'Glypha\',\'ITC Glypha\',\'Palatino Linotype\',Palatino,serif;font-size:13px;line-height:1;color:#151515">' + esc(x.date) + '</span>' +
          '</span>' +
          '<span style="display:flex;flex-wrap:wrap;gap:6px 10px">' + tags + '</span>' +
        '</button>' +
        '<div data-exp-panel="' + x.id + '" style="display:none;padding:0 20px 20px">' +
          '<p style="margin:0;font-family:\'Glypha\',\'ITC Glypha\',\'Palatino Linotype\',Palatino,serif;font-size:14px;line-height:1.6;color:#171717">' + esc(x.body) + '</p>' +
          link +
        '</div>' +
      '</div>';
  }).join("");

  return '' +
    '<div style="min-height:100%;width:100%;background:#fff;color:#171717">' +
      '<div style="padding:22px 0 40px">' +
        '<div style="padding:8px 16px 20px;text-align:center;font-family:\'Bebas Neue\',sans-serif;font-size:52px;line-height:.9;text-transform:uppercase;color:#FE5BAC">Experiences</div>' +
        '<div style="border-top:1px solid #7f7f7f">' + items + '</div>' +
      '</div>' +
    '</div>';
}

function referencesHTML() {
  var items = LETTERS.map(function (x) {
    var paras = x.paras.map(function (p) {
      return '<p style="margin:13px 0 0;font-family:\'Glypha\',\'ITC Glypha\',\'Palatino Linotype\',Palatino,serif;font-size:14px;line-height:1.62;color:#2b2b2b;text-wrap:pretty">' + esc(p) + '</p>';
    }).join("");

    return '' +
      '<div style="border-radius:14px;overflow:hidden;background:#f9f7ee;box-shadow:0 8px 26px rgba(0,0,0,.12);border:1px solid rgba(23,23,23,.1)">' +
        '<button type="button" data-letter="' + x.id + '" style="width:100%;border:0;background:transparent;cursor:pointer;text-align:left;padding:16px 18px;display:flex;align-items:center;gap:14px">' +
          '<img src="dock/references/envelope.webp" alt="" style="flex:0 0 auto;width:52px;height:auto">' +
          '<span style="flex:1 1 auto;min-width:0">' +
            '<span style="display:block;font-family:\'Bebas Neue\',sans-serif;font-size:22px;line-height:1.05;letter-spacing:.02em;text-transform:uppercase;color:#171717">' + esc(x.from) + '</span>' +
            '<span style="display:block;margin-top:3px;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:rgba(23,23,23,.55)">' + esc(x.role) + '</span>' +
          '</span>' +
          '<span data-letter-chevron="' + x.id + '" style="flex:0 0 auto;font-size:20px;color:rgba(23,23,23,.3)">›</span>' +
        '</button>' +
        '<div data-letter-panel="' + x.id + '" style="display:none;padding:2px 20px 24px;border-top:1px solid rgba(23,23,23,.08)">' +
          '<p style="margin:16px 0 0;font-family:\'Glypha\',\'ITC Glypha\',\'Palatino Linotype\',Palatino,serif;font-size:14px;line-height:1.62;font-weight:500">' + esc(x.salutation) + '</p>' +
          paras +
          '<p style="margin:20px 0 0;font-family:\'Glypha\',\'ITC Glypha\',\'Palatino Linotype\',Palatino,serif;font-size:14px;line-height:1.5;font-style:italic;color:#171717;white-space:pre-line">' + esc(x.signoff) + '</p>' +
        '</div>' +
      '</div>';
  }).join("");

  return '' +
    '<div style="min-height:100%;width:100%;background:#fff;color:#171717">' +
      '<div style="padding:22px 18px 44px">' +
        '<div style="padding:8px 0 22px;text-align:center;font-family:\'Bebas Neue\',sans-serif;font-size:52px;line-height:.9;text-transform:uppercase;color:#000">References</div>' +
        '<div style="display:flex;flex-direction:column;gap:18px">' + items + '</div>' +
      '</div>' +
    '</div>';
}

function contactsHTML() {
  return '' +
    '<div style="min-height:100%;width:100%;background:#fff;color:#1f1f1f">' +
      '<div style="padding:24px 16px 34px">' +
        '<div style="text-align:center">' +
          '<div style="width:172px;aspect-ratio:1;margin:2px auto 16px;border-radius:50%;overflow:hidden"><img src="assets/user.webp" alt="Tanaya Agarwal" style="width:100%;height:100%;object-fit:cover"></div>' +
          '<p style="margin:0;font-family:\'Bebas Neue\',sans-serif;font-size:12px;letter-spacing:.12em;color:#7d7d85">She, Her, Hers</p>' +
          '<h1 style="margin:6px 0 0;font-family:\'Bebas Neue\',sans-serif;font-size:40px;font-weight:400;line-height:.92;text-transform:uppercase">Tanaya Agarwal</h1>' +
        '</div>' +
        '<div style="margin-top:18px;padding:10px 12px;min-height:50px;background:#ececf0;border-radius:13px;display:flex;align-items:center;justify-content:space-between;gap:10px">' +
          '<div style="display:flex;align-items:center;gap:10px;min-width:0">' +
            '<img src="assets/user.webp" alt="" style="width:28px;height:28px;border-radius:50%;object-fit:cover;flex-shrink:0">' +
            '<div style="min-width:0">' +
              '<p style="margin:0;font-size:13.5px;line-height:1.3;font-weight:600">Shared Name and Photo</p>' +
              '<p style="margin:0;font-size:12.5px;line-height:1.3;color:#72727a">Sharing Off</p>' +
            '</div>' +
          '</div>' +
          '<span style="font-size:22px;line-height:1;color:#8c8c94">›</span>' +
        '</div>' +
        '<div style="margin-top:8px;padding:0 12px;background:#ececf0;border-radius:13px">' +
          '<div style="padding:11px 0 10px"><p style="margin:0;font-size:13px;line-height:1.25;font-weight:600;color:#50505a">mobile</p><p style="margin:1px 0 0;font-size:13.5px;line-height:1.3;color:#606069">+1 (347) 544-1628</p></div>' +
          '<div style="padding:11px 0 10px;border-top:1px solid #dfdfe4"><p style="margin:0;font-size:13px;line-height:1.25;font-weight:600;color:#50505a">work</p><p style="margin:1px 0 0;font-size:13.5px;line-height:1.3;color:#606069">tanayaagarwal11@gmail.com</p></div>' +
          '<div style="padding:11px 0 10px;border-top:1px solid #dfdfe4"><p style="margin:0;font-size:13px;line-height:1.25;font-weight:600;color:#50505a">home</p><p style="margin:1px 0 0;font-size:13.5px;line-height:1.3;color:#606069">New York NY</p><p style="margin:1px 0 0;font-size:13.5px;line-height:1.3;color:#606069">United States</p></div>' +
          '<div style="padding:11px 0 10px;border-top:1px solid #dfdfe4"><p style="margin:0;font-size:13px;line-height:1.25;font-weight:600;color:#50505a">other</p><p style="margin:1px 0 0;font-size:13.5px;line-height:1.3;color:#606069">Mumbai MH</p><p style="margin:1px 0 0;font-size:13.5px;line-height:1.3;color:#606069">India</p></div>' +
          '<div style="padding:11px 0 10px;border-top:1px solid #dfdfe4"><p style="margin:0;font-size:13px;line-height:1.25;font-weight:600;color:#50505a">Notes</p></div>' +
        '</div>' +
        '<a href="sms:+13475441628" style="margin-top:8px;min-height:48px;padding:0 14px;background:#ececf0;border-radius:13px;display:flex;align-items:center;text-decoration:none"><span style="font-size:15px;font-weight:600;color:#565660">Send Message</span></a>' +
        '<a href="mailto:tanayaagarwal11@gmail.com?subject=Hello%20Tanaya" style="margin-top:8px;min-height:48px;padding:0 14px;background:#ececf0;border-radius:13px;display:flex;align-items:center;text-decoration:none"><span style="font-size:15px;font-weight:600;color:#565660">Send Email</span></a>' +
      '</div>' +
    '</div>';
}

function photosHTML() {
  var shots = [
    ["assets/about.webp", "About cover"],
    ["assets/user.webp", "Portrait"],
    ["assets/project-1.webp", "Project 1 cover"],
    ["assets/project-5.webp", "Project 5 cover"],
    ["projects/8/project-8-1.webp", "Paintings cover"],
    ["assets/project-10.webp", "Project 10 cover"]
  ].map(function (x) {
    return '<figure style="margin:0;aspect-ratio:4/3;border-radius:10px;overflow:hidden;background:#ececec"><img src="' + x[0] + '" alt="' + esc(x[1]) + '" loading="lazy" style="width:100%;height:100%;object-fit:cover"></figure>';
  }).join("");

  return '' +
    '<div style="min-height:100%;width:100%;background:#fff;color:#121212">' +
      '<div style="padding:22px 16px 36px">' +
        '<div style="margin:0 0 14px;font-family:\'Bebas Neue\',sans-serif;font-size:52px;line-height:.9;text-transform:uppercase">Photos</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' + shots + '</div>' +
      '</div>' +
    '</div>';
}

/* ==========================================================================
   Markup — project page
   ========================================================================== */

function figureHTML(src, alt) {
  return '<figure style="margin:0;background:#ece8e0;overflow:hidden"><img src="' + src + '" alt="' + esc(alt) + '" loading="lazy" style="width:100%;height:auto"></figure>';
}

function blockHTML(b, accent) {
  if (b.kind === "lead") {
    return '<p style="margin:0;font-size:17.5px;line-height:1.66;color:#1a1714;text-wrap:pretty">' + esc(b.text) + '</p>';
  }
  if (b.kind === "para") {
    return '<p style="margin:0;font-size:16px;line-height:1.7;color:#3d3833;text-wrap:pretty">' + esc(b.text) + '</p>';
  }
  if (b.kind === "head") {
    return '<div style="display:flex;flex-direction:column;gap:13px">' +
      '<h2 style="margin:0;font-family:\'Bebas Neue\',sans-serif;font-weight:400;font-size:27px;line-height:1;letter-spacing:.02em;text-transform:uppercase;color:' + accent + '">' + esc(b.head) + '</h2>' +
      '<p style="margin:0;font-size:16px;line-height:1.7;color:#3d3833;text-wrap:pretty">' + esc(b.text) + '</p>' +
    '</div>';
  }
  if (b.kind === "img") {
    return figureHTML(b.src, b.alt);
  }
  if (b.kind === "grid") {
    return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
      b.items.map(function (im) { return figureHTML(im.src, im.alt); }).join("") +
    '</div>';
  }
  if (b.kind === "strip") {
    return '<div style="display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;margin:0 -22px;padding:0 22px 6px">' +
      b.items.map(function (im) {
        return '<figure style="margin:0;flex:0 0 82%;scroll-snap-align:center;background:#ece8e0;overflow:hidden"><img src="' + im.src + '" alt="' + esc(im.alt) + '" loading="lazy" style="width:100%;height:auto"></figure>';
      }).join("") +
    '</div>';
  }
  if (b.kind === "cap") {
    return '<p style="margin:-18px 0 0;font-family:-apple-system,\'SF Pro Text\',sans-serif;font-size:12px;line-height:1.5;color:rgba(74,69,64,.62)">' + esc(b.text) + '</p>';
  }
  return "";
}

function projectHTML(key) {
  var p = PROJECTS[key];
  var band = p.band;

  var rail = p.rail.map(function (r) {
    return '<div style="display:flex;flex-direction:column;gap:4px">' +
      '<span style="font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:rgba(74,69,64,.55)">' + esc(r.label) + '</span>' +
      '<span style="font-size:13.5px;line-height:1.4">' + esc(r.value) + '</span>' +
    '</div>';
  }).join("");

  var tags = p.tags.map(function (t) {
    return '<span style="font-size:10px;letter-spacing:.06em;text-transform:uppercase;padding:5px 9px;border:1px solid rgba(26,23,20,.24);color:rgba(74,69,64,.85)">' + esc(t) + '</span>';
  }).join("");

  var blocks = p.blocks.map(function (b) { return blockHTML(b, p.accent); }).join("");

  var bandBlock = band ?
    '<div style="margin-top:40px;padding:32px 22px;background:' + band.bg + '">' +
      '<p style="margin:0 0 22px;font-family:-apple-system,\'SF Pro Text\',sans-serif;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:rgba(26,23,20,.5)">' + esc(band.label) + '</p>' +
      '<p style="margin:0 0 20px;font-size:15.5px;line-height:1.7;color:' + band.ink + '">' + esc(band.note) + '</p>' +
      '<div style="display:grid;grid-template-columns:' + band.cols + ';gap:10px">' +
        band.images.map(function (im) {
          return '<figure style="margin:0;background:rgba(255,255,255,.35);overflow:hidden"><img src="' + im.src + '" alt="' + esc(im.alt) + '" loading="lazy" style="width:100%;height:auto"></figure>';
        }).join("") +
      '</div>' +
    '</div>' : "";

  return '' +
    '<div style="min-height:100%;width:100%;background:#f0ece5;color:#1a1714;font-family:\'Glypha\',\'ITC Glypha\',\'Palatino Linotype\',Palatino,serif">' +
      '<div style="padding:18px 0 0">' +
        '<div style="display:flex;justify-content:flex-end;padding:6px 22px;font-family:-apple-system,\'SF Pro Text\',sans-serif;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:rgba(74,69,64,.72)">' + esc(p.index) + '</div>' +
        '<div style="padding:20px 22px 0;display:flex;flex-direction:column;gap:24px">' +
          '<div>' +
            '<p style="margin:0 0 16px;font-family:-apple-system,\'SF Pro Text\',sans-serif;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:' + p.accent + '">' + esc(p.kicker) + '</p>' +
            '<h1 style="margin:0 0 18px;font-family:\'Bebas Neue\',sans-serif;font-weight:400;font-size:46px;line-height:.86;letter-spacing:.01em;text-transform:uppercase">' + esc(p.title) + '</h1>' +
            '<p style="margin:0;font-size:17px;line-height:1.45;text-wrap:pretty">' + esc(p.lede) + '</p>' +
          '</div>' +
          (p.hero ? figureHTML(p.hero, p.heroAlt) : "") +
        '</div>' +
        '<div style="padding:32px 22px 0;display:flex;flex-wrap:wrap;gap:14px 26px;font-family:-apple-system,\'SF Pro Text\',sans-serif">' +
          rail +
          '<div style="display:flex;flex-wrap:wrap;gap:6px;width:100%">' + tags + '</div>' +
        '</div>' +
        '<div style="padding:34px 22px 0;display:flex;flex-direction:column;gap:32px">' + blocks + '</div>' +
        bandBlock +
        '<p style="margin:32px 22px 0;padding-top:18px;border-top:1px solid rgba(26,23,20,.14);font-family:-apple-system,\'SF Pro Text\',sans-serif;font-size:12px;line-height:1.7;color:rgba(74,69,64,.7)">' + esc(p.credits) + '</p>' +
        '<div style="margin-top:38px;padding:32px 22px 40px;background:#1a1714;color:#f0ece5;display:flex;flex-direction:column;gap:22px">' +
          '<a data-app="' + p.nextKey + '" href="#" style="color:#f0ece5">' +
            '<span style="display:block;font-family:-apple-system,\'SF Pro Text\',sans-serif;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:rgba(240,236,229,.55);margin-bottom:10px">Next</span>' +
            '<span style="display:block;font-family:\'Bebas Neue\',sans-serif;font-size:36px;line-height:.9;text-transform:uppercase">' + esc(p.nextTitle) + ' →</span>' +
          '</a>' +
          '<a href="mailto:tanayaagarwal11@gmail.com" style="font-family:-apple-system,\'SF Pro Text\',sans-serif;font-size:13px;color:#f0ece5;border-bottom:1px solid rgba(240,236,229,.4);padding-bottom:3px;align-self:flex-start">tanayaagarwal11@gmail.com</a>' +
        '</div>' +
      '</div>' +
    '</div>';
}

/* ==========================================================================
   Markup — work panel (slide-over inside a window)
   ========================================================================== */

function workPanelHTML() {
  var cards = ORDER.map(function (k) {
    return '' +
      '<a data-app="' + k + '" href="#" style="display:block;width:100%;border-radius:18px;overflow:hidden;background:#c6c7ca;color:#363636;text-decoration:none">' +
        '<span style="position:relative;display:block;width:100%;height:0;padding-top:100%;background:#ececef;overflow:hidden">' +
          '<img src="' + thumbFor(k) + '" alt="" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top">' +
        '</span>' +
        '<span style="display:flex;align-items:flex-start;gap:8px;min-height:42px;padding:9px 12px 11px;background:#b4b5b8">' +
          '<span style="flex:1 1 auto;font-size:12.5px;line-height:1.24;color:#2f2f31;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">' + esc(PROJECTS[k].title) + '</span>' +
        '</span>' +
      '</a>';
  }).join("");

  return '' +
    '<div data-work-backdrop="1" style="position:absolute;inset:0;z-index:8;background:rgba(20,20,20,.32)"></div>' +
    '<div style="position:absolute;right:0;top:0;bottom:0;z-index:9;width:84%;display:flex;flex-direction:column;padding:14px;background:rgba(255,255,255,.22);border-left:1px solid rgba(255,255,255,.35);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);border-top-left-radius:20px;border-bottom-left-radius:20px;box-shadow:-14px 0 28px rgba(20,20,20,.24);animation:panelIn 240ms cubic-bezier(0,.55,.45,1) both">' +
      '<div style="margin:4px 0 12px;font-family:\'Bebas Neue\',sans-serif;font-size:60px;line-height:.78;color:#f2f2f2">WORKS</div>' +
      '<div style="flex:1;min-height:0;overflow-y:auto;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;align-items:start;padding:5px 2px 26px">' + cards + '</div>' +
    '</div>';
}

/* ==========================================================================
   Rendering
   ========================================================================== */

function renderAllWork() {
  var host = $("#m-allwork");
  if (host) host.innerHTML = state.allWork ? allWorkHTML() : "";
}

function renderWindow() {
  var host = $("#m-window");
  if (!host) return;
  host.innerHTML = state.screen ? windowHTML() : "";
  if (state.screen) {
    var c = $("#m-content");
    if (c) c.scrollTop = 0;
    renderWorkPanel();
  }
}

function renderWorkPanel() {
  var host = $("#m-workpanel");
  if (host) host.innerHTML = state.workOpen ? workPanelHTML() : "";
}

function renderLock() {
  var host = $("#m-lock");
  if (!host) return;
  if (!state.locked) { host.innerHTML = ""; return; }
  if (!host.firstChild) host.innerHTML = lockHTML();
  var clock = $("#m-clock");
  var date = $("#m-date");
  var dots = $("#m-dots");
  if (clock) clock.textContent = state.clock;
  if (date) date.textContent = state.dateLine;
  if (dots) dots.textContent = state.dots;
}

/* ==========================================================================
   Behaviour
   ========================================================================== */

function fit() {
  var s = Math.min(1, (window.innerHeight - 48) / 874, (window.innerWidth - 48) / 402);
  document.documentElement.style.setProperty("--phone-scale", String(Math.max(0.2, s)));
}

function tick() {
  var d = new Date();
  var h = d.getHours();
  var m = String(d.getMinutes()).padStart(2, "0");
  h = h % 12 || 12;
  var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  state.clock = h + ":" + m;
  state.dateLine = days[d.getDay()] + ", " + months[d.getMonth()] + " " + d.getDate();
  renderLock();
}

function autoType() {
  var i = 0;
  timers.dot = setInterval(function () {
    i++;
    state.dots = "•".repeat(i);
    renderLock();
    if (i >= 6) clearInterval(timers.dot);
  }, 95);
}

function initEther(attempt) {
  if (ether || attempt > 40) return;
  var el = $("#m-ether");
  if (!el || !window.THREE || !window.LiquidEther) {
    setTimeout(function () { initEther(attempt + 1); }, 200);
    return;
  }
  ether = new window.LiquidEther(el, {
    colors: PALETTES[ETHER_PALETTE] || PALETTES.Pink,
    mouseForce: 20, cursorSize: 85, resolution: 0.5, dt: 0.014, BFECC: true,
    autoDemo: true, autoSpeed: 0.5, autoIntensity: 2.2,
    takeoverDuration: 0.25, autoResumeDelay: 3000, autoRampDuration: 0.6
  });
  if (ether.start) ether.start();
}

function unlock() {
  if (state.unlocking) return;
  clearInterval(timers.dot);
  state.dots = "••••••";
  state.unlocking = true;
  renderLock();
  var lock = $("#m-lock > div");
  if (lock) lock.style.animation = "lockUp 1000ms cubic-bezier(.4,0,.2,1) both";
  timers.unlock = setTimeout(function () {
    state.locked = false;
    state.unlocking = false;
    renderLock();
  }, 950);
}

function open(key) {
  state.screen = key;
  state.workOpen = false;
  renderWindow();
}

function closeWindow() {
  state.screen = null;
  state.workOpen = false;
  renderWindow();
}

function toggleExp(id) {
  state.openExp = state.openExp === id ? null : id;
  var panels = root.querySelectorAll("[data-exp-panel]");
  Array.prototype.forEach.call(panels, function (el) {
    el.style.display = el.getAttribute("data-exp-panel") === state.openExp ? "" : "none";
  });
}

function toggleLetter(id) {
  state.openLetter = state.openLetter === id ? null : id;
  var panels = root.querySelectorAll("[data-letter-panel]");
  Array.prototype.forEach.call(panels, function (el) {
    el.style.display = el.getAttribute("data-letter-panel") === state.openLetter ? "" : "none";
  });
  var chevrons = root.querySelectorAll("[data-letter-chevron]");
  Array.prototype.forEach.call(chevrons, function (el) {
    el.textContent = el.getAttribute("data-letter-chevron") === state.openLetter ? "⌄" : "›";
  });
}

function onClick(e) {
  var t = e.target;
  if (!t || !t.closest) return;

  if (state.locked) {
    if (t.closest("[data-unlock]")) { e.preventDefault(); unlock(); }
    return;
  }

  var back = t.closest("[data-allwork-back]");
  if (back) { e.preventDefault(); state.allWork = false; renderAllWork(); return; }

  var workBackdrop = t.closest("[data-work-backdrop]");
  if (workBackdrop) { e.preventDefault(); state.workOpen = false; renderWorkPanel(); return; }

  var app = t.closest("[data-app]");
  if (app) {
    e.preventDefault();
    var key = app.getAttribute("data-app");
    if (key === "allwork") { state.allWork = true; renderAllWork(); return; }
    open(key);
    return;
  }

  var tab = t.closest("[data-tab]");
  if (tab) {
    e.preventDefault();
    var name = tab.getAttribute("data-tab");
    if (name === "work") { state.workOpen = !state.workOpen; renderWorkPanel(); return; }
    open(name);
    return;
  }

  var exp = t.closest("[data-exp]");
  if (exp) { e.preventDefault(); toggleExp(exp.getAttribute("data-exp")); return; }

  var letter = t.closest("[data-letter]");
  if (letter) { e.preventDefault(); toggleLetter(letter.getAttribute("data-letter")); return; }

  var close = t.closest("[data-close]");
  if (close) { e.preventDefault(); closeWindow(); return; }
}

/* ==========================================================================
   Mount
   ========================================================================== */

function mount() {
  if (document.getElementById("mobile-root")) return;

  root = document.createElement("div");
  root.id = "mobile-root";
  root.innerHTML = '' +
    '<div class="m-shell" style="position:fixed;inset:0;overflow:hidden;background:#fff;display:grid;place-items:center;font-family:-apple-system,BlinkMacSystemFont,\'SF Pro Display\',\'SF Pro Text\',\'Bebas Neue\',sans-serif;color:#1f1f1f">' +
      '<div class="m-frame" style="position:relative;width:100%;height:100%;overflow:hidden;background:#fff">' +
        homeHTML() +
        '<div id="m-allwork"></div>' +
        '<div id="m-window"></div>' +
        '<div id="m-lock"></div>' +
      '</div>' +
    '</div>';

  document.body.appendChild(root);

  renderLock();
  root.addEventListener("click", onClick);

  fit();
  window.addEventListener("resize", fit);

  if (state.locked) {
    tick();
    timers.clock = setInterval(tick, 15000);
    timers.type = setTimeout(autoType, 650);
  }
  initEther(0);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}

})();
