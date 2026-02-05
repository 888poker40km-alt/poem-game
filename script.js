let words = [];
let currentIndex = 0;
let errors = 0;
let startTime;
let timerInterval;
let poemText = "";

const poemSelect = document.getElementById("poemSelect");
const poemInput = document.getElementById("poemInput");

document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("newPoemBtn").addEventListener("click", () => {
    poemInput.style.display = "block";
    poemInput.value = "";
    poemSelect.value = "";
});

document.getElementById("hintBtn").addEventListener("click", () => {
    document.getElementById("hintModal").style.display = "block";
});
document.getElementById("closeHint").addEventListener("click", () => {
    document.getElementById("hintModal").style.display = "none";
});

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function savePoem(name, text) {
    let poems = JSON.parse(localStorage.getItem("poems") || "{}");
    poems[name] = text;
    localStorage.setItem("poems", JSON.stringify(poems));
}

function loadPoems() {
    poemSelect.innerHTML = "<option value=''>-- Select Poem --</option>";
    let poems = JSON.parse(localStorage.getItem("poems") || "{}");
    for (let name in poems) {
        let option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        poemSelect.appendChild(option);
    }
}

poemSelect.addEventListener("change", () => {
    let poems = JSON.parse(localStorage.getItem("poems") || "{}");
    if (poemSelect.value) {
        poemInput.value = poems[poemSelect.value];
        poemInput.style.display = "none";
    }
});

function startTimer() {
    timerInterval = setInterval(() => {
        let timeSpent = ((Date.now() - startTime) / 1000).toFixed(1);
        document.getElementById("timer").innerText = `⏱ ${timeSpent}s`;
    }, 100);
}

function startGame() {
    let text = poemInput.value.trim();
    if (!text) return alert("Paste a poem!");

    if (!poemSelect.value) {
        let name = prompt("Enter poem name:");
        if (!name) return;
        savePoem(name, text);
        loadPoems();
        poemSelect.value = name;
    }

    poemText = text;
    poemInput.style.display = "none";

    document.getElementById("fullPoem").innerText = poemText;

    words = poemText.replace(/[.,!?]/g, "").split(/\s+/);

    currentIndex = 0;
    errors = 0;
    startTime = Date.now();

    document.getElementById("result").innerText = "";
    document.getElementById("game").style.display = "block";

    startTimer();
    nextQuestion();
}

function nextQuestion() {
    if (currentIndex >= words.length) {
        clearInterval(timerInterval);
        let timeSpent = ((Date.now() - startTime) / 1000).toFixed(1);
        document.getElementById("result").innerText =
            `🎉 Finished!\nErrors: ${errors}\nTime: ${timeSpent} sec`;
        document.getElementById("options").innerHTML = "";
        return;
    }

    const correct = words[currentIndex];
    let options = [correct];

    while (options.length < 4) {
        let randomWord = words[Math.floor(Math.random() * words.length)];
        if (!options.includes(randomWord)) options.push(randomWord);
    }

    shuffle(options);

    const optionsDiv = document.getElementById("options");
    optionsDiv.innerHTML = "";

    options.forEach(word => {
        const btn = document.createElement("button");
        btn.innerText = word;
        btn.onclick = () => checkAnswer(word);
        optionsDiv.appendChild(btn);
    });

    document.getElementById("progress").innerText =
        `Word ${currentIndex + 1} / ${words.length}`;
}

function checkAnswer(choice) {
    if (choice === words[currentIndex]) {
        currentIndex++;
        nextQuestion();
    } else {
        errors++;
        alert("❌ Wrong!");
    }
}

loadPoems();

/* PWA */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}