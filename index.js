console.log("Loaded Kahoot AI")

const observer = new MutationObserver((mutations, obs) => {
    const questionTitle = document.querySelector("[data-functional-selector='block-title']");
    if (questionTitle) {
        console.log(questionTitle.innerHTML)
        const question1 = document.querySelector("[data-functional-selector='answer-0']");
        const question2 = document.querySelector("[data-functional-selector='answer-1']");
        const question3 = document.querySelector("[data-functional-selector='answer-2']");
        const question4 = document.querySelector("[data-functional-selector='answer-3']");
        console.log(question1.lastElementChild.firstElementChild.innerHTML)
        console.log(question2.lastElementChild.firstElementChild.innerHTML)
        console.log(question3.lastElementChild.firstElementChild.innerHTML)
        console.log(question4.lastElementChild.firstElementChild.innerHTML)
        obs.disconnect();
        return;
    }
});

observer.observe(document, {
    childList: true,
    subtree: true
});
