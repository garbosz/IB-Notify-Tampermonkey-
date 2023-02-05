// ==UserScript==
// @name         IB Notify
// @namespace    trans-logistics.amazon.com
// @version      0.1
// @description  pop up notification for new manifests to prevent user from missing important updates
// @author       garbosz@
// @match        https://trans-logistics.amazon.com/ssp/dock/*
// @match        https://trans-logistics-eu.amazon.com/ssp/dock/*
// @match        https://trans-logistics.amazon.com/ssp/dock/ib
// @grant        GM_notification
// @run-at document-end
// ==/UserScript==

// Function to display the pop-up dialog box
setTimeout(5000);
function displayPopup(data) {
    var current = new Date()
  alert("New Manifest! @"+current.toLocaleTimeString()+"\nVRID: "+data[0]+"\nVolume on board: "+data[1]);
}

function fetchData() {
  var vol = document.getElementsByClassName("inTrailerP");
    console.log(vol)
    console.log(vol[0].textContent)//this is the volume
    console.log(vol[0].firstChild.dataset.vrid)//this is the VRID
 var dashboardElement=vol[0].innerHTML

  return dashboardElement;
}

function findNew(data){
   var message=data
    return message
}

// Fetch the data every 5 minutes
setInterval(function() {
  var dataTable = fetchData();//get data build table
  findNew(dataTable)//chug through data if new manifest found, add to blacklist and call popup
}, 300000); // 5 minutes in milliseconds
//}, 3000); // 3 seconds in milliseconds for testing


// Focus the tab and display the pop-up dialog box
window.focus();
//displayPopup();
