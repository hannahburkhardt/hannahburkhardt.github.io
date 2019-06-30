---
layout: page
title: "Pubmed topic trends"
---
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm//vega@4"></script>
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm//vega-lite@2.6.0"></script>
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm//vega-embed@3"></script>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>

Enter a search term, e.g. "decision support", and click search to see the number of relevant publications in Pubmed Central per year since 1990.
<form>
Database:
    <input type="radio" name="db" id="PMC" checked> PMC
    <input type="radio" name="db" id="Pubmed"> Pubmed
    <br>
    Search term:
    <input type="text" id="searchterm" onkeypress="return searchKeyPress(event);">
    <input type="button" value="Search" id="search" onclick="updateChart();" />
    <img id="loading-image" src="bime.gif" alt="Loading..." style="display:none;" height="28" />
</form>

<div id="vis"></div>
<script src="pubmed_topic_search.js"></script>