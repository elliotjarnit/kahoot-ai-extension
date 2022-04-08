const api_key = "44be38c29dc151b13cddd43381d35b6fcb9a87d654eaa2c585ffec90d96477b7"

toastr.options = {
    "debug": false,
    "progressBar": true,
    "positionClass": "toast-bottom-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "3000",
    "hideDuration": "1000",
    "timeOut": "3000",
    "extendedTimeOut": "3000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}

console.log("Loaded Kahoot AI")
toastr.success("Kahoot AI Loaded!")

function compareTwoStrings(first, second) {
    first = first.replace(/\s+/g, '')
    second = second.replace(/\s+/g, '')

    if (first === second) return 1;
    if (first.length < 2 || second.length < 2) return 0;

    let firstBigrams = new Map();
    for (let i = 0; i < first.length - 1; i++) {
        const bigram = first.substring(i, i + 2);
        const count = firstBigrams.has(bigram)
            ? firstBigrams.get(bigram) + 1
            : 1;

        firstBigrams.set(bigram, count);
    };

    let intersectionSize = 0;
    for (let i = 0; i < second.length - 1; i++) {
        const bigram = second.substring(i, i + 2);
        const count = firstBigrams.has(bigram)
            ? firstBigrams.get(bigram)
            : 0;

        if (count > 0) {
            firstBigrams.set(bigram, count - 1);
            intersectionSize++;
        }
    }

    return (2.0 * intersectionSize) / (first.length + second.length - 2);
}


const observer2 = new MutationObserver((mutations, obs) => {
    const questionTitle = document.querySelector("[data-functional-selector='block-title']");
    if (!questionTitle) {
        obs.disconnect();
        setTimeout(function(){observer1.observe(document, {childList: true, subtree: true});}, 200);
    }
});

const observer1 = new MutationObserver((mutations, obs) => {
    const questionTitle = document.querySelector("[data-functional-selector='block-title']");
    if (questionTitle) {
        let questions1 = []
        for (let i = 0; i <= 3; i++) {
            let ques = document.querySelector("[data-functional-selector='answer-" + i + "']");
            if (ques === null) {
                break
            }
            questions1.push(ques)
        }
        let questions = []
        for (let cur in questions1) {
            questions.push([questions1[cur], questions1[cur].lastElementChild.firstElementChild.innerHTML])
        }
        const url = ("https://serpapi.com/search.json?engine=google"
                    + "&q=" + questionTitle.innerHTML.replaceAll(" ", "+").replaceAll("?", "")
                    + "&api_key=" + api_key)
        fetch(url).then(function(response) {
            return response.json();
        }).then(function(data) {
            console.log(data)
            let temp = []
            for (let cur in questions) {
                if (data["answer_box"] === undefined) {

                    // This would be if there is no answer box
                    let total = 0
                    for (let cur_result in data["organic_results"]) {
                        if (data["organic_results"][cur_result]["snippet"] !== undefined) {
                            total += compareTwoStrings(data["organic_results"][cur_result]["snippet"], questions[cur][1])
                        }
                    }
                    temp.push([questions[cur][0], questions[cur][1], total])

                } else if (data["answer_box"]["type"] == "organic_result") {
                    temp.push([questions[cur][0], questions[cur][1], compareTwoStrings(data["answer_box"]["answer"], questions[cur][1])])
                } else if (data["answer_box"]["type"] == "calculator_result") {
                    temp.push([questions[cur][0], questions[cur][1], compareTwoStrings(data["answer_box"]["result"], questions[cur][1])])
                } else {
                    toastr.warning("This type of question is not supported yet.")
                }
            }
            let max = 0
            let correct_answer = null
            for (let cur in temp) {
                if (temp[cur][2] > max) {
                    max = temp[cur][2]
                    correct_answer = temp[cur][0]
                }
            }

            for (let cur in questions) {
                if (questions[cur][0] == correct_answer) {
                    questions[cur][0].style.backgroundColor = "green"
                    questions[cur][0].firstElementChild.style.backgroundColor = "green"
                } else {
                    questions[cur][0].style.backgroundColor = "red"
                    questions[cur][0].firstElementChild.style.backgroundColor = "red"
                }
            }
        })
        obs.disconnect();

        observer2.observe(document, {
            childList: true,
            subtree: true
        });
    }
});

observer1.observe(document, {
    childList: true,
    subtree: true
});
