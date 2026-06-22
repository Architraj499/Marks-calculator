pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

document
.getElementById("extractBtn")
.addEventListener("click", extractPdf);

async function extractPdf()
{
    const file =
    document.getElementById("pdf").files[0];

    if(!file)
    {
        alert("Upload PDF");
        return;
    }

    let text =
    await extractText(file);

    text = text

    .replace(/Q u e stion/g,"Question")
    .replace(/O ption/g,"Option")
    .replace(/C hos e n/g,"Chosen")
    .replace(/A nsw e r ed/g,"Answered")
    .replace(/N ot A nsw e r ed/g,"Not Answered")
    .replace(/S t a tus/g,"Status")

    .replace(/\s+/g," ");

    const responses = [];

    const blocks =
    text.split(/Q\s*\.\s*\d+/);

    for(const block of blocks)
    {
        const questionId =
        block.match(
            /Question\s*ID\s*:\s*(\d+)/
        );

        const option1 =
        block.match(
            /Option\s*1\s*ID\s*:\s*(\d+)/
        );

        const option2 =
        block.match(
            /Option\s*2\s*ID\s*:\s*(\d+)/
        );

        const option3 =
        block.match(
            /Option\s*3\s*ID\s*:\s*(\d+)/
        );

        const option4 =
        block.match(
            /Option\s*4\s*ID\s*:\s*(\d+)/
        );

        const chosen =
        block.match(
            /Chosen\s*Option\s*:\s*([1-4]|--)/
        );

        if(!questionId)
        {
            continue;
        }

        let chosenOptionId =
        "Not Answered";

        if(chosen)
        {
            switch(chosen[1])
            {
                case "1":
                    chosenOptionId =
                    option1?.[1];
                    break;

                case "2":
                    chosenOptionId =
                    option2?.[1];
                    break;

                case "3":
                    chosenOptionId =
                    option3?.[1];
                    break;

                case "4":
                    chosenOptionId =
                    option4?.[1];
                    break;
            }
        }

        responses.push({

            questionId:
            questionId[1],

            chosenOptionId:
            chosenOptionId

        });
    }
document.getElementById(
"questionCount"
).textContent =
responses.length;


    console.log(
        "Questions Found:",
        responses.length
    );

    document
    .getElementById("output")
    .textContent =
    responses
.map(item =>

`Question ID : ${item.questionId}

Chosen Option ID : ${item.chosenOptionId}

--------------------------------`
)

.join("\n");
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

    for(
        let page = 1;
        page <= pdf.numPages;
        page++
    )
    {
        const p =
        await pdf.getPage(page);

        const content =
        await p.getTextContent();

        fullText +=
        content.items
        .map(item => item.str)
        .join(" ");

        fullText += "\n";
    }

    return fullText;
}

document
.getElementById("copyBtn")
.addEventListener("click", () => {

    const text =
    document
    .getElementById("output")
    .textContent;

    navigator.clipboard
    .writeText(text)
    .then(() => {

        alert(
            "Copied Successfully ✅"
        );

    });

});