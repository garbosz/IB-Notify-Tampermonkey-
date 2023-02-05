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
let processed=[];
  var button = document.createElement("button");
  button.innerHTML = "Reset";
  button.style.padding = "10px 20px";
  button.style.backgroundColor = "#4CAF50";
  button.style.color = "white";
  button.style.border = "none";
  button.style.borderRadius = "4px";
  button.style.cursor = "pointer";
  document.body.appendChild(button);

  button.addEventListener ("click", function() {
    processed = [];
    console.log("Processed array reset to empty:", processed);
  });
// Function to display the pop-up dialog box
setTimeout(5000);

function displayPopup(vol) {
    if(vol.textContent > 0){
    var current = new Date()
  alert("New Manifest! @"+current.toLocaleTimeString()+"\nVRID: "+vol.firstChild.dataset.vrid+"\nVolume on board: "+vol.textContent);
    }
}

function fetchData() {
  var vol = document.getElementsByClassName("inTrailerP");
    console.log(vol)
    console.log(vol[0].textContent)//this is the volume
    console.log(vol[0].firstChild.dataset.vrid)//this is the VRID
 var dashboardElement=vol

  return dashboardElement;
}

function getVolumeData(vol) {
  let output = [];
  const maxLength = 30;
  for (let i = 0; i < vol.length; i++) {
    if (vol[i].textContent.trim().length > 0 && !processed.includes(vol[i])) {
      output.push([vol[i].firstChild.dataset.vrid, vol[i].textContent.trim()]);
      processed.push(vol[i]);
        console.log(vol[i]);
      if (processed.length > maxLength) {
        processed.shift();
      }
      displayPopup(vol[i]);
    }
  }
  return output;
}


// Fetch the data every 5 minutes
setInterval(function() {
  var dataTable = fetchData();//get data build table
  getVolumeData(dataTable)//chug through data if new manifest found, add to blacklist and call popup
}, 300000); // 5 minutes in milliseconds
//}, 3000); // 3 seconds in milliseconds for testing


// Focus the tab and display the pop-up dialog box
window.focus();
//displayPopup();
