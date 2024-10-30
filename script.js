document.addEventListener("DOMContentLoaded", function () {
  // Check if there's saved data in sessionStorage and populate the fields
  const savedText = sessionStorage.getItem("scrollText");
  const savedTime = sessionStorage.getItem("scrollTime");
  const savedAutoScroll = sessionStorage.getItem("autoScroll");

  if (savedText) document.getElementById("inputText").value = savedText;
  if (savedTime) document.getElementById("scrollTime").value = savedTime;
  if (savedAutoScroll) {
    document.querySelector(
      `input[name="autoScroll"][value="${savedAutoScroll}"]`
    ).checked = true;
  }
});

document
  .getElementById("submitButton")
  .addEventListener("click", async function () {
    const inputText = document.getElementById("inputText").value;
    const scrollTime = document.getElementById("scrollTime").value || 20;
    const autoScroll = document.querySelector(
      'input[name="autoScroll"]:checked'
    ).value;

    // Check if inputText is empty
    if (!inputText) {
      alert("Please enter text to scroll!");
      return;
    }
    if (scrollTime < 5) {
      alert("Scroll Time must be greater than 5 seconds!");
      return;
    }

    // Save the input data to sessionStorage for potential future use
    sessionStorage.setItem("scrollText", inputText);
    sessionStorage.setItem("scrollTime", scrollTime);
    sessionStorage.setItem("autoScroll", autoScroll);

    const encodedText = encodeURIComponent(inputText);
    const originalUrl = `https://patorjk.com/misc/scrollingtext/timewaster.php?text=${encodedText}&autoscroll=${autoScroll}&duration=${scrollTime}`;
    const corsProxyUrl = `https://cors-anywhere.herokuapp.com/${originalUrl}`;

    try {
      const response = await fetch(corsProxyUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let htmlContent = await response.text();

      // Create a temporary element to parse the HTML
      const tempElement = document.createElement("div");
      tempElement.innerHTML = htmlContent;

      // Remove the controlArea div
      const controlArea = tempElement.querySelector("#controlArea");
      if (controlArea) {
        controlArea.remove();
      }

      // Remove all anchor tags
      const anchors = tempElement.querySelectorAll("a");
      anchors.forEach((anchor) => anchor.remove());

      // Get the cleaned HTML content
      htmlContent = tempElement.innerHTML;

      // Open a new tab
      const newTab = window.open("", "_blank");

      // Write the content to the new tab
      newTab.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Scrolling Text</title>
        <style>
          html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
          }
          body {
            background-color: black;
            color: white;
            font-family: "Courier New", monospace;
            display: flex;
            flex-direction: column;
          }
          #scrollContent {
            flex: 1;
            white-space: pre-wrap;
            font-size: 16px;
            padding: 20px;
            overflow-y: scroll;
            box-sizing: border-box;
            margin: 0;
          }
          #scrollContent::-webkit-scrollbar {
            width: 12px;
          }
          #scrollContent::-webkit-scrollbar-track {
            background: #000;
          }
          #scrollContent::-webkit-scrollbar-thumb {
            background-color: #333;
            border-radius: 6px;
            border: 3px solid #000;
          }
        </style>
      </head>
      <body>
        <div id="scrollContent">${htmlContent}</div>
        <script>
          function autoScrollContent(container, scrollTime) {
            const totalHeight = container.scrollHeight - container.clientHeight;
            const scrollPerMs = totalHeight / (scrollTime * 1000);
            let scrollPosition = 0;
            const startScroll = performance.now();

            function step(timestamp) {
              const elapsed = timestamp - startScroll;
              scrollPosition = elapsed * scrollPerMs;
              container.scrollTop = scrollPosition;

              if (scrollPosition < totalHeight) {
                requestAnimationFrame(step);
              }
            }

            requestAnimationFrame(step);
          }

          const scrollContainer = document.getElementById('scrollContent');
          if ("${autoScroll}" === "ON") {
            autoScrollContent(scrollContainer, ${scrollTime});
          }
        </script>
      </body>
      </html>
    `);

      newTab.document.close();
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to fetch data. Please try again.");
    }
  });
