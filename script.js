pdfjsLib.GlobalWorkerOptions.workerSrc =
'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const btn = document.getElementById("calculateBtn");

btn.addEventListener("click", async () => {

    const responseFile =
    document.getElementById("responsePdf").files;

    const answerKeyFile =
    document.getElementById("answerKeyPdf").files;

   if(
    responseFile.length === 0 ||
    answerKeyFile.length === 0
)
{
    alert("Please upload both PDFs");
    return;
}

const responseText =
cleanPdfText(
await extractMultipleFiles(responseFile)
);

const answerText =
cleanPdfText(
await extractMultipleFiles(answerKeyFile)
);

    // =========================
    // ANSWER KEY PARSER
    // =========================

    const answerIds =
    answerText.match(/226895\d+/g);

    const answerMap = {};
    const questionSubjectMap = {};
    const subjectNameMap = {};

const subjectMatches =
[
...answerText.matchAll(
/(101|102|103|104|105|106|107|108|109|110|111|112|113|114|115|116|117|118|119|120|121|122|201|301|302|303|304|305|306|307|308|309|310|311|312|313|314|315|316|317|318|319|320|321|322|501)\s*-/g
)
];

const officialSubjectNames = {

    "101": "English",
    "102": "Hindi",
    "103": "Assamese",
    "104": "Bengali",
    "105": "Gujarati",
    "106": "Kannada",
    "107": "Malayalam",
    "108": "Marathi",
    "109": "Odia",
    "110": "Punjabi",
    "111": "Tamil",
    "112": "Telugu",
    "113": "Urdu",

    "301": "Accountancy / Book-Keeping",
    "302": "Agriculture",
    "303": "Anthropology",
    "304": "Biology / Biotechnology",
    "305": "Business Studies",
    "306": "Chemistry",
    "307": "Environmental Science",
    "308": "Computer Science / Information Practices",
    "309": "Economics / Business Economics",

    "312": "Fine Arts / Visual Arts",
    "313": "Geography / Geology",
    "314": "History",
    "315": "Home Science",
    "316": "Knowledge Tradition-Practices in India",
    "318": "Mass Media / Mass Communication",
    "319": "Mathematics / Applied Mathematics",
    "320": "Performing Arts",
    "321": "Physical Education",
    "322": "Physics",
    "323": "Political Science",
    "324": "Psychology",
    "325": "Sanskrit",
    "326": "Sociology",

    "501": "General Aptitude Test"

};

for(const match of subjectMatches)
{
    const code = match[1];

    if(!subjectNameMap[code])
    {
        subjectNameMap[code] =
        officialSubjectNames[code] ||
        `Subject ${code}`;
    }
}
console.log(subjectNameMap);
let subjectIndex = 0;

const subjects =
subjectMatches.map(match => match[1]);

for(let i = 0; i < answerIds.length; i += 5)
{
    const questionId = answerIds[i];
    const correctOptionId = answerIds[i + 1];

    answerMap[questionId] = correctOptionId;

    const subjectCode =
    subjects[subjectIndex];

    questionSubjectMap[questionId] =
    subjectCode;

    subjectIndex++;
}

    console.log(
        "Answer Key Questions:",
        Object.keys(answerMap).length
    );

    // =========================
    // RESPONSE PARSER
    // =========================

    const responseRegex =
    /Question ID\s*:\s*(\d+)[\s\S]*?Option 1 ID\s*:\s*(\d+)[\s\S]*?Option 2 ID\s*:\s*(\d+)[\s\S]*?Option 3 ID\s*:\s*(\d+)[\s\S]*?Option 4 ID\s*:\s*(\d+)[\s\S]*?Chosen Option\s*:\s*([1-4]|--)/g;

    const responses = [];

    let match;

    while((match = responseRegex.exec(responseText)) !== null)
    {
        responses.push({
            questionId: match[1],
            option1Id: match[2],
            option2Id: match[3],
            option3Id: match[4],
            option4Id: match[5],
            chosenOption: match[6]
        });

        document.getElementById("result").innerHTML =
`<pre>${JSON.stringify(responses, null, 2)}</pre>`;
    }
 

    console.log(
        "Response Questions:",
        responses.length
    );
console.log(responses);
window.responses = responses;

    // =========================
    // OVERALL STATS
    // =========================

    let score = 0;
    let correct = 0;
    let wrong = 0;
    let unattempted = 0;

    // =========================
    // SUBJECT STATS
    // =========================

   const subjectStats = {};

for(const subjectCode of Object.values(questionSubjectMap))
{
    if(!subjectStats[subjectCode])
    {
        subjectStats[subjectCode] = {

            correct: 0,
            wrong: 0,
            unattempted: 0,
            score: 0

        };
    }
}

    // =========================
    // SCORING
    // =========================

    for(const response of responses)
    {
        const subject =
        questionSubjectMap[response.questionId];

        let selectedOptionId = null;

        switch(response.chosenOption)
        {
            case "1":
                selectedOptionId =
                response.option1Id;
                break;

            case "2":
                selectedOptionId =
                response.option2Id;
                break;

            case "3":
                selectedOptionId =
                response.option3Id;
                break;

            case "4":
                selectedOptionId =
                response.option4Id;
                break;

            default:

                unattempted++;

                if(subjectStats[subject])
                {
                    subjectStats[subject]
                    .unattempted++;
                }

                continue;
        }

        const correctOptionId =
        answerMap[response.questionId];

        if(selectedOptionId === correctOptionId)
        {
            correct++;
            score += 5;

            subjectStats[subject]
            .correct++;

            subjectStats[subject]
            .score += 5;
        }
        else
        {
            wrong++;
            score -= 1;

            subjectStats[subject]
            .wrong++;

            subjectStats[subject]
            .score -= 1;
        }
    }

    // =========================
    // DEBUG
    // =========================

    console.log("Correct:", correct);
    console.log("Wrong:", wrong);
    console.log("Unattempted:", unattempted);
    console.log("Score:", score);

    for(const subjectCode in subjectStats)
{
    console.log(
        `Subject ${subjectCode}`,
        subjectStats[subjectCode]
    );
}

   // =========================
// DISPLAY RESULT
// =========================

let subjectHtml = "";

for(const subjectCode in subjectStats)
{
    const totalAttempted =
    subjectStats[subjectCode].correct +
    subjectStats[subjectCode].wrong;

    const accuracy =
    totalAttempted > 0
    ?
    (
        subjectStats[subjectCode].correct /
        totalAttempted
        * 100
    ).toFixed(1)
    :
    "0.0";

    subjectHtml += `

    <div class="subject-card">

        <h3>
            📚 ${subjectNameMap[subjectCode]}
        </h3>

        <p>
            Score:
            ${subjectStats[subjectCode].score}
        </p>

        <p>
            Correct:
            ${subjectStats[subjectCode].correct}
        </p>

        <p>
            Wrong:
            ${subjectStats[subjectCode].wrong}
        </p>

        <p>
            Unattempted:
            ${subjectStats[subjectCode].unattempted}
        </p>

        <p>
            Accuracy:
            ${accuracy}%
        </p>

        <div class="progress">

            <div
                class="progress-fill"
                style="width:${accuracy}%">

            </div>

        </div>

    </div>

    `;
}

document.getElementById("result").innerHTML = `

<div class="main-score">

    <h1>${score}</h1>

    <p>Raw Score</p>

</div>

<div class="stats-grid">

    <div class="stat-card">
        <h3>✅ Correct</h3>
        <h2>${correct}</h2>
    </div>

    <div class="stat-card">
        <h3>❌ Wrong</h3>
        <h2>${wrong}</h2>
    </div>

    <div class="stat-card">
        <h3>⭕ Unattempted</h3>
        <h2>${unattempted}</h2>
    </div>

    <div class="stat-card">
        <h3>🎯 Accuracy</h3>
        <h2>
        ${
(
    correct /
    Math.max(correct + wrong,1)
    * 100
).toFixed(1)
}%
        </h2>
    </div>

</div>

${subjectHtml}

`;
   // =========================
// PREPARE DATA FOR ASPRIENTS
// =========================

const finalScores = {};

for (const subjectCode in subjectStats) {
    finalScores[subjectCode] = subjectStats[subjectCode].score;
}

const payload = {
    totalScore: score,
    subjects: finalScores,
    timestamp: Date.now()
};

const encoded = btoa(
    JSON.stringify(payload)
);

// Wait 3 seconds so user can see result
setTimeout(() => {

    window.location.href =
        `https://architraj499.github.io/Asprients/import-score.html?data=${encodeURIComponent(encoded)}`;

}, 3000);
});

// =========================
// TEXT CLEANER
// =========================

function cleanPdfText(text)
{
    return text

    .replace(/Q u e stion/g, "Question")
    .replace(/O ption/g, "Option")
    .replace(/C hos e n/g, "Chosen")
    .replace(/A nsw e r ed/g, "Answered")
    .replace(/N ot A nsw e r ed/g, "Not Answered")
    .replace(/S t a tus/g, "Status")

    .replace(/\s+/g, " ");
}

// =========================
// PDF READER
// =========================
async function extractMultipleFiles(files)
{
    let combinedText = "";

    for(const file of files)
    {
        const text =
        await extractText(file);

        combinedText += text + "\n";
    }

    return combinedText;
}

async function extractText(file)
{
    const arrayBuffer =
    await file.arrayBuffer();

    const pdf =
    await pdfjsLib.getDocument({
        data: arrayBuffer
    }).promise;

    let fullText = "";

    for(let pageNum = 1;
        pageNum <= pdf.numPages;
        pageNum++)
    {
        const page =
        await pdf.getPage(pageNum);

        const content =
        await page.getTextContent();

        const text =
        content.items
        .map(item => item.str)
        .join(" ");

        fullText += text + "\n";
    }

    return fullText;
}