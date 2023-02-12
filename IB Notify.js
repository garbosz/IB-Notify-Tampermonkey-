// ==UserScript==
// @name         IB Notify(beta)
// @namespace    trans-logistics.amazon.com
// @version      0.6
// @description  pop up notification for new manifests to prevent user from missing important updates
// @author       garbosz@
// @match        https://trans-logistics.amazon.com/ssp/dock/*
// @match        https://trans-logistics-eu.amazon.com/ssp/dock/*
// @match        https://trans-logistics.amazon.com/ssp/dock/ib
// @grant        GM_notification
// @grant        GM_addStyle
// @run-at document-end
// ==/UserScript==

// wait 5 seconds to let IB load data
setTimeout(init(), 5000);

//run at start
function init(){
    console.log("waited patiently");
}

//create trouble shooting buttons
let processed=[];
var resetButton = document.createElement("button");
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
    console.log("Processed array reset to empty:", processed);
});

var testButton = document.createElement("button");
testButton.innerHTML = "Test Notification";
testButton.style.padding = "10px 20px";
testButton.style.backgroundColor = "#4CAF50";
testButton.style.color = "white";
testButton.style.border = "none";
testButton.style.borderRadius = "4px";
testButton.style.cursor = "pointer";
document.body.appendChild(testButton);

testButton.addEventListener("click", function () {
    var current=new Date();
    console.log("IB Notify triggered manually @ "+current.toLocaleTimeString());
    var dataTable = fetchData();//get data build table
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
    var current=new Date();
    console.log("running IB Notify init @ "+current.toLocaleTimeString());
    var dataTable = fetchData();//get data build table
    if(dataTable.length ==0){//catch for if fetchdata is run before page can finish loading data
        console.log("fetched data was zero length, waiting and trying again");
        setTimeout(() => {
            console.log("trying fetchData again.");
            dataTable=fetchData();
        }, "1000")
    }
    getVolumeData(dataTable)//chug through data if new manifest found, add to blacklist and call popup
}, 5000); // 5 seconds in milliseconds

//this is the function called based on the refresh timer built into the page
function hostTrigger() {
    var current=new Date();
    console.log("IB Notify triggered by Host @ "+current.toLocaleTimeString());
    var dataTable = fetchData();//get data build table
    if(dataTable.length ==0){//catch for if fetchdata is run before page can finish loading data
        console.log("fetched data was zero length, waiting and trying again");
        setTimeout(() => {
            console.log("trying fetchData again.");
            dataTable=fetchData();
        }, "1000")
    }
    getVolumeData(dataTable)//chug through data if new manifest found, add to blacklist and call popup
}

// checks every 60 seconds to see if refresh timer is in the final 60 seconds, and then waits 70 seconds before calling the hostTrigger function
setInterval(function() {
    console.log("checking for final minute");
    var xpath = "//*[@class='redText']";
    var result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    if (result.singleNodeValue) {
        console.log("Timer Resetting soon, prepping IB Notify for new data");
        setTimeout(hostTrigger, 70 * 1000);
    }
}, 60 * 1000);

//this handles making the popup on the page, NOTE; it will pause execution on the rest of the page until dismissed
function displayPopup(vol) {
    console.log("checking Popup");
    if(vol.textContent > 0){
        console.log("conditions met...posting");
        var current = new Date();
        alert("New Manifest! @"+current.toLocaleTimeString()+"\nVRID: "+vol.firstChild.dataset.vrid+"\nVolume on board: "+vol.textContent);
    } else {
        console.log("conditions not met...cancelling popup");
    }
}

//this handles creating the system notification, NOTE: notification API not fully supported by firefox. chrome or Edge is recommended
function notifyMe(vol) {
    console.log("checking Notification");
    if(vol.textContent > 0){
        console.log("conditions met...posting");
        var current = new Date();
        if ('Notification' in window) {
            Notification.requestPermission().then(function(permission) {
                if (permission === "granted") {
                    var notification = new Notification("New Manifest!", {
                        body: "detected @"+current.toLocaleTimeString()+" \nVRID: "+vol.firstChild.dataset.vrid+"\nVolume on board: "+vol.textContent,
                        icon:"https://cdn1.iconfinder.com/data/icons/heavy-construction-machinery-trucks-and-tractors-e/16/32_semi-truck-512.png",
                        requireInteraction: true
                    });
                    notification.addEventListener("click", function() {
                        window.focus();
                    });
                }
            });
        } else {
            console.log("This browser does not support notifications.");
        }
    } else {
        console.log("Conditions not met...cancelling Notification");
    }
}

//search HTML in host page to look for VRID manifests
function fetchData() {
    console.log("fetching Data");
    var vol = document.getElementsByClassName("inTrailerP");
    console.log(vol)
    var dashboardElement=vol

    return dashboardElement;
}

//parse data and find if there is a VRID that is both manifested and not in the processed blacklist
function getVolumeData(vol) {
    console.log("getting volume data and checking for manifests");
    let output = [];
    const maxLength = 30;
    for (let i = 0; i < vol.length; i++) {
        console.log("checking: "+vol[i].firstChild.dataset.vrid);
        if (vol[i].textContent.trim() > 0 && !processed.includes(vol[i].firstChild.dataset.vrid)) {
            console.log(vol[i].firstChild.dataset.vrid+" passed");
            output.push([vol[i].firstChild.dataset.vrid, vol[i].textContent.trim()]);
            processed.push(vol[i].firstChild.dataset.vrid);
            console.log(vol[i]);
            if (processed.length > maxLength) {
                console.log("processed list exceeded maximum");
                processed.shift();
                console.log(processed);
            }
            notifyMe(vol[i]);
            setTimeout(300);
            window.focus();
            setTimeout(displayPopup,500,vol[i]);
            break;
        }
    }
}
