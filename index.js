const api_key = "44be38c29dc151b13cddd43381d35b6fcb9a87d654eaa2c585ffec90d96477b7"

toastr.options = {
    "debug": false,
    "progressBar": true,
    "positionClass": "toast-top-center",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "4000",
    "hideDuration": "1000",
    "timeOut": "4000",
    "extendedTimeOut": "4000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}

console.log("Loaded Kahoot AI")
toastr.success("Kahoot AI Loaded!")

function getWordCount(str) {
    return str.split(' ')
        .filter(function(n) { return n !== '' })
        .length;
}

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
        toastr.options = {
            "debug": false,
            "progressBar": true,
            "positionClass": "toast-top-center",
            "preventDuplicates": false,
            "onclick": null,
            "showDuration": "8000",
            "hideDuration": "1000",
            "timeOut": "8000",
            "extendedTimeOut": "8000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
        }
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

        if (questions.length === 2 && (questions[0][1] === "True" || questions[1][1] === "True")) {
            toastr.warning("Kahoot AI struggles a lot with True/False questions and may get this wrong")
        }

        const url = ("https://serpapi.com/search.json?engine=google"
                    + "&q=" + questionTitle.innerHTML.replaceAll("?", "").replaceAll("_", "").replaceAll("  ", " ").replaceAll(" ", "+")
                    + "&api_key=" + api_key)
        fetch(url).then(function(response) {
            return response.json();
        }).then(function(data) {
            console.log(data)
            let temp = []
            for (let cur in questions) {
                if (data["answer_box"] === undefined) {
                    // No answer box

                    let total = 0
                    if (getWordCount(questions[cur][1]) > 1) {
                        for (let cur_result in data["organic_results"]) {
                            if (data["organic_results"][cur_result]["snippet"] !== undefined) {
                                total += compareTwoStrings(data["organic_results"][cur_result]["snippet"], questions[cur][1])
                            }
                        }
                    } else {
                        let search_string = " " + questions[cur][1].replace(" ", "") + " "
                        for (let cur_result in data["organic_results"]) {
                            if (data["organic_results"][cur_result]["snippet"] !== undefined) {
                                total += data["organic_results"][cur_result]["snippet"].split(search_string).length - 1
                            }
                        }
                    }
                    temp.push([questions[cur][0], questions[cur][1], total])
                } else if (data["answer_box"]["type"] === "organic_result") {
                    // Normal text answer box

                    if (data["answer_box"]["answer"] !== undefined) {
                        temp.push([questions[cur][0], questions[cur][1], compareTwoStrings(data["answer_box"]["answer"], questions[cur][1])])
                    } else if (data["answer_box"]["snippet"] !== undefined) {
                        temp.push([questions[cur][0], questions[cur][1], data["answer_box"]["snippet"].split(questions[cur][1]).length - 1])
                    } else if (data["answer_box"]["title"] !== undefined) {
                        temp.push([questions[cur][0], questions[cur][1], data["answer_box"]["title"].split(questions[cur][1]).length - 1])
                    }
                } else if (data["answer_box"]["type"] === "calculator_result") {
                    // Calculator answer box

                    temp.push([questions[cur][0], questions[cur][1], compareTwoStrings(data["answer_box"]["result"], questions[cur][1])])
                } else {
                    // Unsupported answer box type

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
            if (correct_answer === null) {
                toastr.error("Couldn\'t figure out the correct_answer")
            } else {
                for (let cur in questions) {
                    if (questions[cur][0] === correct_answer) {
                        questions[cur][0].style.backgroundColor = "rgb(94, 176, 53)"
                        questions[cur][0].firstElementChild.style.backgroundColor = "rgb(94, 176, 53)"
                    } else {
                        questions[cur][0].style.backgroundColor = "rgb(235, 47, 78)"
                        questions[cur][0].firstElementChild.style.backgroundColor = "rgb(235, 47, 78)"
                    }
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
