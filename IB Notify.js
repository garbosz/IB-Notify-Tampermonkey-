// ==UserScript==
// @name         IB Notify
// @namespace    trans-logistics.amazon.com
// @version      1.6.7
// @description  pop up notification for new manifests to prevent user from missing important updates. auto updates enabled by github
// @author       garbosz@
// @downloadURL  https://axzile.corp.amazon.com/-/carthamus/download_script/ib-notify.user.js
// @updateURL    https://axzile.corp.amazon.com/-/carthamus/download_script/ib-notify.user.js
// @match        https://trans-logistics.amazon.com/ssp/dock/*
// @match        https://trans-logistics-eu.amazon.com/ssp/dock/*
// @match        https://trans-logistics.amazon.com/ssp/dock/ib
// @grant        GM_notification
// @grant        GM_addStyle
// @run-at document-end
// ==/UserScript==

// wait 5 seconds to let IB load data
setTimeout(init(), 5000);
const ver="1.6.7";

// Define the key name for the cached array
const PROCESSED_ARRAY_KEY = 'processedArray';

// Function to cache the processed array
function cacheProcessedArray(array) {
    console.log("storing processed items");
    console.log("current List: "+processed);
    // Convert the array to a string
    const arrayString = JSON.stringify(array);

    // Store the array string in local storage
    localStorage.setItem(PROCESSED_ARRAY_KEY, arrayString);
}

// Function to load the cached processed array
function loadProcessedArray() {
    console.log("loading processed items");
    // Get the array string from local storage
    const arrayString = localStorage.getItem(PROCESSED_ARRAY_KEY);

    // Parse the array string to an actual array
    const array = JSON.parse(arrayString);

    return array;
}


//run at start
function init(){
    console.log("waited patiently");

}

//load processed list from cashe
let processed = loadProcessedArray();

//create trouble shooting buttons
let resetButton = document.createElement("button");
resetButton.innerHTML = "Reset List";
resetButton.style.padding = "10px 20px";
resetButton.style.backgroundColor = "#4CAF50";
resetButton.style.color = "white";
resetButton.style.border = "none";
resetButton.style.borderRadius = "4px";
resetButton.style.cursor = "pointer";
resetButton.style.marginRight = "10px";
document.body.appendChild(resetButton);

resetButton.addEventListener ("click", function() {
    processed = [];
    cacheProcessedArray(processed);
    console.log("Processed array reset to empty:", processed);
});

let testButton = document.createElement("button");
testButton.innerHTML = "Test Notification";
testButton.style.padding = "10px 20px";
testButton.style.backgroundColor = "#4CAF50";
testButton.style.color = "white";
testButton.style.border = "none";
testButton.style.borderRadius = "4px";
testButton.style.cursor = "pointer";
document.body.appendChild(testButton);

testButton.addEventListener("click", function () {
    let current=new Date();
    console.log("IB Notify triggered manually @ "+current.toLocaleTimeString());
    let dataTable = fetchData();//get data build table
    if(dataTable.length ==0){//catch for if fetchdata is run before page can finish loading data
        console.log("fetched data was zero length, waiting and trying again");
        setTimeout(() => {
            console.log("trying fetchData again.");
            dataTable=fetchData();
        }, "1000")
    }
    getVolumeData(dataTable)//chug through data if new manifest found, add to blacklist and call popup
});

//runs at start to grab current manifests right when the page loads. a little unnecessary but assures user the script is working
setTimeout(function() {
    hostTrigger();
}, 5000); // 5 seconds in milliseconds

//this is the function called based on the refresh timer built into the page
function hostTrigger() {
    let current=new Date();
    console.log("IB Notify triggered @ "+current.toLocaleTimeString());
    console.log("current Version: "+ver);
    let dataTable = fetchData();//get data build table
    if(dataTable.length ==0){//catch for if fetchdata is run before page can finish loading data
        console.log("fetched data was zero length, waiting and trying again");
        setTimeout(() => {
            console.log("trying fetchData again.");
            dataTable=fetchData();
            getVolumeData(dataTable)//chug through data if new manifest found, add to blacklist and call popup
        }, "3000")
    }
    getVolumeData(dataTable)//chug through data if new manifest found, add to blacklist and call popup
}
/*
// checks every 40 seconds to see if refresh timer is in the final 60 seconds, and then waits 70 seconds before calling the hostTrigger function
let delay=40;
setInterval(function() {
    console.log("checking for final minute");
    let xpath = "//*[@class='redText']";
    let result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    if (result.singleNodeValue) {
        delay=70;
        console.log("delay is "+delay);
        console.log("Timer Resetting soon, prepping IB Notify for new data");
        setTimeout(hostTrigger, 70 * 1000);
    } else {
        delay=40;
        console.log("delay is "+delay);
    }
}, delay * 1000);
*/
let delay=250;
setInterval(function() {
    console.log("timer ended refreshing and executing");
    location.reload()
}, delay * 1000);

//this handles making the popup on the page, NOTE; it will pause execution on the rest of the page until dismissed
function displayPopup(vol) {
    console.log("checking Popup");
    if(vol.textContent > 0){
        console.log("\tconditions met...posting");
        let current = new Date();
        alert("New Manifest! @"+current.toLocaleTimeString()+"\nVRID: "+vol.firstChild.dataset.vrid+"\nVolume on board: "+vol.textContent);
    } else {
        console.log("\tconditions not met...cancelling popup");
    }
}

//this handles creating the system notification, NOTE: notification API not fully supported by firefox. chrome or Edge is recommended
function notifyMe(vol) {
    console.log("checking Notification");
    if(vol.textContent > 0){
        console.log("\tconditions met...posting");
        let current = new Date();
        if ('Notification' in window) {
            Notification.requestPermission().then(function(permission) {
                if (permission === "granted") {
                    let notification = new Notification("New Manifest!", {
                        body: "detected @"+current.toLocaleTimeString()+" \nVRID: "+vol.firstChild.dataset.vrid+"\nVolume on board: "+vol.textContent,
                        icon:"https://cdn1.iconfinder.com/data/icons/heavy-construction-machinery-trucks-and-tractors-e/16/32_semi-truck-512.png",
                        requireInteraction: true
                    });
                    notification.addEventListener("click", function() {
                        window.focus();
                    });
                } else {
                    console.log("notifications blocked on this browser");
                }
            });
        } else {
            console.log("\tThis browser does not support notifications.");
        }
    } else {
        console.log("\tConditions not met...cancelling Notification");
    }
    notifyMe.onclick = (event) => {
        window.focus();
    }
}



//search HTML in host page to look for VRID manifests
function fetchData() {
    console.log("fetching Data");
    let vol = document.getElementsByClassName("inTrailerP");
    console.log(vol)
    let dashboardElement=vol

    return dashboardElement;
}

function getVolumeData(vol){
    console.log("parsing volume data and checking for new manifests");
    const maxLength=30;
    console.log("current processed list: "+processed);
    for(let i=0; 1<vol.length; i++){
        console.log("checking: "+vol[i].firstChild.dataset.vrid);
        if(vol[i].outerText>0){//check if vol[i] is manifested
            console.log("\tManifested");
            console.log("\tchecking if processed=null");
            try{
                if(processed==null){
                    let processed=[];
                    }
            if(processed.length>0){//check if processed has any items in it
                console.log("\tprocessed has data")
                console.log("\tchecking if manifest is new")
                if(!processed.includes(vol[i].firstChild.dataset.vrid)){//check if vol[i] is in processed
                    console.log("checking if processed exceeds maximum");
                    if (processed.length > maxLength) {//check if processed is too long
                        console.log("processed list exceeded maximum");
                        processed.shift();
                        console.log("updated processed list: "+processed);
                    }
                    processed.push(vol[i].firstChild.dataset.vrid);
                    //console.log("processed: "+processed);
                    cacheProcessedArray(processed);
                    notifyMe(vol[i]);
                    setTimeout(displayPopup,500,vol[i]);
                }else{//if vol[i] is inside processed
                    console.log("\t\talready posted");
                }
            }else{//continue if processed==null
                processed.push(vol[i].firstChild.dataset.vrid);
                console.log("processed was empty");
                console.log("Updated Processed list: "+processed);
                cacheProcessedArray(processed);
                window.focus();
                notifyMe(vol[i]);
                setTimeout(displayPopup,500,vol[i]);
            }
        } catch(err){
            let processed=[];
            processed.push(vol[i].firstChild.dataset.vrid);
            console.log("processed list was broken");
            console.log("Updated Processed List: "+processed);
            cacheProcessedArray(processed);
            window.focus();
            notifyMe(vol[i]);
            setTimeout(displayPopup,500,vol[i]);
        }
        } else{//vol[i] is not manifested
            console.log("\tnot manifested");
        }
    }
}