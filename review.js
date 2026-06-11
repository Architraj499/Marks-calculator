pdfjsLib.GlobalWorkerOptions.workerSrc =
'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

async function renderPdfPages(file)
{
    const container =
    document.getElementById("questionContainer");

    container.innerHTML = "";

    const pdf =
    await pdfjsLib.getDocument({
        data: await file.arrayBuffer()
    }).promise;

    for(let pageNum = 1;
        pageNum <= pdf.numPages;
        pageNum++)
    {
        const page =
        await pdf.getPage(pageNum);

        const viewport =
        page.getViewport({
            scale:2
        });

        const canvas =
        document.createElement("canvas");

        const ctx =
        canvas.getContext("2d");

        canvas.width =
        viewport.width;

        canvas.height =
        viewport.height;

        await page.render({
            canvasContext:ctx,
            viewport:viewport
        }).promise;

        const card =
        document.createElement("div");

        card.className =
        "question-card";

        card.innerHTML = `

        <div class="page-topbar">

            <div class="page-number">
                Page No. ${pageNum}
            </div>

            <div class="question-status">
                Review
            </div>

        </div>

        `;

        card.appendChild(canvas);

        container.appendChild(card);
    }
}

document
.getElementById("reviewBtn")
.addEventListener(
"click",
async () =>
{
    const file =
    document
    .getElementById("responsePdf")
    .files[0];

    if(!file)
    {
        alert(
        "Please upload Response Sheet PDF"
        );
        return;
    }

    await renderPdfPages(file);
});