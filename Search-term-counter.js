// ==UserScript==
// @name         Wikipedia Search Term Counter
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Counts the total number of search terms on a page (optimized for use on Wikipedia)
// @author       Wantitled
// @match        https://*/*
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

const searchTerms = ["United Kingdom", "Britain", "UK", "British"];
let searchCount = [];
let searchRegs = [];

(function() {
    'use strict';
    (function() {
        for (let i = 0; i < searchTerms.length; i++){
            searchCount.push(0);
            if (searchTerms[i] === "UK"){searchRegs.push(new RegExp("(?!\w)" + searchTerms[i] + "(?!\w)", "g"))} else{
            searchRegs.push(new RegExp(searchTerms[i], "gi"));}
        }
    })();


    let checkNode = (node) => {
        let nodeArr = node.split(" ");
        for (let i = 0; i < searchTerms.length; i++){
            for (let j = 0; j < nodeArr.length; j++){
                if (i === 0 && /united/i.test(nodeArr[j])){
                    if (j < nodeArr.length - 1){if (/kingdom/i.test(nodeArr[j+1])){
                        if (!/of/i.test(nodeArr[j+2])){searchCount[i]++}}}
                } else {
                    if (searchRegs[i].test(nodeArr[j])){
                        searchCount[i]++;
                    }
                }
            }
        }
    }

    $(document).ready(function(){
        let loopBreaker = true;

        (function() {
            var treeWalker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                { acceptNode: function(node) { return NodeFilter.FILTER_ACCEPT; } }
            );
            var currentNode = treeWalker.currentNode;
            while(currentNode && loopBreaker) {
                if (currentNode.parentNode.nodeName !== "SCRIPT"
                    && currentNode.parentNode.nodeName !== "IMG"
                    && currentNode.parentNode.nodeName !== "CITE"
                    && currentNode.parentNode.nodeName !== "STYLE"
                    && currentNode.parentNode.nodeName !== "IMG"
                    && currentNode.parentNode.nodeName !== "NOSCRIPT"
                    && currentNode.parentNode.nodeName !== "HTML"
                    && currentNode.parentNode.nodeName !== "BODY"
                    && currentNode.parentNode.nodeName !== "HEAD"
                   ){
                    if ((currentNode.textContent === "References"
                        || currentNode.textContent === "General bibliography"
                        || currentNode.textContent === "See also")
                        && currentNode.parentNode.nodeName === "SPAN" && currentNode.parentNode.parentNode.nodeName !== "A"){loopBreaker = false} else{
                        if (/\w+/g.test(currentNode.textContent)){
                            checkNode(currentNode.textContent);
                        }
                    }
                }
                currentNode = treeWalker.nextNode();
            }
        })()
        let total = 0;
        for (let i = 0; i < searchTerms.length; i++){
            total += searchCount[i];
            console.log(searchTerms[i], ":", searchCount[i]);
        }
        console.log(document.getElementById("firstHeading").innerText, total);
     })
})();
