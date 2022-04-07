console.log("Loaded Kahoot AI")

const observer = new MutationObserver((mutations, obs) => {
    const questionTitle = document.querySelector("[data-functional-selector='block-title']");
    if (questionTitle) {
        console.log(questionTitle.innerHTML)
        obs.disconnect();
        return;
    }
});

observer.observe(document, {
    childList: true,
    subtree: true
});
