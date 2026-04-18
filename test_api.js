const fs = require('fs');

async function testGenerate() {
    try {
        const formData = new FormData();
        formData.append("subject", "Debugging");
        formData.append("goal", "Find the error");
        formData.append("examDate", "12-12-2026");
        formData.append("hours", "2");

        // Optional: Append the syllabus.pdf to trigger full RAG pathway
        if (fs.existsSync("syllabus.pdf")) {
            const buffer = fs.readFileSync("syllabus.pdf");
            const blob = new Blob([buffer], { type: "application/pdf" });
            formData.append("file", blob, "syllabus.pdf");
        }

        const res = await fetch("http://localhost:3000/api/roadmap/generate", {
            method: "POST",
            body: formData
        });

        const data = await res.json();
        console.log("SERVER RESPONSE CODE:", res.status);
        console.log("SERVER RESPONSE DATA:", JSON.stringify(data, null, 2));

    } catch (e) {
        console.error("Test Script Error:", e);
    }
}

testGenerate();
