const actionNames = {
  greet: "Greet",
  elicit: "Elicit",
  inform: "Inform",
  recommend: "Recommend",
  hold: "Hold"
};

const sceneNames = {
  demo_001: "Yellow and blue notebooks",
  demo_002: "Sneakers at a shoe counter",
  demo_003: "White product cans on a shelf",
  demo_004: "Drinks in a refrigerated shelf",
  demo_005: "Backpacks in a luggage shop",
  demo_006: "Blue cans in a display arch",
  demo_007: "Kettles in an appliance zone",
  demo_008: "Comparing products at an electronics counter",
  demo_009: "Grey sneakers in a shoe store",
  demo_010: "Packaged goods in a retail aisle"
};

const englishAnnotations = {
  demo_001: {
    observed: "The shopper stands beside the display, lifts a yellow-covered notebook from the shelf, and looks down at it.",
    action: "An off-screen clerk greets the shopper: “Hello. Let me know if you need help.”",
    outcome: "The shopper asks how the two notebooks differ, returns the yellow one, and points first to it and then to a dark-blue notebook while turning toward the clerk."
  },
  demo_002: {
    observed: "The shopper stands near the shoe display and looks at the shoes without picking one up or trying it on.",
    action: "The clerk greets the shopper: “Hello. Let me know if you need anything.”",
    outcome: "The shopper says they like the gray platform sneakers and asks for an introduction, then turns from the shoes toward the clerk."
  },
  demo_003: {
    observed: "The shopper stands beside the shelf, looking toward the products on the right without picking anything up.",
    action: "The clerk asks whether capacity or portability matters more.",
    outcome: "The shopper says they have not decided and will browse, then gestures toward the products on the right."
  },
  demo_004: {
    observed: "The shopper looks at the refrigerated drinks and points toward the shelf edge without taking a bottle.",
    action: "The clerk asks whether taste or budget matters more.",
    outcome: "The shopper says they have not considered either and will browse, continuing to look at the drinks."
  },
  demo_005: {
    observed: "The shopper holds a gray backpack in front of them, supports it with one hand, and looks at a phone in the other.",
    action: "The clerk explains that the small backpack is more compact and the large one has a separate laptop compartment.",
    outcome: "The shopper asks where to check out, keeps holding the backpack, and gestures to the left."
  },
  demo_006: {
    observed: "The shopper faces the display and reaches toward a small blue can, with a fingertip near its lid.",
    action: "The clerk explains that the two products are in the same fictional range, in 30 ml and 60 ml sizes.",
    outcome: "The shopper says they will buy the 30 ml size, nods, and looks back at the products."
  },
  demo_007: {
    observed: "The shopper stands in front of the kettle display, looking at the products without touching them.",
    action: "The clerk recommends looking at a small electric kettle for comparison.",
    outcome: "The shopper thanks the clerk, says they have not decided whether to buy a kettle and will browse, then looks back at the display."
  },
  demo_008: {
    observed: "The shopper examines a narrow white box, then sets it upright while keeping one hand on it.",
    action: "The clerk suggests looking at the short charging cable first.",
    outcome: "The shopper says they still want to compare the other option and reaches for the wider box."
  },
  demo_009: {
    observed: "The shopper picks up a gray-and-white sneaker and examines it while holding it in front of them.",
    action: "The clerk waits nearby without interacting with the shopper.",
    outcome: "The shopper continues examining the sneaker, then looks up and walks to the right while holding it."
  },
  demo_010: {
    observed: "The shopper picks up a beige packaged product from the display and looks down to examine it.",
    action: "No recognizable greeting, question, explanation, or product recommendation from staff was observed.",
    outcome: "The shopper continues examining the package, returns it to its original place, and resumes browsing with hands clasped."
  }
};

const select = document.querySelector("#caseSelect");
const video = document.querySelector("#demoVideo");
const source = document.querySelector("#videoSource");
const frameStrip = document.querySelector("#frameStrip");
const status = document.querySelector("#demoStatus");
let cases = [];
let currentIndex = 0;

async function fetchText(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Could not load ${path} (${response.status})`);
  }
  return response.text();
}

async function loadCases() {
  const dataFiles = await Promise.all([
    fetchText("data/train.jsonl"),
    fetchText("data/test.jsonl")
  ]);
  cases = dataFiles.flatMap((text) =>
    text.trim().split("\n").filter(Boolean).map((line) => JSON.parse(line))
  ).sort((a, b) => a.id.localeCompare(b.id));

  if (!cases.length) {
    throw new Error("No retail demo cases were found.");
  }

  cases.forEach((item, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${item.id.replace("demo_", "Case ")} · ${actionNames[item.Action.type] || item.Action.type}`;
    select.appendChild(option);
  });
  select.disabled = false;
  document.querySelector("#prevCase").disabled = false;
  document.querySelector("#nextCase").disabled = false;
  document.querySelector("#caseCount").textContent = `${cases.length} synthetic cases`;
  renderCase(Math.max(0, cases.findIndex((item) => item.id === "demo_008")));
}

function renderCase(index) {
  currentIndex = (index + cases.length) % cases.length;
  const item = cases[currentIndex];
  const title = sceneNames[item.id] || item.id;
  const videoPath = `assets/retailvid/${item.id}.mp4`;
  select.value = String(currentIndex);
  source.src = videoPath;
  video.poster = `assets/retailvid/${item.images[0].split("/").pop()}`;
  video.setAttribute("aria-label", `Silent synthetic retail video: ${title}`);
  document.querySelector("#videoFallback").href = videoPath;
  video.load();

  document.querySelector("#caseTitle").textContent = title;
  document.querySelector("#videoTitle").textContent = title;
  document.querySelector("#casePosition").textContent =
    `${String(currentIndex + 1).padStart(2, "0")} / ${cases.length}`;
  const annotation = englishAnnotations[item.id];
  document.querySelector("#observedBehavior").textContent =
    annotation?.observed || item.St.observable_behavior;
  document.querySelector("#actionLabel").textContent =
    `Given service action · ${actionNames[item.Action.type] || item.Action.type}`;
  document.querySelector("#actionContent").textContent =
    annotation?.action || item.Action.content;
  const stage = item["St+1"].aida_stage;
  document.querySelector("#outcomeLabel").textContent =
    `Reference outcome · ${stage.charAt(0).toUpperCase()}${stage.slice(1)}`;
  document.querySelector("#outcomeBehavior").textContent =
    annotation?.outcome || item["St+1"].observable_behavior;

  frameStrip.replaceChildren();
  item.images.forEach((image, frameIndex) => {
    const thumb = document.createElement("img");
    thumb.src = `assets/retailvid/${image.split("/").pop()}`;
    thumb.alt = `Input frame ${frameIndex + 1} of ${item.id}`;
    thumb.loading = "lazy";
    frameStrip.appendChild(thumb);
  });
}

select.addEventListener("change", (event) => renderCase(Number(event.target.value)));
document.querySelector("#prevCase").addEventListener("click", () => renderCase(currentIndex - 1));
document.querySelector("#nextCase").addEventListener("click", () => renderCase(currentIndex + 1));

loadCases().catch((error) => {
  status.hidden = false;
  status.textContent = `Unable to load case data: ${error.message}`;
  console.error(error);
});
