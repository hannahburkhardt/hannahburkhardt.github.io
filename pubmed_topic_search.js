function get(url) {
    // Return a new promise.
    return new Promise(function (resolve, reject) {
        // Do the usual XHR stuff
        var req = new XMLHttpRequest();
        req.open('GET', url, false);

        req.onload = function () {
            // This is called even on 404 etc
            // so check the status
            if (req.status == 200) {
                // Resolve the promise with the response text
                resolve(JSON.parse(req.response));
            } else {
                // Otherwise reject with the status text
                // which will hopefully be a meaningful error
                reject(Error(req.statusText));
            }
        };

        // Handle network errors
        req.onerror = function () {
            reject(Error("Network Error"));
        };

        // Make the request
        req.send();
    });
}

function addYearToPubs(year, db, term) {
    return get("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=" + db + "&term=%22"
        + term.replace(' ', '+') + "%22+" + year + "%5Bdp%5D&api_key=175087d0760a898c872fc958fc61f1428008&rettype=count&retmode=json"
    ).then(function (result) {
        var response = result.esearchresult.count;
        console.log(year + " succeeded");
        return {
            "Year": year,
            "url": "https://www.ncbi.nlm.nih.gov/" + db + "/?term=%22" + term.replace(' ', '+') + "%22+" + year + "%5Bdp%5D",
            "Number of publications": response
        };

    }, function (error) {
        console.log(year + " failed");
        console.log(error)
    });


    // $.ajax({
    //     url: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=" + db + "&term=%22"
    //         + term.replace(' ', '+') + "%22+" + year + "%5Bdp%5D&api_key=175087d0760a898c872fc958fc61f1428008&rettype=count&retmode=json",
    //     success: function (result, status, xhr) {
    //         var response = result.esearchresult.count;
    //         console.log(year + " succeeded");
    //         pubs.push({
    //             "Year": year,
    //             "url": "https://www.ncbi.nlm.nih.gov/" + db + "/?term=%22" + term.replace(' ', '+') + "%22+" + year + "%5Bdp%5D",
    //             "Number of publications": response
    //         });
    //     },
    //     error: function (xhr, status, error) {
    //         console.log(year + " failed");
    //         console.log(error)
    //     }
    // });
}

function getChartSpec(term, db, startYear) {
    var promises = [];
    var year = startYear;
    while (year < new Date().getFullYear()) {
        promises.push(addYearToPubs(year, db, term));
        year += 1;
    }

    return Promise.all(promises).then(function (pubs) {
        return {
            "config": {"view": {"width": 400, "height": 300}, "mark": {"tooltip": null}},
            "data": {"name": "pubs"},
            "mark": {"type": "line", "point": true},
            "encoding": {
                "href": {"type": "nominal", "field": "url"},
                "x": {"type": "ordinal", "field": "Year"},
                "y": {"type": "quantitative", "field": "Number of publications"}
            },
            "title": "Number of results for \"" + term + "\" in " + (db === "pmc" ? "Pubmed Central" : "Pubmed") + " by year",
            "$schema": "https://vega.github.io/schema/vega-lite/v3.3.0.json",
            "datasets": {
                "pubs": pubs
            }
        }
    });
}

function showError(el, error) {
    el.innerHTML = ('<div class="error" style="color:red;">'
        + '<p>JavaScript Error: ' + error.message + '</p>'
        + "<p>This usually means there's a typo in your chart specification. "
        + "See the javascript console for the full traceback.</p>"
        + '</div>');
    throw error;
}

function updateChart() {
    console.log('updating');
    toggleLoadingSpinner();

    var term = document.getElementById("searchterm").value;
    var db = document.getElementById("PMC").checked ? "pmc" : "pubmed";

    // run in a different thread using a worker
    var worker = new Worker("pubmed_topic_search.js")
    worker.onmessage = function (e) {
        var embedOpt = {"mode": "vega-lite"};

        const el = document.getElementById('vis');
        vegaEmbed("#vis", e.data, embedOpt)
            .catch(error => showError(el, error));
        toggleLoadingSpinner();

    };
    worker.postMessage([term, db, 1990]);
}

onmessage = function (e) {
    getChartSpec(e.data[0], e.data[1], e.data[2]).then(function (spec) {
        postMessage(spec)
    }, function (error) {
        console.log(error);
    });
}

function searchKeyPress(e) {
    // look for window.event in case event isn't passed in
    e = e || window.event;
    if (e.keyCode == 13) {
        document.getElementById('search').click();
        return false;
    }
    return true;
}

function toggleLoadingSpinner() {
    var x = document.getElementById("loading-image");
    if (x.style.display === "none") {
        x.style.display = "inline";
    } else {
        x.style.display = "none";
    }
}
